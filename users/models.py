from email.policy import default
from enum import unique
from typing import TypeVar
from django.contrib.auth.models import AbstractUser
from django.core import signing
from django.db import models
from .managers import UserManager
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

UserType = TypeVar("UserType", bound="CustomUser")


class NotificationSetting(models.IntegerChoices):
    DAILY = (1, "Daily")
    WEEKLY = (2, "Weekly")
    DISABLED = (3, "Disabled")


class DemoUserData(models.Model):
    ip_address = models.GenericIPAddressField()
    user = models.OneToOneField(
        "CustomUser", on_delete=models.CASCADE, related_name="demo_user"
    )


class CustomUser(AbstractUser):
    # username = None  # type: ignore
    email = models.EmailField("Email address", unique=True)
    telegram_id = models.IntegerField(null=True, blank=True, unique=True)
    active_subscription = models.BooleanField(default=False)
    trial_used = models.BooleanField(default=False)
    paid_until = models.DateTimeField(null=True, blank=True)
    is_demo = models.BooleanField(default=False)
    stripe_session_id = models.CharField(
        max_length=150, null=True, blank=True, unique=True
    )
    send_emails = models.PositiveSmallIntegerField(
        default=NotificationSetting.DAILY, choices=NotificationSetting.choices
    )
    send_telegrams = models.PositiveSmallIntegerField(
        default=NotificationSetting.DISABLED, choices=NotificationSetting.choices
    )
    USERNAME_FIELD: str = "email"
    REQUIRED_FIELDS: list[str] = []
    objects = UserManager()  # type: ignore

    def __str__(self):
        return self.email

    @property
    def telegram_key(self):
        # return signing.dumps(self.email)
        return urlsafe_base64_encode(force_bytes(self.email))

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
