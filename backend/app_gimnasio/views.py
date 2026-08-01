from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Socio, Membresia, ZonaGym, Entrenador, ReservaClase
from .serializers import (
    SocioSerializer, MembresiaSerializer, ZonaGymSerializer,
    EntrenadorSerializer, ReservaClaseSerializer
)

class SocioViewSet(viewsets.ModelViewSet):
    queryset = Socio.objects.all()
    serializer_class = SocioSerializer
    # permission_classes = [IsAuthenticated] # Activar con Login JWT

class MembresiaViewSet(viewsets.ModelViewSet):
    queryset = Membresia.objects.all()
    serializer_class = MembresiaSerializer

class ZonaGymViewSet(viewsets.ModelViewSet):
    queryset = ZonaGym.objects.all()
    serializer_class = ZonaGymSerializer

class EntrenadorViewSet(viewsets.ModelViewSet):
    queryset = Entrenador.objects.all()
    serializer_class = EntrenadorSerializer

class ReservaClaseViewSet(viewsets.ModelViewSet):
    queryset = ReservaClase.objects.all()
    serializer_class = ReservaClaseSerializer
