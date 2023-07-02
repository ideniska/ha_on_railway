from .models import Book, Quote
from core.models import UserFile


def start_kindle_parser(userfile: UserFile):
    user = userfile.owner
    file_path = userfile.file.path

    # --- KINDLE NOTES FILE PARSER --- #
    # Using notes_line_list to parse note line by line and create indexes of title, date, highlight text
    notes_line_list = []
    notes_list = []
    notes_dict = {}

    with open(file_path, "r", encoding="utf-8") as original:
        data = original.read()
    with open(file_path, "w", encoding="utf-8") as modified:
        modified.write("==========\n" + data)

    with open(file_path, "r", encoding="utf-8") as kindle_file:
        for line in kindle_file:
            if len(line) > 1:
                notes_line_list.append(line)

    brake_index_list = []
    # Kindle separates notes with ===, here we create an index list of all separator/brakes
    for index in range(0, len(notes_line_list)):
        if "==========" in notes_line_list[index]:
            brake_index = index
            brake_index_list.append(brake_index)

    def find_2nd(
        string, substring
    ):  # I use this func to find second appearance of '|' symbol to slice date added string
        return string.find(substring, string.find(substring) + 1)

    # notes_sublist is an indexed list of notes, where each element is a book note as a list of lines
    # Append all notes between separators/brakes to notes_sublist, to have an indexed list of notes
    for i in range(len(brake_index_list) - 1):
        first_br_point = brake_index_list[
            i
        ]  # I use this to find range between ===== which is a note contents
        second_br_point = brake_index_list[i + 1]
        notes_sublist = []
        for index in range(first_br_point, second_br_point):
            # print(f"{notes_line_list[index]=}")
            notes_sublist.append(notes_line_list[index])
        notes_list.append(notes_sublist)

    # # Append the first note in the begining of file (which doesn't have first === separator) to notes_sublist
    # notes_sublist.append("==========\n")
    # for i in range(0, brake_index_list[0]):
    #     notes_sublist.append(["==========\n", notes_line_list[i]])

    for sublist in notes_list:
        try:
            book_title = sublist[1].split("(")[0].strip("\ufeff")
            author = sublist[1].split("(")[1].strip()[:-1]
            if "," in author:
                author = author.replace(",", "")
            if sublist[2].count("|") == 1:
                start_slice = sublist[2].find("|") + 2
                stop_slice = None
            else:
                start_slice = find_2nd(sublist[2], "|") + 2
                stop_slice = None
            date_added = sublist[2][start_slice:stop_slice]
            quote = sublist[3].strip("\xa0")
            # if book_title.strip() in notes_dict:
            #     notes_dict[f"{book_title.strip()}"][
            #         f"{date_added.strip()}"
            #     ] = quote.strip()
            # else:
            #     notes_dict[f"{book_title.strip()}"] = {}
            #     notes_dict[f"{book_title.strip()}"][
            #         f"{date_added.strip()}"
            #     ] = quote.strip()
            if author in notes_dict:
                if book_title.strip() in notes_dict[author]:
                    notes_dict[author][book_title.strip()][
                        date_added.strip()
                    ] = quote.strip()
                else:
                    pass
            else:
                notes_dict[author] = {}
                notes_dict[author][book_title.strip()] = {}
                notes_dict[author][book_title.strip()][
                    date_added.strip()
                ] = quote.strip()
        except IndexError:
            continue

    new_book_entry_list = []
    new_quote_entry_list = []

    for author in notes_dict:
        for book in notes_dict[author]:
            book_obj = Book(title=book, author=author, owner=user)
            new_book_entry_list.append(book_obj)
            for date_added, note in notes_dict[author][book].items():
                new_quote_entry_list.append(
                    Quote(
                        date_added=date_added,
                        text=note,
                        book=book_obj,
                        owner=user,
                    )
                )

    Book.objects.bulk_create(new_book_entry_list)
    Quote.objects.bulk_create(new_quote_entry_list)
