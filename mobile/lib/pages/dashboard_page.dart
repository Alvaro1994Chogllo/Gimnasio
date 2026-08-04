import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'list_page.dart';
import 'home_page.dart';

class DashboardPage extends StatefulWidget {
  final UserSession session;
  const DashboardPage({super.key, required this.session});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  void _openList(String title) {
    if (!mounted) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ListPage(title: title, session: widget.session),
      ),
    );
  }

  void _logout() {
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => const HomePage()),
      (route) => false,
    );
  }

  // ─── Widget de botón de menú ─────────────────────────────────────────────────

  Widget _buildMenuButton(String label, String icon, VoidCallback onPressed) {
    return SizedBox(
      width: 140,
      height: 110,
      child: Container(
        margin: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: const Color(0xFF1a1a1a),
          border: Border.all(color: const Color(0xFF2a2a2a)),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          child: InkWell(
            borderRadius: BorderRadius.circular(8),
            onTap: onPressed,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(icon, style: const TextStyle(fontSize: 28)),
                const SizedBox(height: 8),
                Text(
                  label,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFFf36100),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ─── Construye los botones según el rol del usuario ───────────────────────────

  List<Widget> _buildMenuItems() {
    final role = widget.session.role;

    if (role == 'ADMIN') {
      return [
        _buildMenuButton('Socios', '👥', () => _openList('Socios')),
        _buildMenuButton('Membresías', '🎫', () => _openList('Membresías')),
        _buildMenuButton('Zonas', '📍', () => _openList('Zonas')),
        _buildMenuButton('Entrenadores', '💪', () => _openList('Entrenadores')),
        _buildMenuButton('Reservas', '📅', () => _openList('Reservas')),
      ];
    }

    if (role == 'ENTRENADOR') {
      return [
        _buildMenuButton('Zonas', '📍', () => _openList('Zonas')),
        _buildMenuButton('Reservas', '📅', () => _openList('Reservas')),
      ];
    }

    // SOCIO
    return [
      _buildMenuButton('Mis Reservas', '📅', () => _openList('Mis Reservas')),
      _buildMenuButton('Zonas', '📍', () => _openList('Zonas')),
    ];
  }

  // ─── Badge de rol coloreado ───────────────────────────────────────────────────

  Widget _buildRoleBadge() {
    final role = widget.session.role;
    Color color;
    String label;
    IconData icon;

    switch (role) {
      case 'ADMIN':
        color = const Color(0xFFf36100);
        label = 'Administrador';
        icon = Icons.admin_panel_settings;
        break;
      case 'ENTRENADOR':
        color = const Color(0xFF2196f3);
        label = 'Entrenador';
        icon = Icons.fitness_center;
        break;
      default:
        color = const Color(0xFF4caf50);
        label = 'Socio';
        icon = Icons.person;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        border: Border.all(color: color.withValues(alpha: 0.4)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 14),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  String get _roleDescription {
    switch (widget.session.role) {
      case 'ADMIN':
        return 'Acceso total: gestión de socios, membresías, zonas, entrenadores y reservas.';
      case 'ENTRENADOR':
        return 'Puedes consultar zonas disponibles y ver las reservas asignadas.';
      default:
        return 'Puedes consultar zonas disponibles y gestionar tus reservas.';
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor: const Color(0xFF111111),
        appBar: AppBar(
          backgroundColor: const Color(0xFF111111),
          elevation: 0,
          leading: const SizedBox.shrink(),
          title: const Text(
            'PANEL DE GESTIÓN',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              letterSpacing: 2,
            ),
          ),
          centerTitle: true,
          actions: [
            IconButton(
              icon: const Icon(Icons.logout, color: Color(0xFFf36100)),
              tooltip: 'Cerrar sesión',
              onPressed: _logout,
            ),
          ],
        ),
        body: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Card de bienvenida
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1a1a1a),
                    border: Border.all(color: const Color(0xFF2a2a2a)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              'Bienvenido, ${widget.session.username}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          _buildRoleBadge(),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _roleDescription,
                        style: const TextStyle(
                          color: Color(0xFFA0A0A0),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Título de módulos
                const Text(
                  'MÓDULOS DISPONIBLES',
                  style: TextStyle(
                    color: Color(0xFF666666),
                    fontSize: 11,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 12),

                // Grid de módulos según rol
                Wrap(
                  alignment: WrapAlignment.start,
                  children: _buildMenuItems(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
