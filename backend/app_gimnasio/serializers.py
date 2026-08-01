from rest_framework import serializers
from .models import Socio, Membresia, ZonaGym, Entrenador, ReservaClase

class SocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Socio
        fields = '__all__'

class MembresiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membresia
        fields = '__all__'

class ZonaGymSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZonaGym
        fields = '__all__'

class EntrenadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrenador
        fields = '__all__'

class ReservaClaseSerializer(serializers.ModelSerializer):
    # Incluye nombres detallados en lecturas
    socio_nombre = serializers.ReadOnlyField(source='socio.nombre')
    zona_nombre = serializers.ReadOnlyField(source='zona.nombre')

    class Meta:
        model = ReservaClase
        fields = '__all__'
