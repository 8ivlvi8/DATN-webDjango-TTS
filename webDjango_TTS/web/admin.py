from django.contrib import admin
from .models import nguonTruyen

# Register your models here.
admin.site.register(nguonTruyen)
class nguonTruyenAdmin(admin.ModelAdmin):
    list_display = ("id","tenNguonTruyen","link","element")