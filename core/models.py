from email.policy import default
from operator import mod
from sqlite3 import Timestamp
from django.db import models
from django.conf import settings
from users.models import CustomUser
from django.contrib.auth import get_user_model


User = get_user_model()


class FileType(models.TextChoices):
    KINDLE = ("kindle", "Kindle")
    OTHER = ("other", "Other")


def upload_file_path(obj: "UserFile", filename):
    return f"user_files/{obj.owner_id}/{obj.type}/{filename}"


class UserFile(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_files")
    file = models.FileField("", upload_to=upload_file_path)
    type = models.CharField(choices=FileType.choices, max_length=30)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class Book(models.Model):
    title = models.CharField(max_length=350)
    author = models.CharField(max_length=350, default="")
    visibility = models.BooleanField(default=True)
    cover = models.CharField(max_length=150, default="")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="books")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["title", "owner"], name="Unique book title for each user"
            )
        ]

    def __str__(self):
        return self.title


class Quote(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="quotes")
    date_added = models.CharField(max_length=250)
    text = models.TextField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quotes")
    like = models.BooleanField(default=False)
    comment = models.TextField(default="")


class Orders(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    order_type = models.CharField(max_length=15)  # Trial / Subscription
    subscription_period = (
        models.IntegerField()
    )  # trial = 14 days, stripe = 30 days / 365 days
    price = models.DecimalField(max_digits=10, decimal_places=3)
    payment_date = (
        models.DateTimeField()
    )  # for trial = trial_start_date, for stripe = subscription_start_date
    payment_status = models.CharField(max_length=15)  # Active / Incomplete / Canceled
