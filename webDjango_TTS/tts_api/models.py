from django.db import models


class TextToSpeech(models.Model):
    url = models.URLField()
    element = models.CharField(max_length=100)
