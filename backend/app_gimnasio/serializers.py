from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers
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
    socio_nombre = serializers.SerializerMethodField()
    zona_nombre = serializers.ReadOnlyField(source='zona.nombre')
    entrenador_nombre = serializers.SerializerMethodField()

    def get_socio_nombre(self, obj):
        if obj.socio:
            return f"{obj.socio.nombre} {obj.socio.apellido}"
        return 'Sin Socio'

    def get_entrenador_nombre(self, obj):
        if obj.entrenador:
            return f"{obj.entrenador.nombre} {obj.entrenador.apellido}"
        return 'Sin Entrenador'


    class Meta:
        model = ReservaClase
        fields = '__all__'

    def validate(self, data):
        zona = data.get('zona') or getattr(self.instance, 'zona', None)
        fecha_reserva = data.get('fecha_reserva') or getattr(self.instance, 'fecha_reserva', None)
        entrenador = data.get('entrenador') or getattr(self.instance, 'entrenador', None)

        if not zona:
            raise serializers.ValidationError({'zona': 'La zona es obligatoria.'})
        if not fecha_reserva:
            raise serializers.ValidationError({'fecha_reserva': 'La fecha y hora de la reserva son obligatorias.'})

        if isinstance(fecha_reserva, str):
            try:
                fecha_reserva = timezone.datetime.fromisoformat(fecha_reserva)
            except ValueError:
                raise serializers.ValidationError({'fecha_reserva': 'Formato de fecha/hora no válido.'})
        if timezone.is_naive(fecha_reserva):
            fecha_reserva = timezone.make_aware(fecha_reserva, timezone.get_current_timezone())

        slot_start = fecha_reserva.replace(minute=0, second=0, microsecond=0)
        slot_end = slot_start + timedelta(hours=1)

        reservas_mismo_slot = ReservaClase.objects.filter(
            zona=zona,
            fecha_reserva__gte=slot_start,
            fecha_reserva__lt=slot_end,
        ).exclude(estado='CANCELADA')

        if self.instance is not None:
            reservas_mismo_slot = reservas_mismo_slot.exclude(id=self.instance.id)

        if reservas_mismo_slot.count() >= zona.capacidad_maxima:
            raise serializers.ValidationError({'fecha_reserva': 'La zona ya alcanzó su capacidad máxima para esa hora.'})

        if entrenador is not None:
            reservas_entrenador = reservas_mismo_slot.filter(entrenador=entrenador)
            if reservas_entrenador.count() >= entrenador.capacidad_por_hora:
                raise serializers.ValidationError({'entrenador': 'El entrenador ya alcanzó su capacidad de alumnos por hora en ese horario.'})

        return data
