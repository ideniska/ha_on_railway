from mysite.celery import app
from os import path
from smtplib import SMTPRecipientsRefused
from typing import Any, Optional

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template import loader
from django.utils.translation import activate
from core.get_book_covers import get_book_covers
from core.kindle_parser import start_kindle_parser
from core.models import Quote, UserFile, CustomUser, Orders
from api.services import GetDailyQuotesQueryset
from users.models import NotificationSetting
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)

YOUR_DOMAIN = settings.YOUR_DOMAIN


@app.task
def celery_stop_membership(user_id):
    user = CustomUser.objects.get(id=user_id)
    user.active_subscription = False
    user.trial_used = True
    user.save()
    order = Orders.objects.filter(user_id=user_id).last()
    order.payment_status = "Canceled"
    order.save()


@app.task
def celery_get_book_covers(user_id):
    get_book_covers(user_id)


@app.task
def celery_start_kindle_parser(userfile_id: int):
    userfile = UserFile.objects.get(id=userfile_id)
    start_kindle_parser(userfile)


class SendingEmailTaskArgs(app.Task):
    autoretry_for = (SMTPRecipientsRefused, ConnectionRefusedError)
    retry_kwargs = {"max_retries": 5}
    retry_backoff = 5
    retry_jitter = True


@app.task(name="email.send_information_email", base=SendingEmailTaskArgs)
def send_information_email(
    *,
    subject: str,
    template_name: str,
    context: dict,
    to_email: list[str] | str,
    letter_language: str = "en",
    **kwargs: Optional[Any],
) -> bool:
    """
    :param subject: email subject
    :param template_name: template path to email template
    :param context: data what will be passed into email
    :param to_email: receiver email(s)
    :param letter_language: translate letter to selected lang
    :param kwargs: from_email, bcc, cc, reply_to and file_path params
    """
    activate(letter_language)
    _to_email: list[str] = [to_email] if isinstance(to_email, str) else to_email
    email_message = EmailMultiAlternatives(
        subject=subject,
        to=_to_email,
        from_email=kwargs.get("from_email"),
        bcc=kwargs.get("bcc"),
        cc=kwargs.get("cc"),
        reply_to=kwargs.get("reply_to"),
    )
    html_email: str = loader.render_to_string(template_name, context)
    email_message.attach_alternative(html_email, "text/html")
    if file_path := kwargs.get("file_path"):
        file_path = path.join(settings.BASE_DIR, file_path)
        email_message.attach_file(file_path, kwargs.get("mimetype"))
    email_message.send()
    return True


@app.task
def daily_email():
    users = CustomUser.objects.filter(send_emails=NotificationSetting.DAILY)
    for user in users:
        service = GetDailyQuotesQueryset()
        quotes = service.get_daily_quotes_queryset(user)
        quotes_list = list(quotes)
        if len(quotes_list) == 10:
            send_information_email(
                subject="Your daily highlights",
                template_name="emails/ten_highlights.html",
                context={
                    "user": user.email,
                    "domain": YOUR_DOMAIN,
                    "quote1": quotes_list[0].text,
                    "quote2": quotes_list[1].text,
                    "quote3": quotes_list[2].text,
                    "quote4": quotes_list[3].text,
                    "quote5": quotes_list[4].text,
                    "quote6": quotes_list[5].text,
                    "quote7": quotes_list[6].text,
                    "quote8": quotes_list[7].text,
                    "quote9": quotes_list[8].text,
                    "quote10": quotes_list[9].text,
                },
                to_email=user.email,
                letter_language="en",
            )


@app.task
def weekly_email():
    users = CustomUser.objects.filter(send_emails=NotificationSetting.WEEKLY)
    for user in users:
        service = GetDailyQuotesQueryset()
        quotes = service.get_daily_quotes_queryset(user)
        quotes_list = list(quotes)
        if len(quotes_list) == 10:
            send_information_email(
                subject="Your daily highlights",
                template_name="emails/ten_highlights.html",
                context={
                    "user": user.email,
                    "domain": YOUR_DOMAIN,
                    "quote1": quotes_list[0].text,
                    "quote2": quotes_list[1].text,
                    "quote3": quotes_list[2].text,
                    "quote4": quotes_list[3].text,
                    "quote5": quotes_list[4].text,
                    "quote6": quotes_list[5].text,
                    "quote7": quotes_list[6].text,
                    "quote8": quotes_list[7].text,
                    "quote9": quotes_list[8].text,
                    "quote10": quotes_list[9].text,
                },
                to_email=user.email,
                letter_language="en",
            )
