import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")

app = Celery("project")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


app.conf.beat_schedule = {
    "send-daily-emails": {
        "task": "core.tasks.daily_email",
        "schedule": crontab(minute=0, hour=8),
    },
    "send-weekly-emails": {
        "task": "core.tasks.weekly_email",
        "schedule": crontab(minute=0, hour=8, day_of_week="monday"),
    },
}
