from .models import Book, Quote
from django.contrib.auth import get_user_model
from core.models import UserFile


def start_kindle_parser(userfile: UserFile):
    user = userfile.owner
    file_path = userfile.file.path

    # --- KINDLE NOTES FILE PARSER --- #
    # Using notes_line_list to parse note line by line and create indexes of title, date, highlight text
    notes_line_list = []

    with open(file_path, "r", encoding="utf-8") as original:
        data = original.read()
    with open(file_path, "w", encoding="utf-8") as modified:
        modified.write("==========\n" + data)

    brake_index_list = []
    line_index = 0
    with open(file_path, "r", encoding="utf-8") as kindle_file:
        for line in kindle_file:
            if len(line) > 1:
                notes_line_list.append(line)
                line_index += 1

                # Kindle separates notes with ======, here we create an index list of all separator/brakes
                if "==========" in line:
                    brake_index_list.append(line_index)

    def find_2nd(
        string, substring
    ):  # I use this func to find second appearance of '|' symbol to slice date added string
        return string.find(substring, string.find(substring) + 1)

    cached_books: dict[str, Book] = {}
    bulk_quotes: list[Quote] = []
    # notes_sublist is an indexed list of notes, where each element is a book note as a list of lines
    # Append all notes between separators/brakes to notes_sublist, to have an indexed list of notes
    for i in range(len(brake_index_list) - 1):
        first_br_point = brake_index_list[
            i
        ]  # To find range between ===== which is an individual note contents
        second_br_point = brake_index_list[i + 1]
        notes_sublist = []
        for index in range(first_br_point, second_br_point):
            notes_sublist.append(notes_line_list[index])

        book_title = notes_sublist[0].split("(")[0].strip("\ufeff")
        author = notes_sublist[0].split("(")[1].strip()[:-1]

        if "," in author:
            author = author.replace(",", "")
        if notes_sublist[1].count("|") == 1:
            start_slice = notes_sublist[1].find("|") + 2
            stop_slice = None
        else:
            start_slice = find_2nd(notes_sublist[1], "|") + 2
            stop_slice = None

        date_added = notes_sublist[1][start_slice:stop_slice]
        quote = notes_sublist[2].strip("\xa0")

        if book_title not in cached_books:
            book_obj = Book.objects.create(title=book_title, author=author, owner=user)
            cached_books[book_title] = book_obj
        else:
            book_obj = cached_books[book_title]

        quote_obj = Quote(
            date_added=date_added,
            text=quote,
            book=book_obj,
            owner=user,
        )
        bulk_quotes.append(quote_obj)

    Quote.objects.bulk_create(bulk_quotes)


# TODO Quote.objects.values_list("id", "text")
