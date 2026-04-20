import 'package:flutter/material.dart';

class PagosTab extends StatelessWidget {
  final List<dynamic> pagos;

  const PagosTab({super.key, required this.pagos});

  String _formatCOP(dynamic monto) {
    if (monto == null) return 'COP 0';
    final n = double.tryParse(monto.toString()) ?? 0;
    return 'COP \$${n.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]}.',
    )}';
  }

  @override
  Widget build(BuildContext context) {
    if (pagos.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Icon(Icons.receipt_long, color: Colors.white12, size: 72),
              SizedBox(height: 16),
              Text(
                'Sin pagos registrados',
                style: TextStyle(
                    color: Colors.white38, fontSize: 18, fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 8),
              Text(
                'Tus pagos aparecerán aquí una vez que el administrador los registre.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white24, fontSize: 13, height: 1.5),
              ),
            ],
          ),
        ),
      );
    }

    // Total pagado
    final total = pagos.fold<double>(0, (sum, p) {
      final m = double.tryParse(p['monto']?.toString() ?? '0') ?? 0;
      return sum + m;
    });

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Resumen total
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E1E),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white10),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1565C0).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.account_balance_wallet,
                      color: Color(0xFF42A5F5), size: 28),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Total pagado',
                        style: TextStyle(color: Colors.white54, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text(
                      _formatCOP(total),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      '${pagos.length} pago${pagos.length != 1 ? 's' : ''}',
                      style: const TextStyle(color: Colors.white38, fontSize: 12),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),

          const Text(
            'HISTORIAL',
            style: TextStyle(
              color: Colors.white38,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 14),

          ...pagos.map((p) => _PagoCard(pago: p, formatCOP: _formatCOP)),
        ],
      ),
    );
  }
}

class _PagoCard extends StatelessWidget {
  final dynamic pago;
  final String Function(dynamic) formatCOP;

  const _PagoCard({required this.pago, required this.formatCOP});

  @override
  Widget build(BuildContext context) {
    final tipo = pago['tipo_membresia'] ?? pago['descripcion'] ?? 'Pago';
    final fecha = pago['fecha'] ?? pago['fecha_pago'] ?? '-';
    final monto = pago['monto'];
    final metodo = pago['metodo_pago'] ?? 'efectivo';

    final metodoIcon = metodo == 'tarjeta'
        ? Icons.credit_card
        : metodo == 'transferencia'
        ? Icons.account_balance
        : Icons.payments_outlined;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(metodoIcon, color: Colors.greenAccent, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tipo,
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 14)),
                const SizedBox(height: 3),
                Text(fecha,
                    style: const TextStyle(color: Colors.white38, fontSize: 12)),
              ],
            ),
          ),
          Text(
            formatCOP(monto),
            style: const TextStyle(
              color: Colors.greenAccent,
              fontWeight: FontWeight.w700,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}
