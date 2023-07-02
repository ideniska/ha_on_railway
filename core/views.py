from .pagination import PageNumberPagination
from .permissions import PaidUser
from .models import Orders, UserFile, Quote, Book
from .services import (
    CreateCheckoutSessionService,
    CreatePortalSessionService,
    StripeCheckPaymentService,
)
from api.serializers import BookSerializer
from core.tasks import celery_get_book_covers
from core.notifications import EmailService
from django.views.generic import TemplateView, DetailView
from django.views.generic.list import ListView
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.urls import reverse
from django.shortcuts import get_object_or_404, get_list_or_404
from django.contrib.auth import get_user_model
from django.db.models import Count
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from mysite.settings import YOUR_DOMAIN
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from typing import TypeVar


UserType = TypeVar("UserType", bound="CustomUser")
User = get_user_model()


class LandingPageView(TemplateView):
    template_name = "landing_page.html"


class TemplateAPIView(APIView):
    """Help to build CMS System using DRF, JWT and Cookies
    path('some-path/', TemplateAPIView.as_view(template_name='template.html'))
    """

    # # login_url = "/login/"
    # # redirect_field_name = "login"
    swagger_schema = None
    # permission_classes = (AllowAny,)
    renderer_classes = (JSONRenderer, TemplateHTMLRenderer)
    template_name: str = ""

    def get(self, request, *args, **kwargs):
        return Response()


class PageView(TemplateAPIView):
    permission_classes = (AllowAny,)


class AuthenticatedTemplateAPIView(TemplateAPIView):
    def dispatch(self, *args, **kwargs):
        a = super().dispatch(*args, **kwargs)
        if not self.request.user.is_authenticated:
            return redirect("landing")
        return a


class ByBookView(LoginRequiredMixin, ListView):
    template_name = "by_book.html"
    # model = Book
    context_object_name = "books"

    def get_queryset(self):
        return Book.objects.filter(owner=self.request.user).annotate(
            quotes_count=Count("quotes")
        )  # annotate creates a variable quotes_count for each book object and uses Count method to count related quotes


class ByTagView(LoginRequiredMixin, TemplateView):
    template_name = "by_tag.html"


class BooksTemplateAPIView(APIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    swagger_schema = None
    permission_classes = (AllowAny,)
    renderer_classes = (JSONRenderer, TemplateHTMLRenderer)
    template_name: str = ""
    pagination_class = PageNumberPagination

    def get(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response()

    @property
    def paginator(self):
        """
        The paginator instance associated with the view, or `None`.
        """
        if not hasattr(self, "_paginator"):
            if self.pagination_class is None:
                self._paginator = None
            else:
                self._paginator = self.pagination_class()
        return self._paginator

    def paginate_queryset(self, queryset):
        """
        Return a single page of results, or `None` if pagination is disabled.
        """
        if self.paginator is None:
            return None
        return self.paginator.paginate_queryset(queryset, self.request, view=self)

    def get_paginated_response(self, data):
        """
        Return a paginated style `Response` object for the given output data.
        """
        assert self.paginator is not None
        return self.paginator.get_paginated_response(data)


def book_inside_view(request, id):
    list_of_quotes = get_list_or_404(Quote, book=id)
    book_title = get_object_or_404(Book, id=id)
    context = {"quotes_by_book": list_of_quotes, "book_title": book_title.title}
    return render(request, "book_page.html", context)


class DashboardPageView(AuthenticatedTemplateAPIView):
    template_name: str = "dashboard_api.html"


class SettingsPageView(AuthenticatedTemplateAPIView):
    # permission_classes = (PaidUser,)
    template_name: str = "settings/subscription.html"


class UploadView(AuthenticatedTemplateAPIView):
    template_name: str = "upload.html"


###------------------------------- STRIPE -------------------------------###
class CreateCheckoutSessionView(APIView):
    def post(self, request, *args, **kwargs):
        service = CreateCheckoutSessionService()
        response = service.create_checkout_session(request)
        return response


class CreatePortalSessionView(APIView):
    def post(self, request, *args, **kwargs):
        service = CreatePortalSessionService()
        response = service.create_portal_session(request)
        return response


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhook(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        service = StripeCheckPaymentService()
        response = service.check_payment(request)
        return response
