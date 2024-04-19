from django.urls import path
from . import views

urlpatterns = [
    path('web/', views.web, name='web'),
	path('', views.home, name='home'),
]