class Membresia {
  final int id;
  final String nombre;
  final String descripcion;
  final double precio;
  final int duracionDias;
  final bool activa;

  Membresia({
    required this.id,
    required this.nombre,
    required this.descripcion,
    required this.precio,
    required this.duracionDias,
    required this.activa,
  });

  factory Membresia.fromJson(Map<String, dynamic> json) {
    return Membresia(
      id: json['id'] as int,
      nombre: json['nombre'] as String,
      descripcion: json['descripcion'] as String? ?? '',
      precio: (json['precio'] as num).toDouble(),
      duracionDias: json['duracion_dias'] as int,
      activa: json['activa'] as bool,
    );
  }
}
