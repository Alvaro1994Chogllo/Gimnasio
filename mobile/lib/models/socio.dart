class Socio {
  final int id;
  final String cedula;
  final String nombre;
  final String apellido;
  final String email;
  final String telefono;
  final String fechaNacimiento;
  final bool activo;

  Socio({
    required this.id,
    required this.cedula,
    required this.nombre,
    required this.apellido,
    required this.email,
    required this.telefono,
    required this.fechaNacimiento,
    required this.activo,
  });

  factory Socio.fromJson(Map<String, dynamic> json) {
    return Socio(
      id: json['id'] as int,
      cedula: (json['cedula'] ?? '') as String,
      nombre: (json['nombre'] ?? '') as String,
      apellido: (json['apellido'] ?? '') as String,
      email: (json['email'] ?? '') as String,
      telefono: (json['telefono'] ?? '') as String,
      fechaNacimiento: (json['fecha_nacimiento'] ?? '') as String,
      activo: (json['activo'] ?? true) as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'cedula': cedula,
      'nombre': nombre,
      'apellido': apellido,
      'email': email,
      'telefono': telefono,
      'fecha_nacimiento': fechaNacimiento,
      'activo': activo,
    };
  }
}
