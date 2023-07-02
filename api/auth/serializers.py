from dataclasses import fields
from operator import imod
from rest_framework import serializers
from users.models import CustomUser
from core.models import UserFile
from django.contrib.auth.password_validation import validate_password
from django.utils.text import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from core.models import UserFile, FileType
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings
from core.kindle_parser import start_kindle_parser
from core.tasks import celery_start_kindle_parser
from faker import Faker


fake_data = Faker()


class SignInSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=4)


class ActivationSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()


class DemoSignUpSerializer(serializers.Serializer):
    # email = serializers.EmailField()

    def save(self):
        fake_email = fake_data.email()
        user, created = CustomUser.objects.get_or_create(
            email=fake_email,
            username=fake_email,
            is_demo=True,
            defaults={
                "password": fake_data.password(),
                "is_active": True,
            },
        )
        return user


class RestorePasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, email: str):
        user = CustomUser.objects.filter(email=email)
        if not user:
            raise serializers.ValidationError("User with this email do not exists.")
        return email

    def save(self):
        user = CustomUser.objects.get(email=self.validated_data["email"])
        return user


class SignUpSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={"input_type:": "password"}, min_length=8)
    password2 = serializers.CharField()

    def validate_email(self, email: str):
        user = CustomUser.objects.filter(email=email)
        if user:
            raise serializers.ValidationError("User with this email already exists.")
        return email

    def validate_password(self, password: str):
        validate_password(password)
        return password

    def validate(self, attrs: dict):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def save(self):
        user = CustomUser.objects.create_user(
            email=self.validated_data["email"],
            username=self.validated_data["email"],
            password=self.validated_data["password"],
        )

        # user.set_password(password)
        user.is_active = False
        user.save()
        return user


class SetPasswordSerializer(ActivationSerializer):
    password = serializers.CharField(style={"input_type:": "password"}, min_length=8)
    password2 = serializers.CharField()

    def validate_password(self, password: str):
        validate_password(password)
        return password

    def validate(self, attrs: dict):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs


class LoginResponseSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    access_token_expiration = serializers.DateTimeField(required=False)
    refresh_token_expiration = serializers.DateTimeField(required=False)


class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    default_error_messages = {"bad_token": _("Token is invalid or expired")}

    def save(self, **kwargs):
        try:
            RefreshToken(self.validated_data["refresh"]).blacklist()
        except TokenError:
            self.fail("bad_token")


# def upload_file_path(obj: "UserFile", filename):
#     return f"user_files/{obj.owner_id}/{obj.type}/{filename}"


class UploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFile
        fields = [
            "file",
            "type",
        ]

    def validate(self, attrs):
        quote_type: FileType = attrs["type"]
        file: InMemoryUploadedFile = attrs["file"]
        # print(file.content_type)
        # print(file.name)
        # print(file.size / (1024 * 1024))
        size = file.size / (1024 * 1024)

        # File size limit is in settings.py
        if size > settings.FILE_SIZE_LIMIT:
            raise serializers.ValidationError("File size limit is 100 Mb")

        if quote_type != "kindle":
            raise serializers.ValidationError(
                {"type": "Sorry, currently we don't support other file formats."}
            )

        if ".txt" not in file.name:
            print("Wront file type, please choose kindle txt file")
            raise serializers.ValidationError(
                "Wront file type, please choose a kindle txt file."
            )
        print(attrs)
        return attrs

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        instance: UserFile = super().create(validated_data)
        celery_start_kindle_parser.apply_async(kwargs={"userfile_id": instance.id})

        # start_kindle_parser(instance)

        return instance
