from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SocioViewSet, MembresiaViewSet, ZonaGymViewSet,
    EntrenadorViewSet, ReservaClaseViewSet
)

router = DefaultRouter()
router.register(r'socios', SocioViewSet)
router.register(r'membresias', MembresiaViewSet)
router.register(r'zonas', ZonaGymViewSet)
router.register(r'entrenadores', EntrenadorViewSet)
router.register(r'reservas', ReservaClaseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
