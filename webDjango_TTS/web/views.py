from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader


def tts(request):
    template = loader.get_template('homepage.html')
    return HttpResponse(template.render())


def web(request):
    template = loader.get_template('nghetruyen.html')
    return HttpResponse(template.render())
