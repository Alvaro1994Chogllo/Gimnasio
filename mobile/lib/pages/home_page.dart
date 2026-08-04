import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dashboard_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final ApiService _apiService = ApiService();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _loading = false;
  bool _obscurePassword = true;
  String _message = '';

  Future<void> _login() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text.trim();

    if (username.isEmpty || password.isEmpty) {
      setState(() {
        _message = 'Ingresa tu usuario y contraseña';
      });
      return;
    }

    setState(() {
      _loading = true;
      _message = '';
    });

    try {
      final session = await _apiService.login(username, password);
      setState(() {
        _message = 'Autenticado correctamente';
      });
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => DashboardPage(session: session),
        ),
      );
    } catch (e) {
      setState(() {
        _message = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF111111),
      body: Column(
        children: [
          // Hero Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 50, horizontal: 20),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF1a0a00), Color(0xFF2d1500), Color(0xFF111111)],
              ),
            ),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.fitness_center, color: Color(0xFFf36100), size: 50),
                SizedBox(height: 15),
                Text(
                  'GIMNASIO',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 36,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 4,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'APLICACIÓN MÓVIL',
                  style: TextStyle(
                    color: Color(0xFFf36100),
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 3,
                  ),
                ),
              ],
            ),
          ),

          // Login Form Container
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Icon
                    Container(
                      width: 70,
                      height: 70,
                      decoration: const BoxDecoration(
                        color: Color(0xFFf36100),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.person,
                        size: 35,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Title
                    const Text(
                      'INICIAR SESIÓN',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Username Field
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF222222),
                        border: Border.all(color: const Color(0xFF333333)),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: TextField(
                        controller: _usernameController,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          prefixIcon: Icon(
                            Icons.person_outline,
                            color: Color(0xFFf36100),
                          ),
                          hintText: 'Usuario / Cédula / Email',
                          hintStyle: TextStyle(
                            color: Color(0xFF666666),
                            fontSize: 13,
                          ),
                          contentPadding: EdgeInsets.symmetric(
                            vertical: 14,
                            horizontal: 10,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Password Field
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF222222),
                        border: Border.all(color: const Color(0xFF333333)),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: TextField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          prefixIcon: const Icon(
                            Icons.lock_outline,
                            color: Color(0xFFf36100),
                          ),
                          hintText: 'Contraseña / Cédula / Teléfono',
                          hintStyle: const TextStyle(
                            color: Color(0xFF666666),
                            fontSize: 13,
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 14,
                            horizontal: 10,
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: const Color(0xFF666666),
                              size: 20,
                            ),
                            onPressed: () {
                              setState(() => _obscurePassword = !_obscurePassword);
                            },
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Error / Success Message
                    if (_message.isNotEmpty)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _message.contains('correctamente')
                              ? const Color(0xFF1a3a1a)
                              : const Color(0xFF3a1a1a),
                          border: Border.all(
                            color: _message.contains('correctamente')
                                ? const Color(0xFF00aa00)
                                : const Color(0xFFf36100),
                          ),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _message,
                          textAlign: TextAlign.left,
                          style: TextStyle(
                            color: _message.contains('correctamente')
                                ? const Color(0xFF00aa00)
                                : const Color(0xFFf36100),
                            fontSize: 12,
                          ),
                        ),
                      ),
                    const SizedBox(height: 16),

                    // Login Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _loading ? null : _login,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFf36100),
                          disabledBackgroundColor: const Color(0xFF555555),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        child: _loading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                ),
                              )
                            : const Text(
                                'INGRESAR',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Guía de credenciales
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1a1a1a),
                        border: Border.all(color: const Color(0xFF2a2a2a)),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.info_outline,
                                  color: Color(0xFFf36100), size: 14),
                              SizedBox(width: 6),
                              Text(
                                'GUÍA DE ACCESO',
                                style: TextStyle(
                                  color: Color(0xFFf36100),
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          _credentialRow('Admin', 'admin', 'admin'),
                          const SizedBox(height: 6),
                          _credentialRow('Socio', 'Cédula', 'Cédula'),
                          const SizedBox(height: 6),
                          _credentialRow('Entrenador', 'Email', 'Teléfono'),
                          const SizedBox(height: 8),
                          const Text(
                            '* Si el teléfono tiene < 6 dígitos → contraseña: 123456',
                            style: TextStyle(
                              color: Color(0xFF555555),
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _credentialRow(String role, String user, String pass) {
    return Row(
      children: [
        SizedBox(
          width: 90,
          child: Text(
            role,
            style: const TextStyle(
                color: Color(0xFFf36100), fontSize: 11, fontWeight: FontWeight.w600),
          ),
        ),
        Expanded(
          child: Text(
            'Usuario: $user',
            style: const TextStyle(color: Color(0xFF999999), fontSize: 11),
          ),
        ),
        Expanded(
          child: Text(
            'Pass: $pass',
            style: const TextStyle(color: Color(0xFF999999), fontSize: 11),
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
