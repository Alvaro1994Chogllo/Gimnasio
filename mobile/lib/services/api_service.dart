import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import '../models/socio.dart';
import '../models/membresia.dart';
import '../models/zona.dart';
import '../models/entrenador.dart';
import '../models/reserva.dart';

/// Modelo que representa la sesión del usuario autenticado
class UserSession {
  final String token;
  final String role;       // 'ADMIN' | 'SOCIO' | 'ENTRENADOR'
  final String username;
  final int? socioId;
  final int? entrenadorId;

  const UserSession({
    required this.token,
    required this.role,
    required this.username,
    this.socioId,
    this.entrenadorId,
  });

  bool get isAdmin => role == 'ADMIN';
  bool get isSocio => role == 'SOCIO';
  bool get isEntrenador => role == 'ENTRENADOR';
}

class ApiService {
  /// URL base del servidor Django
  static String get baseUrl {
    if (!kIsWeb) {
      return 'http://10.0.2.2:8000';
    }
    return 'http://127.0.0.1:8000';
  }

  /// Decodifica el payload de un JWT (base64url) sin verificar firma
  static Map<String, dynamic> _decodeJwt(String token) {
    final parts = token.split('.');
    if (parts.length != 3) return {};
    String payload = parts[1];
    final rem = payload.length % 4;
    if (rem != 0) payload += '=' * (4 - rem);
    try {
      final bytes = base64Url.decode(payload);
      return jsonDecode(utf8.decode(bytes)) as Map<String, dynamic>;
    } catch (_) {
      return {};
    }
  }

  /// Autentica al usuario y retorna un [UserSession]
  Future<UserSession> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/token/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username.trim(), 'password': password.trim()}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final accessToken = data['access'] as String;
      final payload = _decodeJwt(accessToken);

      final role = (payload['role'] as String?) ?? 'ADMIN';
      final uname = (payload['username'] as String?) ?? username;
      final socioId = payload['socio_id'] != null
          ? int.tryParse(payload['socio_id'].toString())
          : null;
      final entrenadorId = payload['entrenador_id'] != null
          ? int.tryParse(payload['entrenador_id'].toString())
          : null;

      return UserSession(
        token: accessToken,
        role: role,
        username: uname,
        socioId: socioId,
        entrenadorId: entrenadorId,
      );
    }

    if (response.statusCode == 401 || response.statusCode == 400) {
      throw Exception(
        'Credenciales inválidas.\n'
        '• Admin → usuario: admin / contraseña: admin\n'
        '• Socio → usuario: cédula / contraseña: cédula\n'
        '• Entrenador → usuario: email / contraseña: teléfono',
      );
    }

    throw Exception('Error de autenticación (${response.statusCode})');
  }

  Map<String, String> _authHeaders(String token) => {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      };

  // ── Socios CRUD ────────────────────────────────────────────────────────────────

  Future<List<Socio>> fetchSocios(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/socios/'),
      headers: _authHeaders(token),
    );
    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list.map((item) => Socio.fromJson(item)).toList();
    }
    throw Exception('Error al cargar socios (${response.statusCode})');
  }

  Future<Socio> createSocio(String token, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/socios/'),
      headers: _authHeaders(token),
      body: jsonEncode(data),
    );
    if (response.statusCode == 201) {
      return Socio.fromJson(jsonDecode(response.body));
    }
    throw Exception(response.body);
  }

  Future<Socio> updateSocio(String token, int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/socios/$id/'),
      headers: _authHeaders(token),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return Socio.fromJson(jsonDecode(response.body));
    }
    throw Exception(response.body);
  }

  Future<void> deleteSocio(String token, int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/api/socios/$id/'),
      headers: _authHeaders(token),
    );
    if (response.statusCode != 204) {
      throw Exception(response.body);
    }
  }

  // ── Membresías CRUD ────────────────────────────────────────────────────────────

  Future<List<Membresia>> fetchMembresias(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/membresias/'),
      headers: _authHeaders(token),
    );
    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list.map((item) => Membresia.fromJson(item)).toList();
    }
    throw Exception('Error al cargar membresías (${response.statusCode})');
  }

  Future<Membresia> createMembresia(String token, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/membresias/'),
      headers: _authHeaders(token),
      body: jsonEncode(data),
    );
    if (response.statusCode == 201) {
      return Membresia.fromJson(jsonDecode(response.body));
    }
    throw Exception(response.body);
  }

  Future<Membresia> updateMembresia(String token, int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/membresias/$id/'),
      headers: _authHeaders(token),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return Membresia.fromJson(jsonDecode(response.body));
    }
    throw Exception(response.body);
  }

  Future<void> deleteMembresia(String token, int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/api/membresias/$id/'),
      headers: _authHeaders(token),
    );
    if (response.statusCode != 204) {
      throw Exception(response.body);
    }
  }

  // ── Zonas CRUD ─────────────────────────────────────────────────────────────────

  Future<List<Zona>> fetchZonas(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/zonas/'),
      headers: _authHeaders(token),
    );
    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list.map((item) => Zona.fromJson(item)).toList();
    }
    throw Exception('Error al cargar zonas (${response.statusCode})');
  }

  Future<Zona> createZona(String token, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/zonas/'),
      headers: _authHeaders(token),
      body: jsonEncode(data),
    );
    if (response.statusCode == 201) {
      return Zona.fromJson(jsonDecode(response.body));
    }
    throw Exception(response.body);
  }

  Future<Zona> updateZona(String token, int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/zonas/$id/'),
      headers: _authHeaders(token),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return Zona.fromJson(jsonDecode(response.body));
    }
    throw Exception(response.body);
  }

  Future<void> deleteZona(String token, int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/api/zonas/$id/'),
      headers: _authHeaders(token),
    );
    if (response.statusCode != 204) {
      throw Exception(response.body);
    }
  }

  // ── Entrenadores CRUD ──────────────────────────────────────────────────────────

  Future<List<Entrenador>> fetchEntrenadores(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/entrenadores/'),
      headers: _authHeaders(token),
    );
    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list.map((item) => Entrenador.fromJson(item)).toList();
    }
    throw Exception('Error al cargar entrenadores (${response.statusCode})');
  }

  Future<Entrenador> createEntrenador(String token, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/entrenadores/'),
      headers: _authHeaders(token),
      body: jsonEncode(data),
    );
    if (response.statusCode == 201) {
      return Entrenador.fromJson(jsonDecode(response.body));
    }
    throw Exception(response.body);
  }

  Future<Entrenador> updateEntrenador(String token, int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/entrenadores/$id/'),
      headers: _authHeaders(token),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return Entrenador.fromJson(jsonDecode(response.body));
    }
    throw Exception(response.body);
  }

  Future<void> deleteEntrenador(String token, int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/api/entrenadores/$id/'),
      headers: _authHeaders(token),
    );
    if (response.statusCode != 204) {
      throw Exception(response.body);
    }
  }

  // ── Reservas CRUD ──────────────────────────────────────────────────────────────

  Future<List<Reserva>> fetchReservas(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/reservas/'),
      headers: _authHeaders(token),
    );
    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list.map((item) => Reserva.fromJson(item)).toList();
    }
    throw Exception('Error al cargar reservas (${response.statusCode})');
  }

  Future<Reserva> createReserva(String token, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/reservas/'),
      headers: _authHeaders(token),
      body: jsonEncode(data),
    );
    if (response.statusCode == 201) {
      return Reserva.fromJson(jsonDecode(response.body));
    }
    throw Exception(response.body);
  }

  Future<Reserva> updateReserva(String token, int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/reservas/$id/'),
      headers: _authHeaders(token),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return Reserva.fromJson(jsonDecode(response.body));
    }
    throw Exception(response.body);
  }

  Future<void> deleteReserva(String token, int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/api/reservas/$id/'),
      headers: _authHeaders(token),
    );
    if (response.statusCode != 204) {
      throw Exception(response.body);
    }
  }
}
