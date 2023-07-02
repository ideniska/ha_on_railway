import random
from urllib import response
from api.serializers import UserSerializer, QuoteSerializer, BookSerializer
from core.models import Quote, Orders, Book
import datetime

# from core.tasks import celery_stop_membership
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from users.models import CustomUser, UserType
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound


User: UserType = get_user_model()


def pick_random_quote_id(user):
    id_list = Quote.objects.filter(owner=user, book__visibility=True).values_list(
        "id", flat=True
    )
    return random.choice(id_list)


def pick_random_quote_id_demo():
    id_list = Quote.objects.filter(
        owner__is_demo=True, book__visibility=True
    ).values_list("id", flat=True)
    return random.choice(id_list)


class ActivateTrialService:
    def activate_trial(self, user):
        if not user.active_subscription and not user.trial_used:
            user.active_subscription = True
            user.trial_used = True
            if user.paid_until == None:
                user.paid_until = timezone.now() + datetime.timedelta(days=14)
            else:
                user.paid_until += datetime.timedelta(days=14)
            order = Orders.objects.create(
                user=user,
                order_type="Trial",
                subscription_period=60,
                price=0,
                payment_date=timezone.now(),
                payment_status="active",
            )
            user.save()
            order.save()
            # celery_stop_membership.apply_async(
            #     kwargs={"user_id": user.id}, countdown=order.subscription_period
            # )
            return Response(status=status.HTTP_200_OK)
        return Response(
            {"Fail": "Trial already in use or finished"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class ActivateTelegramUserService:
    def check_telegram_link(self, telegram_key: str):
        decoded_email = force_str(urlsafe_base64_decode(telegram_key))
        user = User.objects.get(email=decoded_email)
        return user

    def save_telegram_id(self, user: CustomUser, telegram_id: str):
        user.telegram_id = telegram_id
        user.save()


class ChangeUserSettingsService:
    serializer = UserSerializer

    def change_notification_settings(self, user: CustomUser):
        user.send_emails = self.serializer.data["send_emails"]
        user.send_telegrams = self.serializer.data["send_telegrams"]
        user.save()


class ChangeQuoteLikeStatusService:
    def change_quote_like_status(self, pk: int):
        try:
            quote = Quote.objects.get(id=pk)
        except Quote.DoesNotExist:
            raise NotFound("Quote not found")

        # TODO rewrite via F expression
        quote.like = not quote.like
        quote.save()
        return Response({"detail": True})


class ChangeBookVisibilityService:
    def change_book_visibility(self, pk: int):
        try:
            book = Book.objects.get(id=pk)
        except Book.DoesNotExist:
            raise NotFound("Book not found")

        book.visibility = not book.visibility
        book.save()
        return Response({"detail": True})


class GetDailyQuotesQueryset:
    serializer_class = QuoteSerializer

    def get_daily_quotes_queryset(self, user):
        # list of liked quotes id's
        if user.is_demo:
            liked_quotes_id_list = list(
                Quote.objects.filter(owner__is_demo=True)
                .filter(like=True)
                .values_list("id", flat=True)
            )
        else:
            liked_quotes_id_list = list(
                Quote.objects.filter(owner=user)
                .filter(like=True)
                .values_list("id", flat=True)
            )

        liked_quotes_count = len(liked_quotes_id_list)

        # If user has less then 30 liked quotes we don't show them in daily review
        # because they will be shown too frequently
        if liked_quotes_count > 60:
            number_of_fav_quotes = 2

        elif 30 <= liked_quotes_count < 60:
            number_of_fav_quotes = 1

        else:
            number_of_fav_quotes = 0

        liked_random_quote_id_list = random.sample(
            liked_quotes_id_list, min(liked_quotes_count, number_of_fav_quotes)
        )

        if user.is_demo:
            queryset1 = Quote.objects.filter(owner__is_demo=True).filter(
                id__in=liked_random_quote_id_list
            )
            # list of all other quotes to show in daily review
            other_quotes_id_list = list(
                Quote.objects.filter(owner__is_demo=True).values_list("id", flat=True)
            )
        else:
            queryset1 = Quote.objects.filter(owner=user).filter(
                id__in=liked_random_quote_id_list
            )
            # list of all other quotes to show in daily review
            other_quotes_id_list = list(
                Quote.objects.filter(owner=user).values_list("id", flat=True)
            )

        number_of_quotes_to_show = 10 - number_of_fav_quotes
        random_quote_id_list = random.sample(
            other_quotes_id_list,
            min(len(other_quotes_id_list), number_of_quotes_to_show),
        )

        if user.is_demo:
            queryset2 = Quote.objects.filter(owner__is_demo=True).filter(
                id__in=random_quote_id_list
            )
        else:
            queryset2 = Quote.objects.filter(owner=user).filter(
                id__in=random_quote_id_list
            )

        queryset = queryset1.union(queryset2)
        return queryset
