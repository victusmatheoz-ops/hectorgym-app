import 'package:flutter/material.dart';

class RutinaTab extends StatelessWidget {
  final Map<String, dynamic>? rutina;

  const RutinaTab({super.key, required this.rutina});

  static const _red = Color(0xFFE53935);

  String _nivelLabel(String? nivel) {
    switch (nivel?.toLowerCase()) {
      case 'principiante': return 'PRINCIPIANTE';
      case 'intermedio':   return 'INTERMEDIO';
      case 'avanzado':     return 'AVANZADO';
      default:             return nivel?.toUpperCase() ?? 'GENERAL';
    }
  }

  Color _nivelColor(String? nivel) {
    switch (nivel?.toLowerCase()) {
      case 'principiante': return const Color(0xFF2E7D32);
      case 'intermedio':   return const Color(0xFFE65100);
      case 'avanzado':     return _red;
      default:             return Colors.blueGrey;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (rutina == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Icon(Icons.fitness_center, color: Colors.white12, size: 72),
              SizedBox(height: 16),
              Text(
                'Sin rutina asignada',
                style: TextStyle(color: Colors.white38, fontSize: 18, fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 8),
              Text(
                'Habla con tu entrenador para que te asigne una rutina personalizada.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white24, fontSize: 13, height: 1.5),
              ),
            ],
          ),
        ),
      );
    }

    final nombre = rutina!['nombre'] ?? 'Mi Rutina';
    final objetivo = rutina!['objetivo'] ?? '';
    final nivel = rutina!['nivel'] as String?;
    final ejercicios = (rutina!['ejercicios'] as List<dynamic>?) ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header de la rutina
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF8B0000), Color(0xFFE53935)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.fitness_center, color: Colors.white70, size: 22),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _nivelLabel(nivel),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  nombre,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                if (objetivo.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    objetivo,
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ],
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Icon(Icons.straighten, color: Colors.white54, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      '${ejercicios.length} ejercicios',
                      style: const TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),

          const Text(
            'EJERCICIOS',
            style: TextStyle(
              color: Colors.white38,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 14),

          if (ejercicios.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text('No hay ejercicios en esta rutina',
                    style: TextStyle(color: Colors.white38)),
              ),
            )
          else
            ...ejercicios.asMap().entries.map((entry) {
              final i = entry.key;
              final ej = entry.value as Map<String, dynamic>;
              return _EjercicioCard(index: i + 1, ejercicio: ej);
            }),
        ],
      ),
    );
  }
}

class _EjercicioCard extends StatelessWidget {
  final int index;
  final Map<String, dynamic> ejercicio;

  const _EjercicioCard({required this.index, required this.ejercicio});

  static const _red = Color(0xFFE53935);

  @override
  Widget build(BuildContext context) {
    final nombre = ejercicio['nombre'] ?? 'Ejercicio $index';
    final series = ejercicio['series']?.toString() ?? '-';
    final reps = ejercicio['repeticiones']?.toString() ?? '-';
    final descanso = ejercicio['descanso_segundos'];
    final musculos = ejercicio['grupo_muscular'] ?? ejercicio['musculo'] ?? '';
    final notas = ejercicio['notas'] ?? '';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white10),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Número
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: _red.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(
                  '$index',
                  style: const TextStyle(
                    color: _red,
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    nombre,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                  if (musculos.toString().isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(musculos.toString(),
                        style: const TextStyle(color: Colors.white38, fontSize: 12)),
                  ],
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      _StatChip(icon: Icons.repeat, label: '$series series'),
                      const SizedBox(width: 8),
                      _StatChip(icon: Icons.fitness_center, label: '$reps reps'),
                      if (descanso != null) ...[
                        const SizedBox(width: 8),
                        _StatChip(
                            icon: Icons.timer_outlined,
                            label: '${descanso}s'),
                      ],
                    ],
                  ),
                  if (notas.toString().isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      notas.toString(),
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 12,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _StatChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: Colors.white38),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11)),
        ],
      ),
    );
  }
}
