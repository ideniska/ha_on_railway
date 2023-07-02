from django.contrib import admin
from .models import UserFile, Book, Quote, Orders

admin.site.register(UserFile)
admin.site.register(Book)
admin.site.register(Quote)
admin.site.register(Orders)
