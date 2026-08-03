from django.db import models
from app_gimnasio.socios.models import Socio
from app_gimnasio.zonas.models import ZonaGym
from app_gimnasio.entrenadores.models import Entrenador

# CRUD 5: Reservas de Clases / Zonas
class ReservaClase(models.Model):
    ESTADOS = [
        ('CONFIRMADA', 'Confirmada'),
        ('CANCELADA', 'Cancelada'),
        ('ASISTIO', 'Asistió'),
    ]
    socio = models.ForeignKey(Socio, on_delete=models.CASCADE, related_name='reservas', null=True, blank=True)
    zona = models.ForeignKey(ZonaGym, on_delete=models.CASCADE, related_name='reservas')
    entrenador = models.ForeignKey(Entrenador, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_reserva = models.DateTimeField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default='CONFIRMADA')

    def __str__(self):
        return f"Reserva de {self.socio if self.socio else 'Zona (Sin Socio)'} en {self.zona} ({self.fecha_reserva})"
