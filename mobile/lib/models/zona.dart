class Zona {
  final int id;
  final String nombre;
  final String descripcion;
  final int capacidadMaxima;
  final bool disponible;

  Zona({
    required this.id,
    required this.nombre,
    required this.descripcion,
    required this.capacidadMaxima,
    required this.disponible,
  });

  factory Zona.fromJson(Map<String, dynamic> json) {
    return Zona(
      id: json['id'] as int,
      nombre: (json['nombre'] ?? '') as String,
      descripcion: (json['descripcion'] ?? '') as String,
      capacidadMaxima: (json['capacidad_maxima'] ?? 10) as int,
      disponible: (json['disponible'] ?? true) as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nombre': nombre,
      'descripcion': descripcion,
      'capacidad_maxima': capacidadMaxima,
      'disponible': disponible,
    };
  }
}
