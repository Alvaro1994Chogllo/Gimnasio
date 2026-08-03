from django.db import models
from django.contrib.auth.models import User

# CRUD 4: Entrenadores
class Entrenador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='entrenador_profile')
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    especialidad = models.CharField(max_length=100) # Ej: Crossfit, Musculación, Yoga
    telefono = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(unique=True)
    capacidad_por_hora = models.IntegerField(default=1, help_text='Cantidad máxima de alumnos que puede entrenar por hora')

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.especialidad}"
