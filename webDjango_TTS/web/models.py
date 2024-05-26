from django.db import models

# Create your models here.

class nguonTruyen(models.Model):
    id = models.AutoField(primary_key=True)
    tenNguonTruyen = models.CharField(max_length=200)
    link = models.URLField(max_length=200, blank=True)
    element = models.CharField(max_length=200, blank=True)
    nextElement = models.CharField(max_length=200, blank=True)
    previousElement = models.CharField(max_length=200, blank=True)
    