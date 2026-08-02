from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Socio, Membresia, ZonaGym, Entrenador, ReservaClase

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        role = 'ADMIN'
        socio_id = None
        entrenador_id = None

        try:
            if user.socio_profile:
                role = 'SOCIO'
                socio_id = user.socio_profile.id
        except Exception:
            pass

        try:
            if user.entrenador_profile:
                role = 'ENTRENADOR'
                entrenador_id = user.entrenador_profile.id
        except Exception:
            pass

        if user.is_superuser:
            role = 'ADMIN'

        token['role'] = role
        token['username'] = user.username
        token['socio_id'] = socio_id
        token['entrenador_id'] = entrenador_id
        return token

class SocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Socio
        fields = '__all__'
        read_only_fields = ('user',)

    def create(self, validated_data):
        cedula = validated_data.get('cedula')
        email = validated_data.get('email')
        nombre = validated_data.get('nombre', '')
        apellido = validated_data.get('apellido', '')

        if User.objects.filter(username=cedula).exists():
            raise serializers.ValidationError({"cedula": "Un usuario con esta cédula ya existe."})

        # Crear el usuario de Django
        user = User.objects.create_user(
            username=cedula,
            email=email,
            first_name=nombre,
            last_name=apellido,
            password=cedula
        )
        validated_data['user'] = user
        return super().create(validated_data)

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
        read_only_fields = ('user',)

    def create(self, validated_data):
        email = validated_data.get('email')
        nombre = validated_data.get('nombre', '')
        apellido = validated_data.get('apellido', '')
        telefono = validated_data.get('telefono', '')

        if User.objects.filter(username=email).exists():
            raise serializers.ValidationError({"email": "Un usuario con este email ya existe."})

        password = telefono if (telefono and len(telefono) >= 6) else '123456'

        # Crear el usuario de Django
        user = User.objects.create_user(
            username=email,
            email=email,
            first_name=nombre,
            last_name=apellido,
            password=password
        )
        validated_data['user'] = user
        return super().create(validated_data)

class ReservaClaseSerializer(serializers.ModelSerializer):
    socio_nombre = serializers.ReadOnlyField(source='socio.nombre')
    zona_nombre = serializers.ReadOnlyField(source='zona.nombre')
    entrenador_nombre = serializers.ReadOnlyField(source='entrenador.nombre')

    class Meta:
        model = ReservaClase
        fields = '__all__'
