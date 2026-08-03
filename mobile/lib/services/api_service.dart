import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/socio.dart';
import '../models/membresia.dart';
import '../models/zona.dart';
import '../models/entrenador.dart';
import '../models/reserva.dart';

class ApiService {
  static const String baseUrl = 'http://127.0.0.1:8000';

  Future<String> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/token/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return data['access'] as String;
    }

    throw Exception('Error de autenticación: ${response.body}');
  }

  Future<List<Socio>> fetchSocios(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/socios/'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list.map((item) => Socio.fromJson(item)).toList();
    }
    throw Exception('Error al cargar socios');
  }

  Future<List<Membresia>> fetchMembresias(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/membresias/'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list.map((item) => Membresia.fromJson(item)).toList();
    }
    throw Exception('Error al cargar membresías');
  }

  Future<List<Zona>> fetchZonas(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/zonas/'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list.map((item) => Zona.fromJson(item)).toList();
    }
    throw Exception('Error al cargar zonas');
  }

  Future<List<Entrenador>> fetchEntrenadores(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/entrenadores/'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list.map((item) => Entrenador.fromJson(item)).toList();
    }
    throw Exception('Error al cargar entrenadores');
  }

  Future<List<Reserva>> fetchReservas(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/reservas/'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list.map((item) => Reserva.fromJson(item)).toList();
    }
    throw Exception('Error al cargar reservas');
  }
}
