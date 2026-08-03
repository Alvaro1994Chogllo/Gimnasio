class Reserva {
  final int id;
  final int? socio;
  final int zona;
  final int? entrenador;
  final DateTime fechaReserva;
  final String estado;

  Reserva({
    required this.id,
    required this.socio,
    required this.zona,
    required this.entrenador,
    required this.fechaReserva,
    required this.estado,
  });

  factory Reserva.fromJson(Map<String, dynamic> json) {
    return Reserva(
      id: json['id'] as int,
      socio: json['socio'] as int?,
      zona: json['zona'] as int,
      entrenador: json['entrenador'] as int?,
      fechaReserva: DateTime.parse(json['fecha_reserva'] as String),
      estado: json['estado'] as String,
    );
  }
}
