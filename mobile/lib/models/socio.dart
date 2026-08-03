class Socio {
  final int id;
  final String nombre;
  final String apellido;
  final String email;
  final String telefono;
  final bool activo;

  Socio({
    required this.id,
    required this.nombre,
    required this.apellido,
    required this.email,
    required this.telefono,
    required this.activo,
  });

  factory Socio.fromJson(Map<String, dynamic> json) {
    return Socio(
      id: json['id'] as int,
      nombre: json['nombre'] as String,
      apellido: json['apellido'] as String,
      email: json['email'] as String,
      telefono: json['telefono'] as String? ?? '',
      activo: json['activo'] as bool,
    );
  }
}
