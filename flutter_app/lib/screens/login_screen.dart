import 'package:flutter/material.dart';

import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _correoController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  bool _showPass = false;
  String? _error;

  static const _red = Color(0xFFE53935);

  @override
  void dispose() {
    _correoController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (_correoController.text.trim().isEmpty || _passwordController.text.isEmpty) {
      setState(() => _error = 'Completa todos los campos');
      return;
    }
    setState(() { _loading = true; _error = null; });

    try {
      final data = await ApiService.login(
        _correoController.text.trim(),
        _passwordController.text,
      );
      final usuario = data['usuario'] as Map<String, dynamic>;
      if (!mounted) return;
      if (usuario['rol'] == 'admin') {
        setState(() {
          _error = 'Esta app es para clientes del gimnasio. El administrador usa el panel web.';
          _loading = false;
        });
        return;
      }
      Navigator.pushReplacementNamed(context, '/member-dashboard');
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Fondo con foto del gym + degradado oscuro
          Positioned.fill(
            child: Image.asset(
              'assets/images/gym_bg.jpg',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF8B0000), Color(0xFFE53935), Color(0xFF1a0000)],
                  ),
                ),
              ),
            ),
          ),
          // Overlay oscuro sobre la foto
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.55),
                    Colors.black.withOpacity(0.92),
                  ],
                ),
              ),
            ),
          ),
          // Contenido
          SafeArea(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  const SizedBox(height: 40),
                  // Logo + nombre
                  const Icon(Icons.fitness_center, color: Colors.white, size: 64),
                  const SizedBox(height: 12),
                  const Text(
                    'HECTORGYM',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Tu entrenamiento. Tu progreso.',
                    style: TextStyle(color: Colors.white70, fontSize: 14, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 44),
                  // Tarjeta de login con fondo semitransparente
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white12),
                    ),
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'Iniciar sesión',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Accede a tu perfil de cliente',
                          style: TextStyle(color: Colors.white54, fontSize: 13),
                        ),
                        const SizedBox(height: 28),
                        TextField(
                          controller: _correoController,
                          keyboardType: TextInputType.emailAddress,
                          style: const TextStyle(color: Colors.white),
                          decoration: const InputDecoration(
                            labelText: 'Correo electrónico',
                            prefixIcon: Icon(Icons.email_outlined),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _passwordController,
                          obscureText: !_showPass,
                          style: const TextStyle(color: Colors.white),
                          onSubmitted: (_) => _login(),
                          decoration: InputDecoration(
                            labelText: 'Contraseña',
                            prefixIcon: const Icon(Icons.lock_outlined),
                            suffixIcon: IconButton(
                              icon: Icon(_showPass ? Icons.visibility_off : Icons.visibility,
                                  color: Colors.white38),
                              onPressed: () => setState(() => _showPass = !_showPass),
                            ),
                          ),
                        ),
                        if (_error != null) ...[
                          const SizedBox(height: 14),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.red.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: Colors.red.withOpacity(0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline, color: Colors.redAccent, size: 18),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(_error!,
                                      style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 28),
                        FilledButton(
                          onPressed: _loading ? null : _login,
                          style: FilledButton.styleFrom(
                            minimumSize: const Size(double.infinity, 52),
                          ),
                          child: _loading
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2.5, color: Colors.white),
                                )
                              : const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text('ENTRAR',
                                        style: TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w800,
                                            letterSpacing: 2)),
                                    SizedBox(width: 8),
                                    Icon(Icons.arrow_forward, size: 18),
                                  ],
                                ),
                        ),
                        const SizedBox(height: 32),
                        Row(
                          children: [
                            Expanded(child: Divider(color: Colors.white10)),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              child: Text('HECTORGYM',
                                  style: TextStyle(color: Colors.white24, fontSize: 11,
                                      letterSpacing: 2)),
                            ),
                            Expanded(child: Divider(color: Colors.white10)),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('¿No tienes cuenta? ',
                                style: TextStyle(color: Colors.white54, fontSize: 13)),
                            GestureDetector(
                              onTap: () async {
                                final correo = await Navigator.pushNamed(
                                    context, '/register');
                                if (correo is String && correo.isNotEmpty) {
                                  _correoController.text = correo;
                                }
                              },
                              child: const Text(
                                'Crear cuenta',
                                style: TextStyle(
                                    color: _red,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    decoration: TextDecoration.underline,
                                    decorationColor: _red),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                      ],
                    ),  // cierre Container tarjeta
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}