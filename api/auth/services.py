from dj_rest_auth.jwt_auth import set_jwt_cookies
from django.conf import settings
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.settings import api_settings as jwt_settings
from api.auth.serializers import LoginResponseSerializer
from rest_framework import status
from django.utils.translation import gettext_lazy as _
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from users.models import CustomUser, UserType


User: UserType = get_user_model()


class DemoLoginService:
    response_serializer = LoginResponseSerializer

    def __init__(self, request):
        self.request = request

    def _authenticate(self, **kwargs):
        return authenticate(self.request, **kwargs)

    def __user_tokens(self, user) -> tuple[str, str]:
        refresh: RefreshToken = RefreshToken.for_user(user)
        return refresh.access_token, str(refresh)

    def response(self, user):
        access_token, refresh_token = self.__user_tokens(user)
        access_token_expiration = timezone.now() + jwt_settings.ACCESS_TOKEN_LIFETIME
        refresh_token_expiration = timezone.now() + jwt_settings.REFRESH_TOKEN_LIFETIME
        return_expiration_times = getattr(settings, "JWT_AUTH_RETURN_EXPIRATION", False)
        data = {
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
        if return_expiration_times:
            data["access_token_expiration"] = access_token_expiration
            data["refresh_token_expiration"] = refresh_token_expiration
        serializer = self.response_serializer(data)
        response = Response(serializer.data, status=HTTP_200_OK)
        set_jwt_cookies(response, access_token, refresh_token)
        return response


class LoginService:
    response_serializer = LoginResponseSerializer

    def __init__(self, request):
        self.request = request

    def _authenticate(self, **kwargs):
        return authenticate(self.request, **kwargs)

    def validate(self, email: str, password: str):
        user = self._authenticate(email=email, password=password)
        if not user:
            raise ValidationError("Wrong email or password")
        return user

    def __user_tokens(self, user) -> tuple[str, str]:
        refresh: RefreshToken = RefreshToken.for_user(user)
        return refresh.access_token, str(refresh)

    def response(self, user):
        access_token, refresh_token = self.__user_tokens(user)
        access_token_expiration = timezone.now() + jwt_settings.ACCESS_TOKEN_LIFETIME
        refresh_token_expiration = timezone.now() + jwt_settings.REFRESH_TOKEN_LIFETIME
        return_expiration_times = getattr(settings, "JWT_AUTH_RETURN_EXPIRATION", False)
        data = {
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
        if return_expiration_times:
            data["access_token_expiration"] = access_token_expiration
            data["refresh_token_expiration"] = refresh_token_expiration
        serializer = self.response_serializer(data)
        response = Response(serializer.data, status=HTTP_200_OK)
        set_jwt_cookies(response, access_token, refresh_token)
        return response


def full_logout(request):
    response = Response(
        {"detail": _("Successfully logged out.")}, status=status.HTTP_200_OK
    )
    if cookie_name := getattr(settings, "JWT_AUTH_COOKIE", None):
        response.delete_cookie(cookie_name)
    refresh_cookie_name = getattr(settings, "JWT_AUTH_REFRESH_COOKIE", None)
    if refresh_cookie_name:
        response.delete_cookie(refresh_cookie_name)
    return response


class ActivationAndPasswordService:
    def check_email_link(self, uid: str, token: str):
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(id=user_id)
        if not default_token_generator.check_token(user, token):
            raise ValidationError(
                "Token is invalid or expired. Please request another confirmation email by signing in.",
            )
        return user


class PasswordService(ActivationAndPasswordService):
    def set_new_password(self, user: CustomUser, password: str):
        user.set_password(password)
        user.save(update_fields=["password"])


class ActivationService(ActivationAndPasswordService):
    def check_email_link(self, uid: str, token: str):
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(id=user_id)
        if not default_token_generator.check_token(user, token):
            raise ValidationError(
                "Token is invalid or expired. Please request another confirmation email by signing in.",
            )
        return user

    def set_active(self, user: CustomUser):
        user.is_active = True
        user.save()


### MOVED TO NOTIFICATIONS ###

# class EmailService:
#     def send_password_reset(self, user, current_site):
#         send_information_email.delay(
#             subject="Password recovery",
#             template_name="emails/set_new_password.html",
#             context={
#                 "user": user.email,
#                 "domain": current_site.domain,
#                 "uid": urlsafe_base64_encode(force_bytes(user.id)),
#                 "token": default_token_generator.make_token(user),
#             },
#             to_email=user.email,
#             letter_language="en",
#         )

#     def send_activation_link(self, user, current_site):
#         send_information_email.delay(
#             subject="Confirm registration",
#             template_name="emails/email_confirmation.html",
#             context={
#                 "user": user.email,
#                 "domain": current_site.domain,
#                 "uid": urlsafe_base64_encode(force_bytes(user.id)),
#                 "token": default_token_generator.make_token(user),
#             },
#             to_email=user.email,
#             letter_language="en",
#         )
