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
    final precioRaw = json['precio'];
    double precioDouble = 0.0;
    if (precioRaw is String) {
      precioDouble = double.tryParse(precioRaw) ?? 0.0;
    } else if (precioRaw is num) {
      precioDouble = precioRaw.toDouble();
    }
    return Membresia(
      id: json['id'] as int,
      nombre: (json['nombre'] ?? '') as String,
      descripcion: (json['descripcion'] ?? '') as String,
      precio: precioDouble,
      duracionDias: (json['duracion_dias'] ?? 30) as int,
      activa: (json['activa'] ?? true) as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nombre': nombre,
      'descripcion': descripcion,
      'precio': precio,
      'duracion_dias': duracionDias,
      'activa': activa,
    };
  }
}
