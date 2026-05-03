import 'package:flutter/material.dart';

import '../services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nombreController    = TextEditingController();
  final _apellidoController  = TextEditingController();
  final _correoController    = TextEditingController();
  final _telefonoController  = TextEditingController();
  final _passwordController  = TextEditingController();
  final _pesoController      = TextEditingController();
  final _estaturaController  = TextEditingController();

  String? _objetivo;
  bool _loading  = false;
  bool _showPass = false;
  String? _error;

  static const _red = Color(0xFFE53935);

  static const _objetivos = [
    'Pérdida de peso',
    'Ganar masa muscular',
    'Mejorar condición física',
    'Mantenimiento',
    'Otro',
  ];

  @override
  void dispose() {
    _nombreController.dispose();
    _apellidoController.dispose();
    _correoController.dispose();
    _telefonoController.dispose();
    _passwordController.dispose();
    _pesoController.dispose();
    _estaturaController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    final nombre   = _nombreController.text.trim();
    final apellido = _apellidoController.text.trim();
    final correo   = _correoController.text.trim();
    final password = _passwordController.text;
    final telefono = _telefonoController.text.trim();

    if (nombre.isEmpty || apellido.isEmpty || correo.isEmpty || password.isEmpty || telefono.isEmpty) {
      setState(() => _error = 'Completa todos los campos obligatorios');
      return;
    }
    if (password.length < 6) {
      setState(() => _error = 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    final pesoVal     = double.tryParse(_pesoController.text.trim());
    final estaturaVal = double.tryParse(_estaturaController.text.trim());

    setState(() { _loading = true; _error = null; });

    try {
      await ApiService.register(
        nombre:    nombre,
        apellido:  apellido,
        correo:    correo,
        password:  password,
        telefono:  telefono,
        objetivo:  _objetivo,
        peso:      pesoVal,
        estatura:  estaturaVal,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('¡Cuenta creada! Ahora inicia sesión.'),
          backgroundColor: Color(0xFFE53935),
          duration: Duration(seconds: 3),
        ),
      );
      Navigator.pop(context, correo); // devuelve el correo para pre-llenarlo
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Fondo gymBG
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
          // Overlay oscuro
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
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  const SizedBox(height: 32),
                  // Cabecera
                  const Icon(Icons.fitness_center, color: Colors.white, size: 56),
                  const SizedBox(height: 10),
                  const Text(
                    'HECTORGYM',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Crea tu cuenta de cliente',
                    style: TextStyle(color: Colors.white70, fontSize: 14, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 36),
                  // Tarjeta de registro
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
                          'Crear cuenta',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Ingresa tus datos para registrarte',
                          style: TextStyle(color: Colors.white54, fontSize: 13),
                        ),
                        const SizedBox(height: 24),
                        // Nombre + Apellido en fila
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _nombreController,
                                textCapitalization: TextCapitalization.words,
                                style: const TextStyle(color: Colors.white),
                                decoration: const InputDecoration(
                                  labelText: 'Nombre *',
                                  prefixIcon: Icon(Icons.person_outlined),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextField(
                                controller: _apellidoController,
                                textCapitalization: TextCapitalization.words,
                                style: const TextStyle(color: Colors.white),
                                decoration: const InputDecoration(
                                  labelText: 'Apellido *',
                                  prefixIcon: Icon(Icons.person_outlined),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _correoController,
                          keyboardType: TextInputType.emailAddress,
                          style: const TextStyle(color: Colors.white),
                          decoration: const InputDecoration(
                            labelText: 'Correo electrónico *',
                            prefixIcon: Icon(Icons.email_outlined),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _telefonoController,
                          keyboardType: TextInputType.phone,
                          style: const TextStyle(color: Colors.white),
                          decoration: const InputDecoration(
                            labelText: 'Teléfono *',
                            prefixIcon: Icon(Icons.phone_outlined),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _passwordController,
                          obscureText: !_showPass,
                          style: const TextStyle(color: Colors.white),
                          onSubmitted: (_) => _register(),
                          decoration: InputDecoration(
                            labelText: 'Contraseña * (mín. 6 caracteres)',
                            prefixIcon: const Icon(Icons.lock_outlined),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _showPass ? Icons.visibility_off : Icons.visibility,
                                color: Colors.white38,
                              ),
                              onPressed: () => setState(() => _showPass = !_showPass),
                            ),
                          ),
                        ),
                        // ── Datos opcionales ──────────────────────────
                        const SizedBox(height: 20),
                        Row(
                          children: [
                            const Expanded(child: Divider(color: Colors.white12)),
                            const SizedBox(width: 10),
                            const Text(
                              'Datos opcionales',
                              style: TextStyle(color: Colors.white38, fontSize: 11, letterSpacing: 1),
                            ),
                            const SizedBox(width: 10),
                            const Expanded(child: Divider(color: Colors.white12)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          value: _objetivo,
                          dropdownColor: const Color(0xFF1a1d24),
                          style: const TextStyle(color: Colors.white),
                          decoration: const InputDecoration(
                            labelText: 'Objetivo de entrenamiento',
                            prefixIcon: Icon(Icons.track_changes_outlined),
                          ),
                          items: [
                            const DropdownMenuItem(value: null, child: Text('— Sin especificar —', style: TextStyle(color: Colors.white54))),
                            ..._objetivos.map((o) => DropdownMenuItem(value: o, child: Text(o))),
                          ],
                          onChanged: (v) => setState(() => _objetivo = v),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _pesoController,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                style: const TextStyle(color: Colors.white),
                                decoration: const InputDecoration(
                                  labelText: 'Peso (kg)',
                                  prefixIcon: Icon(Icons.monitor_weight_outlined),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextField(
                                controller: _estaturaController,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                style: const TextStyle(color: Colors.white),
                                decoration: const InputDecoration(
                                  labelText: 'Estatura (m)',
                                  prefixIcon: Icon(Icons.height_outlined),
                                ),
                              ),
                            ),
                          ],
                        ),
                        // Error box
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
                                const Icon(Icons.error_outline,
                                    color: Colors.redAccent, size: 18),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(_error!,
                                      style: const TextStyle(
                                          color: Colors.redAccent, fontSize: 13)),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 28),
                        // Botón registrarse
                        FilledButton(
                          onPressed: _loading ? null : _register,
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
                                    Text('CREAR CUENTA',
                                        style: TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w800,
                                            letterSpacing: 2)),
                                    SizedBox(width: 8),
                                    Icon(Icons.how_to_reg, size: 18),
                                  ],
                                ),
                        ),
                        const SizedBox(height: 20),
                        // Volver al login
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('¿Ya tienes cuenta? ',
                                style: TextStyle(color: Colors.white54, fontSize: 13)),
                            GestureDetector(
                              onTap: () => Navigator.pop(context),
                              child: const Text(
                                'Inicia sesión',
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
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
