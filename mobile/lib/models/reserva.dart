class Reserva {
  final int id;
  final int? socio;
  final int zona;
  final int? entrenador;
  final DateTime fechaReserva;
  final String estado;

  // Campos leídos del serializer Django (ReadOnlyFields)
  final String socioNombre;
  final String zonaNombre;
  final String entrenadorNombre;

  Reserva({
    required this.id,
    required this.socio,
    required this.zona,
    required this.entrenador,
    required this.fechaReserva,
    required this.estado,
    required this.socioNombre,
    required this.zonaNombre,
    required this.entrenadorNombre,
  });

  factory Reserva.fromJson(Map<String, dynamic> json) {
    return Reserva(
      id: json['id'] as int,
      socio: json['socio'] as int?,
      zona: json['zona'] as int,
      entrenador: json['entrenador'] as int?,
      fechaReserva: DateTime.parse(json['fecha_reserva'] as String),
      estado: (json['estado'] ?? 'CONFIRMADA') as String,
      socioNombre: (json['socio_nombre'] ?? 'Sin Socio') as String,
      zonaNombre: (json['zona_nombre'] ?? 'Sala') as String,
      entrenadorNombre: (json['entrenador_nombre'] ?? 'Sin Entrenador') as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'socio': socio,
      'zona': zona,
      'entrenador': entrenador,
      'fecha_reserva': fechaReserva.toIso8601String(),
      'estado': estado,
    };
  }
}
