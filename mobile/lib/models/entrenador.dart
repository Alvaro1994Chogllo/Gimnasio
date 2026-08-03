class Entrenador {
  final int id;
  final String nombre;
  final String apellido;
  final String especialidad;
  final String telefono;
  final String email;
  final int capacidadPorHora;

  Entrenador({
    required this.id,
    required this.nombre,
    required this.apellido,
    required this.especialidad,
    required this.telefono,
    required this.email,
    required this.capacidadPorHora,
  });

  factory Entrenador.fromJson(Map<String, dynamic> json) {
    return Entrenador(
      id: json['id'] as int,
      nombre: json['nombre'] as String,
      apellido: json['apellido'] as String,
      especialidad: json['especialidad'] as String,
      telefono: json['telefono'] as String? ?? '',
      email: json['email'] as String,
      capacidadPorHora: json['capacidad_por_hora'] as int,
    );
  }
}
