# production/serializers.py
from rest_framework import serializers
from .models import MolassesReading

class MolassesReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MolassesReading
        fields = '__all__'
