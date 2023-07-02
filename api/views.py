import re
from urllib import request, response
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, mixins, permissions, authentication, viewsets
from api.auth.serializers import UploadSerializer
from core.models import Book, Quote
from .serializers import (
    ActivateTelegramUserSerializer,
    BookSerializer,
    QuoteSerializer,
    QuoteUpdateSerializer,
    OrdersSerializer,
    UserSerializer,
)
from users.models import CustomUser
from core.models import Orders

from core.pagination import BasePageNumberPagination
from django.db.models import Count, Q
from django.core.exceptions import ValidationError
from django.http import Http404
from django.shortcuts import get_object_or_404 as _get_object_or_404
from rest_framework.generics import GenericAPIView
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from core.tasks import celery_stop_membership

from .services import (
    ActivateTelegramUserService,
    ChangeQuoteLikeStatusService,
    pick_random_quote_id,
    pick_random_quote_id_demo,
    ActivateTrialService,
    ChangeBookVisibilityService,
    GetDailyQuotesQueryset,
    ChangeUserSettingsService,
)


def get_object_or_404(queryset, *filter_args, **filter_kwargs):
    """
    Same as Django's standard shortcut, but make sure to also raise 404
    if the filter_kwargs don't match the required types.
    """
    try:
        return _get_object_or_404(queryset, *filter_args, **filter_kwargs)
    except (TypeError, ValueError, ValidationError):
        raise Http404


class ActivateTrialApiView(APIView):
    def get(self, request):
        service = ActivateTrialService()
        response = service.activate_trial(request.user)
        return response


class BookListAPIView(
    generics.ListCreateAPIView,
):
    serializer_class = BookSerializer
    pagination_class = BasePageNumberPagination

    def get_queryset(self):
        if not self.request.user.is_demo:
            queryset = (
                Book.objects.filter(owner=self.request.user)
                .annotate(
                    quotes_count=Count("quotes"),
                    liked_quotes_count=Count("quotes", filter=Q(quotes__like=True)),
                )
                .order_by("-quotes_count")
            )
        else:
            queryset = (
                Book.objects.filter(owner__is_demo=True)
                .annotate(
                    quotes_count=Count("quotes"),
                    liked_quotes_count=Count("quotes", filter=Q(quotes__like=True)),
                )
                .order_by("-quotes_count")
            )

        return queryset


class BookDetailAPIView(generics.RetrieveAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_queryset(self):
        if self.request.user.is_demo:
            queryset = (
                Book.objects.filter(owner__is_demo=True)
                .annotate(quotes_count=Count("quotes"))
                .order_by("-quotes_count")
            )
        else:
            queryset = (
                Book.objects.filter(owner=self.request.user)
                .annotate(quotes_count=Count("quotes"))
                .order_by("-quotes_count")
            )
        return queryset


class BookVisibilityView(generics.GenericAPIView):
    serializer_class = BookSerializer
    queryset = Book.objects.all()

    def post(self, request, pk: int):
        service = ChangeBookVisibilityService()
        response = service.change_book_visibility(pk)
        return response


class LastOrderAPIView(
    generics.ListCreateAPIView,
):
    serializer_class = OrdersSerializer

    def get_queryset(self):
        queryset = Orders.objects.filter(user=self.request.user)
        return queryset


class NotificationsSettingsApiView(generics.GenericAPIView):
    serializer_class = UserSerializer

    def get(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = ChangeUserSettingsService()
        service.change_notification_settings(request.user)
        return Response({"detail": True})


class QuoteShareView(generics.RetrieveAPIView):
    serializer_class = QuoteSerializer
    queryset = Quote.objects.all()
    permission_classes = (AllowAny,)

    # def get_queryset(self):
    #     queryset = Quote.objects.filter(owner=self.request.user)
    #     return queryset


class QuoteLikeView(generics.GenericAPIView):
    serializer_class = QuoteSerializer
    queryset = Quote.objects.all()

    def post(self, request, pk: int):
        service = ChangeQuoteLikeStatusService()
        response = service.change_quote_like_status(pk)
        return response


class QuoteViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = QuoteSerializer
    pagination_class = BasePageNumberPagination

    def get_queryset(self):
        if not self.request.user.is_demo:
            qs = Quote.objects.filter(owner=self.request.user)

            # RandomServerQuoteAPIView
            if self.action == "get_random":
                return qs.filter(id=pick_random_quote_id(self.request.user))

            # FavoriteQuotesAPIView
            if self.action == "get_favorites":
                return qs.filter(like=True)

            if self.action == "get_daily":
                service = GetDailyQuotesQueryset()
                queryset = service.get_daily_quotes_queryset(self.request.user)
                return queryset
        else:
            qs = Quote.objects.filter(owner__is_demo=True)

            # RandomServerQuoteAPIView
            if self.action == "get_random":
                return qs.filter(id=pick_random_quote_id_demo())

            # FavoriteQuotesAPIView
            if self.action == "get_favorites":
                return qs.filter(like=True)

            if self.action == "get_daily":
                service = GetDailyQuotesQueryset()
                queryset = service.get_daily_quotes_queryset(self.request.user)
                return queryset

    # QuoteLikeView
    @action(detail=True, methods=["post"], url_name="like")
    def like(self, request, pk: int):
        service = ChangeQuoteLikeStatusService()
        response = service.change_quote_like_status(pk)
        return response

    # Get liked quotes
    @action(detail=False, methods=["get"], url_path="liked")
    def get_favorites(self, request):
        return self.list(request)

    # Fix to get one quote instead of list
    # RandomServerQuoteAPIView
    @action(detail=False, methods=["get"], url_path="random")
    def get_random(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset.first())
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="daily")
    def get_daily(self, request):
        return self.list(request)


class QuotesFromBookAPIView(generics.ListAPIView):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    pagination_class = BasePageNumberPagination

    def get_queryset(self):
        if self.request.user.is_demo:
            qs = (
                super()
                .get_queryset()
                .filter(owner__is_demo=True)
                .filter(book_id=self.kwargs["pk"])
            )
        else:
            qs = (
                super()
                .get_queryset()
                .filter(owner=self.request.user)
                .filter(book_id=self.kwargs["pk"])
            )
        return qs


class QuoteLikeUpdateDeleteViewset(viewsets.ModelViewSet):
    queryset = Quote.objects.all()

    def get_serializer_class(self):
        if self.action == "destroy":
            return QuoteSerializer
        if self.action == "update":
            return QuoteUpdateSerializer


class UploadApiView(GenericAPIView):
    parser_classes = [MultiPartParser]
    serializer_class = UploadSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


# !MOVED TO A VIEWSET ------------------------------------------------------------

# class DailyTenAPIView(
#     generics.ListCreateAPIView,
# ):

#     serializer_class = QuoteSerializer

#     def get_queryset(self):
#         service = GetDailyQuotesQueryset()
#         queryset = service.get_daily_quotes_queryset(self.request.user)
#         return queryset

# class FavoriteQuotesAPIView(
#     generics.ListCreateAPIView,
# ):
#     serializer_class = QuoteSerializer

#     def get_queryset(self):
#         queryset = Quote.objects.filter(owner=self.request.user).filter(like=True)
#         return queryset


# class QuoteDeleteView(generics.DestroyAPIView):
#     serializer_class = QuoteSerializer
#     queryset = Quote.objects.all()
#     lookup_field = "pk"

#     def perform_destroy(self, instance):
#         # instance
#         super().perform_destroy(instance)


# class QuoteUpdateView(generics.UpdateAPIView):
#     serializer_class = QuoteUpdateSerializer
#     queryset = Quote.objects.all()
#     lookup_field = "pk"


# class RandomServerQuoteAPIView(
#     generics.ListAPIView,
# ):
#     serializer_class = QuoteSerializer

#     def get_queryset(self):
#         return Quote.objects.filter(owner=self.request.user).filter(
#             id=pick_random_quote_id(self.request.user)
#         )
