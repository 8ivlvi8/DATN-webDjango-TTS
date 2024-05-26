from django.urls import path
from . import views

urlpatterns = [
    path('tts_api/gettext/', views.TTS_API_Get_Text.as_view()),
    path('tts_api/getaudio/', views.TTS_API_Get_Audio.as_view()),
    path('tts_api/getaudiostream/', views.TTS_API_Get_Audio_Stream.as_view()),
]
