from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register("q", views.QuoteLikeUpdateDeleteViewset, basename="quotes")
router.register("q2", views.QuoteViewSet, basename="quotes2")

urlpatterns = [
    path("", include(router.urls)),
    path("by-book/", views.BookListAPIView.as_view(), name="by_book"),
    path("by-book/<int:pk>/", views.QuotesFromBookAPIView.as_view(), name="book_page"),
    path(
        "book/<int:pk>/visibility/",
        views.BookVisibilityView.as_view(),
        name="book_visibility",
    ),
    path("orders/", views.LastOrderAPIView.as_view(), name="last_order"),
    path("", include("api.auth.urls")),
    # path("telegram/", include("api.telegram.urls")),
    path("upload/", views.UploadApiView.as_view(), name="upload_file"),
    path(
        "user/trial/",
        views.ActivateTrialApiView.as_view(),
        name="trial_activate",
    ),
    path(
        "notifications-settings/",
        views.NotificationsSettingsApiView.as_view(),
        name="notifications_settings",
    ),
    path("share/<int:pk>/", views.QuoteShareView.as_view(), name="share"),
    # MOVED TO VIEWSET
    # path("quote/<int:pk>/like/", views.QuoteLikeView.as_view(), name="quote_like"),
    # path(
    #     "quote/<int:pk>/delete/", views.QuoteDeleteView.as_view(), name="quote_delete"
    # ),
    # path(
    #     "quote/<int:pk>/update/", views.QuoteUpdateView.as_view(), name="quote_update"
    # ),
    # path("random/", views.RandomServerQuoteAPIView.as_view(), name="random_quote"),
    # path("favorites/", views.FavoriteQuotesAPIView.as_view(), name="favorite_quote"),
    # path("daily/", views.DailyTenAPIView.as_view(), name="daily_quotes"),
]
