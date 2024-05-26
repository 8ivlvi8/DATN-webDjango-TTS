from django.urls import path
from . import views

urlpatterns = [
    path('nghetruyen/', views.web, name='web'),
    path('', views.tts, name='tts'),
    path('tts/', views.tts, name='tts'),
]