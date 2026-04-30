import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class MaquinasTab extends StatefulWidget {
  const MaquinasTab({super.key});

  @override
  State<MaquinasTab> createState() => _MaquinasTabState();
}

class _MaquinasTabState extends State<MaquinasTab> {
  List<dynamic> _maquinas = [];
  List<dynamic> _filtradas = [];
  bool _loading = true;
  String? _error;
  String _filtro = 'todas'; // 'todas' | 'disponible' | 'mantenimiento'

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() { _loading = true; _error = null; });
    try {
      final data = await ApiService.obtenerMaquinas();
      if (mounted) {
        setState(() {
          _maquinas = data;
          _aplicarFiltro(_filtro);
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _aplicarFiltro(String filtro) {
    setState(() {
      _filtro = filtro;
      if (filtro == 'disponible') {
        _filtradas = _maquinas.where((m) => m['activa'] == 1 || m['activa'] == true).toList();
      } else if (filtro == 'mantenimiento') {
        _filtradas = _maquinas.where((m) => m['activa'] == 0 || m['activa'] == false).toList();
      } else {
        _filtradas = List.from(_maquinas);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: Color(0xFFE53935)),
            SizedBox(height: 14),
            Text('Cargando máquinas...', style: TextStyle(color: Colors.white54, fontSize: 13)),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off, color: Colors.red, size: 48),
              const SizedBox(height: 14),
              Text(_error!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white54, fontSize: 13)),
              const SizedBox(height: 20),
              FilledButton.icon(
                onPressed: _cargar,
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFFE53935)),
              ),
            ],
          ),
        ),
      );
    }

    final total = _maquinas.length;
    final disponibles = _maquinas.where((m) => m['activa'] == 1 || m['activa'] == true).length;
    final enMantenimiento = total - disponibles;

    return RefreshIndicator(
      color: const Color(0xFFE53935),
      onRefresh: _cargar,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          // Header con resumen
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'MÁQUINAS',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Estado actual del equipamiento',
                    style: TextStyle(color: Colors.white.withOpacity(0.45), fontSize: 13),
                  ),
                  const SizedBox(height: 16),
                  // Tarjetas de resumen
                  Row(
                    children: [
                      _SummaryCard(
                        label: 'Total',
                        value: total.toString(),
                        color: Colors.white24,
                        icon: Icons.fitness_center,
                      ),
                      const SizedBox(width: 10),
                      _SummaryCard(
                        label: 'Disponibles',
                        value: disponibles.toString(),
                        color: const Color(0xFF1B5E20),
                        icon: Icons.check_circle_outline,
                      ),
                      const SizedBox(width: 10),
                      _SummaryCard(
                        label: 'Mantenimiento',
                        value: enMantenimiento.toString(),
                        color: const Color(0xFF7F0000),
                        icon: Icons.build_outlined,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Filtros
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _FiltroChip(label: 'Todas', value: 'todas', selected: _filtro == 'todas', onTap: _aplicarFiltro),
                        const SizedBox(width: 8),
                        _FiltroChip(label: '✓ Disponibles', value: 'disponible', selected: _filtro == 'disponible', onTap: _aplicarFiltro),
                        const SizedBox(width: 8),
                        _FiltroChip(label: '⚙ Mantenimiento', value: 'mantenimiento', selected: _filtro == 'mantenimiento', onTap: _aplicarFiltro),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Lista de máquinas
          if (_filtradas.isEmpty)
            const SliverFillRemaining(
              child: Center(
                child: Text(
                  'No hay máquinas en este estado',
                  style: TextStyle(color: Colors.white38, fontSize: 14),
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (ctx, i) => _MaquinaCard(maquina: _filtradas[i]),
                  childCount: _filtradas.length,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Tarjeta de resumen ────────────────────────────────────────
class _SummaryCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final IconData icon;

  const _SummaryCard({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.25),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.5), width: 1),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.white70, size: 18),
            const SizedBox(height: 6),
            Text(value,
                style: const TextStyle(
                    color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
            const SizedBox(height: 2),
            Text(label,
                style: TextStyle(
                    color: Colors.white.withOpacity(0.55),
                    fontSize: 10,
                    letterSpacing: 0.5)),
          ],
        ),
      ),
    );
  }
}

// ── Chip de filtro ────────────────────────────────────────────
class _FiltroChip extends StatelessWidget {
  final String label;
  final String value;
  final bool selected;
  final void Function(String) onTap;

  const _FiltroChip({
    required this.label,
    required this.value,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onTap(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFE53935) : Colors.white10,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? const Color(0xFFE53935) : Colors.white24,
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : Colors.white60,
            fontSize: 12,
            fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
          ),
        ),
      ),
    );
  }
}

// ── Tarjeta de máquina ────────────────────────────────────────
class _MaquinaCard extends StatelessWidget {
  final Map<String, dynamic> maquina;

  const _MaquinaCard({required this.maquina});

  @override
  Widget build(BuildContext context) {
    final bool disponible = maquina['activa'] == 1 || maquina['activa'] == true;
    final String nombre = maquina['nombre'] ?? 'Máquina';
    final String? descripcion = maquina['descripcion'] as String?;
    final String? grupos = maquina['grupos_musculares'] as String?;
    final String? ejercicios = maquina['ejercicios'] as String?;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF121212),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: disponible
              ? const Color(0xFF2E7D32).withOpacity(0.4)
              : const Color(0xFFB71C1C).withOpacity(0.4),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icono de estado
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: disponible
                    ? const Color(0xFF2E7D32).withOpacity(0.15)
                    : const Color(0xFFB71C1C).withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                disponible ? Icons.fitness_center : Icons.build,
                color: disponible ? const Color(0xFF66BB6A) : const Color(0xFFEF5350),
                size: 22,
              ),
            ),
            const SizedBox(width: 14),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          nombre,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(
                          color: disponible
                              ? const Color(0xFF1B5E20)
                              : const Color(0xFF7F0000),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              disponible ? Icons.check_circle : Icons.warning_amber,
                              color: disponible ? const Color(0xFF69F0AE) : const Color(0xFFFFCDD2),
                              size: 11,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              disponible ? 'Disponible' : 'Mantenimiento',
                              style: TextStyle(
                                color: disponible ? const Color(0xFF69F0AE) : const Color(0xFFFFCDD2),
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (descripcion != null && descripcion.isNotEmpty) ...[
                    const SizedBox(height: 5),
                    Text(
                      descripcion,
                      style: TextStyle(
                          color: Colors.white.withOpacity(0.5), fontSize: 12),
                    ),
                  ],
                  if (grupos != null && grupos.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: grupos
                          .split(',')
                          .map((g) => g.trim())
                          .where((g) => g.isNotEmpty)
                          .map((g) => Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE53935).withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                      color: const Color(0xFFE53935).withOpacity(0.25)),
                                ),
                                child: Text(g,
                                    style: const TextStyle(
                                        color: Color(0xFFEF9A9A),
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600)),
                              ))
                          .toList(),
                    ),
                  ],
                  if (ejercicios != null && ejercicios.isNotEmpty) ...[
                    const SizedBox(height: 5),
                    Text(
                      'Ejercicios: $ejercicios',
                      style: TextStyle(
                          color: Colors.white.withOpacity(0.35),
                          fontSize: 11),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
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
