import 'package:flutter/material.dart';

import '../../services/api_service.dart';

class PerfilTab extends StatelessWidget {
  final Map<String, dynamic> user;
  final Map<String, dynamic>? membership;
  final VoidCallback onLogout;

  const PerfilTab({
    super.key,
    required this.user,
    required this.membership,
    required this.onLogout,
  });

  static const _red = Color(0xFFE53935);

  Future<void> _confirmarCerrarSesion(BuildContext context) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cerrar sesión',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        content: const Text('¿Seguro que quieres salir?',
            style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar', style: TextStyle(color: Colors.white54)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child:
                const Text('Salir', style: TextStyle(color: Color(0xFFE53935))),
          ),
        ],
      ),
    );
    if (confirm == true) onLogout();
  }

  @override
  Widget build(BuildContext context) {
    final nombre = '${user['nombre'] ?? ''} ${user['apellido'] ?? ''}'.trim();
    final correo = user['correo'] ?? '';
    final tipo = membership?['tipo'] ?? 'Sin membresía';
    final diasRestantes = membership?['dias_restantes'] ?? 0;
    final estado = membership?['estado'] ?? 'pendiente';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar + nombre
          Center(
            child: Column(
              children: [
                Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF8B0000), _red],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      nombre.isNotEmpty ? nombre[0].toUpperCase() : 'U',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 36,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  nombre,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  correo,
                  style: const TextStyle(color: Colors.white38, fontSize: 14),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),

          // Info membresía
          _InfoSection(
            title: 'MEMBRESÍA',
            items: [
              _InfoItem(
                icon: Icons.card_membership,
                label: 'Plan',
                value: tipo,
              ),
              _InfoItem(
                icon: Icons.event_available,
                label: 'Estado',
                value: estado,
                valueColor: estado == 'activa' ? Colors.greenAccent : Colors.orangeAccent,
              ),
              _InfoItem(
                icon: Icons.hourglass_bottom,
                label: 'Días restantes',
                value: '$diasRestantes días',
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Info cuenta
          _InfoSection(
            title: 'MI CUENTA',
            items: [
              _InfoItem(
                icon: Icons.person_outline,
                label: 'Nombre',
                value: nombre,
              ),
              _InfoItem(
                icon: Icons.email_outlined,
                label: 'Correo',
                value: correo,
              ),
            ],
          ),
          const SizedBox(height: 28),

          // Botón cerrar sesión
          OutlinedButton.icon(
            onPressed: () => _confirmarCerrarSesion(context),
            icon: const Icon(Icons.logout, color: _red, size: 18),
            label: const Text('Cerrar sesión',
                style: TextStyle(color: _red, fontWeight: FontWeight.w600)),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 52),
              side: const BorderSide(color: Color(0xFFE53935), width: 1.5),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 16),
          const Center(
            child: Text(
              'HECTORGYM v1.0',
              style: TextStyle(color: Colors.white24, fontSize: 11, letterSpacing: 2),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoSection extends StatelessWidget {
  final String title;
  final List<_InfoItem> items;

  const _InfoSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: Colors.white38,
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFF1E1E1E),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white10),
          ),
          child: Column(
            children: items.asMap().entries.map((entry) {
              final i = entry.key;
              final item = entry.value;
              return Column(
                children: [
                  if (i > 0) const Divider(height: 1, color: Colors.white10),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    child: Row(
                      children: [
                        Icon(item.icon, color: Colors.white38, size: 18),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Text(item.label,
                              style: const TextStyle(color: Colors.white54, fontSize: 14)),
                        ),
                        Text(
                          item.value,
                          style: TextStyle(
                            color: item.valueColor ?? Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _InfoItem {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  const _InfoItem({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });
}
