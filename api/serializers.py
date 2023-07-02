from dataclasses import fields
from rest_framework import serializers
from core.models import Book, Quote, Orders
from users.models import CustomUser


class BookSerializer(serializers.ModelSerializer):
    quotes_count = serializers.IntegerField()
    book_id = serializers.IntegerField(source="id")

    class Meta:
        model = Book
        fields = ["title", "visibility", "owner", "quotes_count", "book_id"]


class UserSerializer(serializers.ModelSerializer):
    # id = serializers.IntegerField()
    # send_emails = serializers.IntegerField()
    # send_telegrams = serializers.IntegerField()
    class Meta:
        model = CustomUser
        fields = ["send_emails", "send_telegrams"]


class UpdateUserSerializer(serializers.Serializer):
    send_emails = serializers.IntegerField()
    send_telegrams = serializers.IntegerField()


class QuoteSerializer(serializers.ModelSerializer):
    book = serializers.CharField(source="book.title")
    book_id = serializers.IntegerField(source="book.id")
    quote_id = serializers.IntegerField(source="id")
    cover = serializers.CharField(source="book.cover")

    class Meta:
        model = Quote
        fields = [
            "book",
            "book_id",
            "cover",
            "date_added",
            "text",
            "like",
            "quote_id",
            "comment",
        ]


class QuoteUpdateSerializer(serializers.ModelSerializer):
    quote_id = serializers.IntegerField(source="id")

    class Meta:
        model = Quote
        fields = ["quote_id", "text", "comment"]


# class UserUpdateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CustomUser
#         fields = ["paid", "paid_start", "paid_end"]

#     def update(self, instance, validated_data):
#         if self.context["request"].user.paid:
#             return instance
#         self.paid_start = datetime.now()
#         self.paid_end = datetime.now()
#         self.paid = True
#         return super().update(instance, validated_data)


class OrdersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orders
        fields = ["order_type", "subscription_period", "payment_date"]


class ActivateTelegramUserSerializer(serializers.Serializer):
    telegram_key = serializers.CharField()
    telegram_id = serializers.IntegerField()
