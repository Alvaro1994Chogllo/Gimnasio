from django.db import models
from django.contrib.auth.models import User

# CRUD 1: Socios
class Socio(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='socio_profile')
    cedula = models.CharField(max_length=10, unique=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    fecha_nacimiento = models.DateField()
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

# CRUD 2: Membresías
class Membresia(models.Model):
    nombre = models.CharField(max_length=50) # Ej: Plan Mensual, Plan Anual
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=8, decimal_places=2)
    duracion_dias = models.IntegerField(help_text="Duración en días")
    activa = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} - ${self.precio}"

# CRUD 3: Zonas del Gimnasio
class ZonaGym(models.Model):
    nombre = models.CharField(max_length=100) # Ej: Sala de Spinning, Zona de Pesas
    descripcion = models.TextField(blank=True, null=True)
    capacidad_maxima = models.IntegerField()
    disponible = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

# CRUD 4: Entrenadores
class Entrenador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='entrenador_profile')
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    especialidad = models.CharField(max_length=100) # Ej: Crossfit, Musculación, Yoga
    telefono = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.especialidad}"

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
