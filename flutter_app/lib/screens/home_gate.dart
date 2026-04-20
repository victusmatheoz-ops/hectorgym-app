import 'package:flutter/material.dart';

import '../services/api_service.dart';
import 'login_screen.dart';
import 'member_dashboard_screen.dart';

class HomeGate extends StatefulWidget {
  const HomeGate({super.key});

  @override
  State<HomeGate> createState() => _HomeGateState();
}

class _HomeGateState extends State<HomeGate> {
  Future<Map<String, dynamic>?> _loadSession() async {
    return ApiService.obtenerUsuarioGuardado();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>?>(
      future: _loadSession(),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final user = snapshot.data;
        if (user == null) {
          return const LoginScreen();
        }

        return const MemberDashboardScreen();
      },
    );
  }
}