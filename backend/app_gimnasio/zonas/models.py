from django.db import models

# CRUD 3: Zonas del Gimnasio
class ZonaGym(models.Model):
    nombre = models.CharField(max_length=100) # Ej: Sala de Spinning, Zona de Pesas
    descripcion = models.TextField(blank=True, null=True)
    capacidad_maxima = models.IntegerField()
    disponible = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
