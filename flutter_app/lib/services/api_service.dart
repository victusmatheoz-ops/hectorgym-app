// ============================================================
//  HECTORGYM - Servicio de API para Flutter
//  Archivo: lib/services/api_service.dart
//
//  Cómo usar:
//  1. Agrega el paquete http en pubspec.yaml:
//       dependencies:
//         http: ^1.2.1
//         shared_preferences: ^2.2.3
//
//  2. Importa este archivo en tus pantallas
// ============================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';

class ApiService {
  static const String _baseUrl = AppConfig.apiBaseUrl;

  // ──────────────────────────────────────────
  //  TOKEN: guardar y leer desde SharedPreferences
  // ──────────────────────────────────────────
  static Future<void> guardarToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', token);
  }

  static Future<void> guardarUsuario(Map<String, dynamic> usuario) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('app_user', jsonEncode(usuario));
  }

  static Future<String?> obtenerToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  static Future<Map<String, dynamic>?> obtenerUsuarioGuardado() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('app_user');
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  static Future<void> cerrarSesion() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await prefs.remove('app_user');
  }

  // ──────────────────────────────────────────
  //  Headers con autenticación
  // ──────────────────────────────────────────
  static Future<Map<String, String>> _headers() async {
    final token = await obtenerToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ──────────────────────────────────────────
  //  AUTH
  // ──────────────────────────────────────────

  /// Inicia sesión y guarda el token automáticamente
  static Future<Map<String, dynamic>> login(String correo, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'correo': correo, 'password': password}),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200) {
      await guardarToken(data['token']);
      await guardarUsuario(Map<String, dynamic>.from(data['usuario']));
      return data;
    } else {
      throw Exception(data['error'] ?? 'Error al iniciar sesión');
    }
  }

  static Future<void> register({
    required String nombre,
    required String apellido,
    required String correo,
    required String password,
    String? telefono,
  }) async {
    final body = <String, dynamic>{
      'nombre': nombre,
      'apellido': apellido,
      'correo': correo,
      'password': password,
    };
    if (telefono != null && telefono.isNotEmpty) body['telefono'] = telefono;

    final response = await http.post(
      Uri.parse('$_baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 201) {
      throw Exception(data['error'] ?? data['errors']?[0]?['msg'] ?? 'Error al registrarse');
    }
  }

  // ──────────────────────────────────────────
  //  MEMBRESÍA DEL USUARIO ACTUAL
  // ──────────────────────────────────────────
  static Future<Map<String, dynamic>?> obtenerMiMembresia(int usuarioId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/membresias/usuario/$usuarioId'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final body = response.body.trim();
      if (body == 'null' || body.isEmpty) return null;
      return jsonDecode(body) as Map<String, dynamic>?;
    } else {
      throw Exception('No se pudo obtener la membresía');
    }
  }

  // ──────────────────────────────────────────
  //  RUTINA DEL USUARIO ACTUAL
  // ──────────────────────────────────────────
  static Future<Map<String, dynamic>> obtenerMiRutina(int usuarioId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/rutinas/usuario/$usuarioId'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
      // Retorna: { id, nombre, objetivo, nivel, ejercicios: [...] }
    } else {
      throw Exception('No se pudo obtener la rutina');
    }
  }

  // ──────────────────────────────────────────
  //  HISTORIAL DE PAGOS DEL USUARIO
  // ──────────────────────────────────────────
  static Future<List<dynamic>> obtenerMisPagos(int usuarioId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/pagos/usuario/$usuarioId'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('No se pudo obtener el historial de pagos');
    }
  }
}

// ============================================================
//  EJEMPLO DE USO EN UNA PANTALLA DE FLUTTER
//  Archivo: lib/screens/login_screen.dart
// ============================================================
//
// import '../services/api_service.dart';
//
// Future<void> _iniciarSesion() async {
//   try {
//     final data = await ApiService.login(correoController.text, passwordController.text);
//     final usuario = data['usuario'];
//
//     // Navegar según el rol
//     if (usuario['rol'] == 'admin') {
//       Navigator.pushReplacementNamed(context, '/admin-dashboard');
//     } else {
//       Navigator.pushReplacementNamed(context, '/portal', arguments: usuario);
//     }
//   } catch (e) {
//     ScaffoldMessenger.of(context).showSnackBar(
//       SnackBar(content: Text(e.toString())),
//     );
//   }
// }
//
// ============================================================
//  EJEMPLO: Pantalla del portal del usuario
//  Archivo: lib/screens/portal_screen.dart
// ============================================================
//
// class PortalScreen extends StatefulWidget { ... }
//
// Future<void> _cargarDatos() async {
//   final membresia = await ApiService.obtenerMiMembresia(usuarioId);
//   final rutina    = await ApiService.obtenerMiRutina(usuarioId);
//   final pagos     = await ApiService.obtenerMisPagos(usuarioId);
//
//   setState(() {
//     _membresia      = membresia;
//     _rutina         = rutina;
//     _pagos          = pagos;
//   });
// }
