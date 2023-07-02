from .models import Book
import requests


def get_book_covers(user_id):
    for book_obj in Book.objects.filter(owner=user_id):
        cover_request = requests.get(
            "https://bookcoverapi.herokuapp.com/bookcover?book_title="
            + book_obj.title.replace(" ", "+")
            + "&author_name="
            + book_obj.author.replace(" ", "+")
        ).json()
        book_cover_url = ""
        if cover_request["status"] == "success":
            book_cover_url = cover_request["url"]

        # print("book_cover_url ->", book_cover_url)
        book_obj.cover = book_cover_url
        book_obj.save()
