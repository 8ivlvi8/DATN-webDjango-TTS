from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets
from .serializers import GroupSerializer, UserSerializer
from .models import nguonTruyen


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


def tts(request):
    template = loader.get_template('homepage.html')
    return HttpResponse(template.render())


def web(request):
    list_nguonTruyen = nguonTruyen.objects.all()
    context = {'list_nguonTruyen': list_nguonTruyen}
    template = loader.get_template('nghetruyen.html')
    return HttpResponse(template.render(context))
