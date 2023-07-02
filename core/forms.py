from fileinput import filename
from django import forms
from .models import UserFile, FileType
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings


class FileForm(forms.ModelForm):
    def clean(self):
        quote_type: FileType = self.cleaned_data["type"]
        file: InMemoryUploadedFile = self.cleaned_data["file"]
        # print(file.content_type)
        # print(file.name)
        # print(file.size / (1024 * 1024))
        size = file.size / (1024 * 1024)

        # File size limit is in settings.py
        if size > settings.FILE_SIZE_LIMIT:
            raise forms.ValidationError("File size limit is 100 Mb")

        if quote_type != "kindle":
            raise forms.ValidationError(
                "Sorry, currently we don't support other file formats."
            )

        if ".txt" not in file.name:
            print("Wront file type, please choose kindle txt file")
            raise forms.ValidationError(
                "Wront file type, please choose a kindle txt file."
            )

        return self.cleaned_data

    class Meta:
        model = UserFile
        fields = (
            "type",
            "file",
        )


# TODO t̶y̶p̶e̶ c̶h̶e̶c̶k̶
