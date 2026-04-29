import 'package:flutter/material.dart';
import 'home_gate.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  static const _red = Color(0xFFE53935);
  static const _bg  = Color(0xFF0A0A0A);

  late final AnimationController _logoCtrl;
  late final AnimationController _textCtrl;
  late final AnimationController _lineCtrl;
  late final AnimationController _exitCtrl;

  late final Animation<double> _logoFade;
  late final Animation<double> _logoScale;
  late final Animation<double> _textFade;
  late final Animation<double> _textSlide;
  late final Animation<double> _lineWidth;
  late final Animation<double> _exitFade;

  @override
  void initState() {
    super.initState();

    // Logo: fade + scale up
    _logoCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _logoFade  = CurvedAnimation(parent: _logoCtrl, curve: Curves.easeOut);
    _logoScale = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _logoCtrl, curve: Curves.easeOutBack),
    );

    // Text: fade + slide up
    _textCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _textFade  = CurvedAnimation(parent: _textCtrl, curve: Curves.easeOut);
    _textSlide = Tween<double>(begin: 20, end: 0).animate(
      CurvedAnimation(parent: _textCtrl, curve: Curves.easeOut),
    );

    // Red underline expand
    _lineCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _lineWidth = CurvedAnimation(parent: _lineCtrl, curve: Curves.easeOut);

    // Exit fade-out
    _exitCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _exitFade = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(parent: _exitCtrl, curve: Curves.easeIn),
    );

    _runSequence();
  }

  Future<void> _runSequence() async {
    await Future.delayed(const Duration(milliseconds: 200));
    await _logoCtrl.forward();
    await Future.delayed(const Duration(milliseconds: 100));
    _textCtrl.forward();
    await Future.delayed(const Duration(milliseconds: 150));
    await _lineCtrl.forward();
    // Hold for a moment, then fade out and navigate
    await Future.delayed(const Duration(milliseconds: 900));
    await _exitCtrl.forward();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const HomeGate(),
          transitionDuration: Duration.zero,
        ),
      );
    }
  }

  @override
  void dispose() {
    _logoCtrl.dispose();
    _textCtrl.dispose();
    _lineCtrl.dispose();
    _exitCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _exitFade,
      child: Scaffold(
        backgroundColor: _bg,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Dumbbell icon with glow
              ScaleTransition(
                scale: _logoScale,
                child: FadeTransition(
                  opacity: _logoFade,
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _red.withOpacity(0.12),
                      boxShadow: [
                        BoxShadow(
                          color: _red.withOpacity(0.35),
                          blurRadius: 48,
                          spreadRadius: 4,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.fitness_center,
                      color: _red,
                      size: 48,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // HECTORGYM text
              AnimatedBuilder(
                animation: _textCtrl,
                builder: (_, __) => Opacity(
                  opacity: _textFade.value,
                  child: Transform.translate(
                    offset: Offset(0, _textSlide.value),
                    child: RichText(
                      text: const TextSpan(
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 5,
                          color: Colors.white,
                        ),
                        children: [
                          TextSpan(text: 'HECTOR'),
                          TextSpan(
                            text: 'GYM',
                            style: TextStyle(color: _red),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Red animated underline
              AnimatedBuilder(
                animation: _lineCtrl,
                builder: (_, __) => Align(
                  alignment: Alignment.center,
                  child: FractionallySizedBox(
                    widthFactor: _lineWidth.value * 0.55,
                    child: Container(height: 2, color: _red),
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Subtitle
              FadeTransition(
                opacity: _textFade,
                child: const Text(
                  'DONDE SE FORJAN LOS CAMPEONES',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 3,
                    color: Colors.white38,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
