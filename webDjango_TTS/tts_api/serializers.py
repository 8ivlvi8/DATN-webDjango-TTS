from rest_framework import serializers
from .models import TextToSpeech

# Create a model serializer
class TextToSpeechSerializer(serializers.ModelSerializer):
    url = serializers.URLField()
    elements = serializers.CharField()
    class Meta:
        model = TextToSpeech
        fields = ('url', 'elements')