from django.db import models

# CRUD 2: Membresías
class Membresia(models.Model):
    nombre = models.CharField(max_length=50) # Ej: Plan Mensual, Plan Anual
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=8, decimal_places=2)
    duracion_dias = models.IntegerField(help_text="Duración en días")
    activa = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} - ${self.precio}"
