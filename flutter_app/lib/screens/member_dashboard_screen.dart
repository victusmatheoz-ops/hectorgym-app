import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/api_service.dart';
import 'tabs/home_tab.dart';
import 'tabs/rutina_tab.dart';
import 'tabs/pagos_tab.dart';
import 'tabs/perfil_tab.dart';

class MemberDashboardScreen extends StatefulWidget {
  const MemberDashboardScreen({super.key});

  @override
  State<MemberDashboardScreen> createState() => _MemberDashboardScreenState();
}

class _MemberDashboardScreenState extends State<MemberDashboardScreen> {
  Map<String, dynamic>? _user;
  Map<String, dynamic>? _membership;
  Map<String, dynamic>? _routine;
  List<dynamic> _payments = [];
  bool _loading = true;
  String? _error;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() { _loading = true; _error = null; });

    try {
      final user = await ApiService.obtenerUsuarioGuardado();
      if (user == null) throw Exception('No hay sesión activa');

      final membership = await ApiService.obtenerMiMembresia(user['id'] as int);
      final payments  = await ApiService.obtenerMisPagos(user['id'] as int);

      Map<String, dynamic>? routine;
      try {
        routine = await ApiService.obtenerMiRutina(user['id'] as int);
      } catch (_) {
        routine = null;
      }

      if (mounted) {
        setState(() {
          _user = user;
          _membership = membership;
          _payments = payments;
          _routine = routine;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _logout() async {
    await ApiService.cerrarSesion();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  static const _titles = ['Inicio', 'Mi Rutina', 'Pagos', 'Perfil'];

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: Color(0xFFE53935)),
              SizedBox(height: 16),
              Text('Cargando tu perfil...',
                  style: TextStyle(color: Colors.white54, fontSize: 14)),
            ],
          ),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.wifi_off, color: Colors.red, size: 56),
                const SizedBox(height: 16),
                const Text('Error de conexión',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Text(_error!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white38, fontSize: 13)),
                const SizedBox(height: 24),
                FilledButton.icon(
                  onPressed: _loadData,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Reintentar'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final tabs = [
      HomeTab(user: _user!, membership: _membership),
      RutinaTab(rutina: _routine),
      PagosTab(pagos: _payments),
      PerfilTab(user: _user!, membership: _membership, onLogout: _logout),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.fitness_center, color: Color(0xFFE53935), size: 22),
            const SizedBox(width: 8),
            const Text('HECTORGYM'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white54, size: 20),
            onPressed: _loadData,
            tooltip: 'Actualizar',
          ),
        ],
      ),
      body: RefreshIndicator(
        color: const Color(0xFFE53935),
        onRefresh: _loadData,
        child: tabs[_currentIndex],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          // Intenta abrir WhatsApp directamente; si no, abre wa.me en el navegador
          final waUri = Uri.parse('whatsapp://send?phone=573006520609');
          final webUri = Uri.parse('https://wa.me/573006520609');
          try {
            if (await canLaunchUrl(waUri)) {
              await launchUrl(waUri, mode: LaunchMode.externalApplication);
            } else {
              await launchUrl(webUri, mode: LaunchMode.externalApplication);
            }
          } catch (_) {
            await launchUrl(webUri, mode: LaunchMode.externalApplication);
          }
        },
        backgroundColor: const Color(0xFF25D366),
        elevation: 4,
        tooltip: 'Contactar al gym por WhatsApp',
        child: Stack(
          alignment: Alignment.center,
          children: const [
            Icon(Icons.chat_bubble, color: Colors.white, size: 28),
            Padding(
              padding: EdgeInsets.only(bottom: 2),
              child: Text(
                'W',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Inicio',
          ),
          NavigationDestination(
            icon: Icon(Icons.fitness_center_outlined),
            selectedIcon: Icon(Icons.fitness_center),
            label: 'Rutina',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long),
            label: 'Pagos',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }
}