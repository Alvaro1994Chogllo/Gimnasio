import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/socio.dart';
import '../models/membresia.dart';
import '../models/zona.dart';
import '../models/entrenador.dart';
import '../models/reserva.dart';

class ListPage extends StatefulWidget {
  final String title;
  final UserSession session;

  const ListPage({super.key, required this.title, required this.session});

  @override
  State<ListPage> createState() => _ListPageState();
}

class _ListPageState extends State<ListPage> {
  final ApiService _api = ApiService();
  List<dynamic> _items = [];
  bool _loading = true;
  String _error = '';

  // Filtros para la vista de Reservas
  String _reservaFilter = 'TODO'; // 'TODO' | 'HOY' | 'SEMANA'

  // Datos auxiliares cargados para el formulario de reservas
  List<Socio> _auxSocios = [];
  List<Zona> _auxZonas = [];
  List<Entrenador> _auxEntrenadores = [];
  bool _loadingAux = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  String get _token => widget.session.token;
  bool get _isAdmin => widget.session.isAdmin;
  bool get _isSocio => widget.session.isSocio;
  bool get _isEntrenador => widget.session.isEntrenador;

  /// Carga la lista principal del módulo activo
  Future<void> _loadData() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      List<dynamic> fetched = [];
      switch (widget.title) {
        case 'Socios':
          fetched = await _api.fetchSocios(_token);
          break;
        case 'Membresías':
          fetched = await _api.fetchMembresias(_token);
          break;
        case 'Zonas':
          fetched = await _api.fetchZonas(_token);
          break;
        case 'Entrenadores':
          fetched = await _api.fetchEntrenadores(_token);
          break;
        case 'Reservas':
        case 'Mis Reservas':
          final all = await _api.fetchReservas(_token);
          if (widget.title == 'Mis Reservas' && _isSocio) {
            fetched = all.where((r) => r.socio == widget.session.socioId).toList();
          } else if (_isEntrenador) {
            fetched = all.where((r) => r.entrenador == widget.session.entrenadorId).toList();
          } else {
            fetched = all;
          }
          fetched.sort((a, b) => (b as Reserva).fechaReserva.compareTo((a as Reserva).fechaReserva));
          break;
      }

      if (!mounted) return;
      setState(() {
        _items = fetched;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
        _loading = false;
      });
    }
  }

  /// Carga datos complementarios para rellenar los selects en las reservas
  Future<void> _loadAuxiliaryData() async {
    if (_auxSocios.isNotEmpty && _auxZonas.isNotEmpty) return;
    if (!mounted) return;
    setState(() => _loadingAux = true);
    try {
      final s = await _api.fetchSocios(_token);
      final z = await _api.fetchZonas(_token);
      final e = await _api.fetchEntrenadores(_token);
      if (!mounted) return;
      setState(() {
        _auxSocios = s;
        _auxZonas = z.where((zona) => zona.disponible).toList();
        _auxEntrenadores = e;
        _loadingAux = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loadingAux = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cargar catálogos: $e')),
      );
    }
  }

  // ─── LÓGICA DE BORRADO ───────────────────────────────────────────────────────

  Future<void> _handleDelete(dynamic item) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1a1a1a),
        title: const Text('Confirmar eliminación', style: TextStyle(color: Colors.white)),
        content: const Text('¿Estás seguro de que deseas eliminar este registro? Esta acción es irreversible.',
            style: TextStyle(color: Colors.grey)),
        actions: [
          TextButton(
            child: const Text('Cancelar', style: TextStyle(color: Colors.grey)),
            onPressed: () => Navigator.pop(ctx, false),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Eliminar'),
            onPressed: () => Navigator.pop(ctx, true),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final id = item.id;
      switch (widget.title) {
        case 'Socios':
          await _api.deleteSocio(_token, id);
          break;
        case 'Membresías':
          await _api.deleteMembresia(_token, id);
          break;
        case 'Zonas':
          await _api.deleteZona(_token, id);
          break;
        case 'Entrenadores':
          await _api.deleteEntrenador(_token, id);
          break;
        case 'Reservas':
        case 'Mis Reservas':
          await _api.deleteReserva(_token, id);
          break;
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Registro eliminado correctamente')),
      );
      _loadData();
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al eliminar: $e'), backgroundColor: Colors.red),
      );
    }
  }

  // ─── DIÁLOGOS DE FORMULARIOS ──────────────────────────────────────────────

  void _showFormDialog([dynamic item]) {
    final isEdit = item != null;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1a1a1a),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            top: 20,
            left: 20,
            right: 20,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${isEdit ? "Editar" : "Nuevo"} ${widget.title.replaceAll('Mis ', '')}',
                      style: const TextStyle(
                        color: Color(0xFFf36100),
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white54),
                      onPressed: () => Navigator.pop(ctx),
                    )
                  ],
                ),
                const Divider(color: Colors.white24),
                const SizedBox(height: 10),
                _buildFormFields(ctx, item),
                const SizedBox(height: 30),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFormFields(BuildContext ctx, dynamic item) {
    switch (widget.title) {
      case 'Socios':
        return _SocioForm(
          item: item as Socio?,
          onSave: (data) => _saveData(data, item?.id),
        );
      case 'Membresías':
        return _MembresiaForm(
          item: item as Membresia?,
          onSave: (data) => _saveData(data, item?.id),
        );
      case 'Zonas':
        return _ZonaForm(
          item: item as Zona?,
          onSave: (data) => _saveData(data, item?.id),
        );
      case 'Entrenadores':
        return _EntrenadorForm(
          item: item as Entrenador?,
          onSave: (data) => _saveData(data, item?.id),
        );
      case 'Reservas':
      case 'Mis Reservas':
        return FutureBuilder(
          future: _loadAuxiliaryData(),
          builder: (fCtx, snapshot) {
            if (_loadingAux) {
              return const Center(
                child: Padding(
                  padding: EdgeInsets.all(20.0),
                  child: CircularProgressIndicator(color: Color(0xFFf36100)),
                ),
              );
            }
            return _ReservaForm(
              item: item as Reserva?,
              session: widget.session,
              socios: _auxSocios,
              zonas: _auxZonas,
              entrenadores: _auxEntrenadores,
              onSave: (data) => _saveData(data, item?.id),
            );
          },
        );
      default:
        return const SizedBox();
    }
  }

  Future<void> _saveData(Map<String, dynamic> data, [int? id]) async {
    if (!mounted) return;
    Navigator.pop(context); // Cierra bottom sheet
    setState(() => _loading = true);

    try {
      if (id == null) {
        switch (widget.title) {
          case 'Socios':
            await _api.createSocio(_token, data);
            break;
          case 'Membresías':
            await _api.createMembresia(_token, data);
            break;
          case 'Zonas':
            await _api.createZona(_token, data);
            break;
          case 'Entrenadores':
            await _api.createEntrenador(_token, data);
            break;
          case 'Reservas':
          case 'Mis Reservas':
            await _api.createReserva(_token, data);
            break;
        }
      } else {
        switch (widget.title) {
          case 'Socios':
            await _api.updateSocio(_token, id, data);
            break;
          case 'Membresías':
            await _api.updateMembresia(_token, id, data);
            break;
          case 'Zonas':
            await _api.updateZona(_token, id, data);
            break;
          case 'Entrenadores':
            await _api.updateEntrenador(_token, id, data);
            break;
          case 'Reservas':
          case 'Mis Reservas':
            await _api.updateReserva(_token, id, data);
            break;
        }
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Guardado con éxito')),
      );
      _loadData();
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF1a1a1a),
          title: const Text('Error al guardar', style: TextStyle(color: Colors.red)),
          content: Text(e.toString().replaceAll('Exception: ', ''), style: const TextStyle(color: Colors.white70)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Entendido', style: TextStyle(color: Color(0xFFf36100))),
            )
          ],
        ),
      );
    }
  }

  // ─── RENDERS DE TARJETAS PROFESIONALES POR RECURSO ──────────────────────────

  Widget _buildCard(dynamic item) {
    final bool canEditOrDelete = _isAdmin || (widget.title == 'Mis Reservas' && _isSocio && (item is Reserva && item.estado == 'CONFIRMADA'));

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF1c1c1c),
        border: Border.all(color: const Color(0xFF2c2c2c)),
        borderRadius: BorderRadius.circular(10),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Expanded(
              child: _buildItemDetails(item),
            ),
            if (canEditOrDelete) ...[
              IconButton(
                icon: const Icon(Icons.edit, color: Colors.blue, size: 20),
                onPressed: () => _showFormDialog(item),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                onPressed: () => _handleDelete(item),
              ),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildItemDetails(dynamic item) {
    if (item is Socio) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${item.nombre} ${item.apellido}',
            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          _infoText(Icons.badge_outlined, 'Cédula: ${item.cedula}'),
          _infoText(Icons.email_outlined, item.email),
          if (item.telefono.isNotEmpty) _infoText(Icons.phone_outlined, item.telefono),
          _infoText(Icons.calendar_today_outlined, 'Nació: ${item.fechaNacimiento}'),
          const SizedBox(height: 6),
          _statusBadge(item.activo ? 'ACTIVO' : 'INACTIVO', item.activo ? Colors.green : Colors.grey),
        ],
      );
    }

    if (item is Membresia) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                item.nombre,
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              Text(
                '\$${item.precio.toStringAsFixed(2)}',
                style: const TextStyle(color: Color(0xFFf36100), fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 6),
          if (item.descripcion.isNotEmpty)
            Text(
              item.descripcion,
              style: const TextStyle(color: Colors.grey, fontSize: 13),
            ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: _infoText(Icons.av_timer, 'Duración: ${item.duracionDias} días')),
              const SizedBox(width: 8),
              _statusBadge(item.activa ? 'ACTIVA' : 'PAUSADA', item.activa ? Colors.green : Colors.orange),
            ],
          ),
        ],
      );
    }

    if (item is Zona) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            item.nombre,
            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          if (item.descripcion.isNotEmpty)
            Text(item.descripcion, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: _infoText(Icons.people_outline, 'Capacidad máx: ${item.capacidadMaxima} alumnos')),
              const SizedBox(width: 8),
              _statusBadge(item.disponible ? 'DISPONIBLE' : 'MANTENIMIENTO', item.disponible ? Colors.green : Colors.red),
            ],
          ),
        ],
      );
    }

    if (item is Entrenador) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${item.nombre} ${item.apellido}',
            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          _infoText(Icons.workspace_premium_outlined, 'Especialidad: ${item.especialidad}'),
          _infoText(Icons.email_outlined, item.email),
          if (item.telefono.isNotEmpty) _infoText(Icons.phone_outlined, item.telefono),
          _infoText(Icons.hourglass_bottom_outlined, 'Capacidad: ${item.capacidadPorHora} alumnos/hora'),
        ],
      );
    }

    if (item is Reserva) {
      Color badgeCol = Colors.green;
      if (item.estado == 'CANCELADA') badgeCol = Colors.red;
      if (item.estado == 'ASISTIO') badgeCol = Colors.blue;

      final formattedDate = '${item.fechaReserva.day}/${item.fechaReserva.month}/${item.fechaReserva.year} '
          '${item.fechaReserva.hour.toString().padLeft(2, '0')}:00';

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Turno #${item.id}',
                style: const TextStyle(color: Color(0xFFf36100), fontWeight: FontWeight.bold, fontSize: 15),
              ),
              _statusBadge(item.estado, badgeCol),
            ],
          ),
          const SizedBox(height: 8),
          _infoText(Icons.calendar_month, 'Fecha: $formattedDate'),
          _infoText(Icons.room, 'Zona/Sala: ${item.zonaNombre}'),
          if (!_isSocio) _infoText(Icons.person, 'Socio: ${item.socioNombre}'),
          _infoText(Icons.fitness_center, 'Entrenador: ${item.entrenadorNombre}'),
        ],
      );
    }

    return const SizedBox();
  }

  Widget _infoText(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Row(
        children: [
          Icon(icon, size: 14, color: const Color(0xFFf36100)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(color: Colors.white70, fontSize: 13),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _statusBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        border: Border.all(color: color.withValues(alpha: 0.5)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
      ),
    );
  }

  // ─── RENDERS ADICIONALES PARA EL CALENDARIO/AGENDA DE RESERVAS ───────────────

  List<dynamic> _getFilteredReservas() {
    if (widget.title != 'Reservas' && widget.title != 'Mis Reservas') return _items;

    final now = DateTime.now();
    if (_reservaFilter == 'HOY') {
      return _items.where((item) {
        if (item is! Reserva) return false;
        return item.fechaReserva.year == now.year &&
            item.fechaReserva.month == now.month &&
            item.fechaReserva.day == now.day;
      }).toList();
    } else if (_reservaFilter == 'SEMANA') {
      final mondayThisWeek = now.subtract(Duration(days: now.weekday - 1));
      final sundayThisWeek = mondayThisWeek.add(const Duration(days: 6));
      return _items.where((item) {
        if (item is! Reserva) return false;
        return item.fechaReserva.isAfter(mondayThisWeek.subtract(const Duration(days: 1))) &&
            item.fechaReserva.isBefore(sundayThisWeek.add(const Duration(days: 1)));
      }).toList();
    }
    return _items;
  }

  Widget _buildReservasFilterBar() {
    if (widget.title != 'Reservas' && widget.title != 'Mis Reservas') return const SizedBox();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text('Agenda / Filtros:', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
          Row(
            children: [
              _filterChip('TODO', 'Ver todo'),
              const SizedBox(width: 6),
              _filterChip('HOY', 'Hoy'),
              const SizedBox(width: 6),
              _filterChip('SEMANA', 'Esta semana'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String code, String label) {
    final selected = _reservaFilter == code;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 11, color: selected ? Colors.white : Colors.grey)),
      selected: selected,
      selectedColor: const Color(0xFFf36100),
      backgroundColor: const Color(0xFF1a1a1a),
      onSelected: (val) {
        if (val) setState(() => _reservaFilter = code);
      },
    );
  }

  // ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final bool showAddButton = _isAdmin || (widget.title == 'Mis Reservas' && _isSocio);
    final displayedItems = _getFilteredReservas();

    return Scaffold(
      backgroundColor: const Color(0xFF111111),
      appBar: AppBar(
        backgroundColor: const Color(0xFF111111),
        title: Text(
          widget.title.toUpperCase(),
          style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 2, fontSize: 16),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFFf36100)),
            onPressed: _loadData,
          )
        ],
      ),
      body: Column(
        children: [
          _buildReservasFilterBar(),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFf36100)))
                : _error.isNotEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.error_outline, color: Colors.redAccent, size: 40),
                              const SizedBox(height: 10),
                              Text(_error, style: const TextStyle(color: Colors.white70), textAlign: TextAlign.center),
                              const SizedBox(height: 15),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFf36100)),
                                onPressed: _loadData,
                                child: const Text('Reintentar'),
                              )
                            ],
                          ),
                        ),
                      )
                    : displayedItems.isEmpty
                        ? const Center(
                            child: Text(
                              'No se encontraron registros',
                              style: TextStyle(color: Colors.white38),
                            ),
                          )
                        : ListView.builder(
                            itemCount: displayedItems.length,
                            itemBuilder: (context, index) => _buildCard(displayedItems[index]),
                          ),
          ),
        ],
      ),
      floatingActionButton: showAddButton
          ? FloatingActionButton(
              backgroundColor: const Color(0xFFf36100),
              child: const Icon(Icons.add, color: Colors.white),
              onPressed: () => _showFormDialog(),
            )
          : null,
    );
  }
}

// ─── FORMULARIOS ESPECÍFICOS DE DIÁLOGO ──────────────────────────────────────

class _SocioForm extends StatefulWidget {
  final Socio? item;
  final Function(Map<String, dynamic>) onSave;

  const _SocioForm({this.item, required this.onSave});

  @override
  State<_SocioForm> createState() => _SocioFormState();
}

class _SocioFormState extends State<_SocioForm> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _cedula;
  late TextEditingController _nombre;
  late TextEditingController _apellido;
  late TextEditingController _email;
  late TextEditingController _telefono;
  late TextEditingController _fechaNac;
  bool _activo = true;

  @override
  void initState() {
    super.initState();
    _cedula = TextEditingController(text: widget.item?.cedula ?? '');
    _nombre = TextEditingController(text: widget.item?.nombre ?? '');
    _apellido = TextEditingController(text: widget.item?.apellido ?? '');
    _email = TextEditingController(text: widget.item?.email ?? '');
    _telefono = TextEditingController(text: widget.item?.telefono ?? '');
    _fechaNac = TextEditingController(text: widget.item?.fechaNacimiento ?? '');
    _activo = widget.item?.activo ?? true;
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.item != null;
    return Form(
      key: _formKey,
      child: Column(
        children: [
          _input('Cédula (10 dígitos) *', _cedula, isNumber: true, isEnabled: !isEdit, isRequired: true, maxLen: 10),
          _input('Nombre *', _nombre, isRequired: true),
          _input('Apellido *', _apellido, isRequired: true),
          _input('Email *', _email, isEmail: true, isRequired: true),
          _input('Teléfono', _telefono, isNumber: true),
          _dateInput('Fecha de Nacimiento *', _fechaNac, isRequired: true),
          SwitchListTile(
            title: const Text('Socio Activo', style: TextStyle(color: Colors.white, fontSize: 14)),
            value: _activo,
            activeThumbColor: const Color(0xFFf36100),
            onChanged: (val) => setState(() => _activo = val),
          ),
          const SizedBox(height: 20),
          _submitBtn(),
        ],
      ),
    );
  }

  Widget _submitBtn() => SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFf36100), padding: const EdgeInsets.symmetric(vertical: 14)),
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              widget.onSave({
                'cedula': _cedula.text.trim(),
                'nombre': _nombre.text.trim(),
                'apellido': _apellido.text.trim(),
                'email': _email.text.trim(),
                'telefono': _telefono.text.trim(),
                'fecha_nacimiento': _fechaNac.text.trim(),
                'activo': _activo,
              });
            }
          },
          child: const Text('GUARDAR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      );
}

class _MembresiaForm extends StatefulWidget {
  final Membresia? item;
  final Function(Map<String, dynamic>) onSave;

  const _MembresiaForm({this.item, required this.onSave});

  @override
  State<_MembresiaForm> createState() => _MembresiaFormState();
}

class _MembresiaFormState extends State<_MembresiaForm> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nombre;
  late TextEditingController _desc;
  late TextEditingController _precio;
  late TextEditingController _duracion;
  bool _activa = true;

  @override
  void initState() {
    super.initState();
    _nombre = TextEditingController(text: widget.item?.nombre ?? '');
    _desc = TextEditingController(text: widget.item?.descripcion ?? '');
    _precio = TextEditingController(text: widget.item?.precio.toString() ?? '');
    _duracion = TextEditingController(text: widget.item?.duracionDias.toString() ?? '');
    _activa = widget.item?.activa ?? true;
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          _input('Nombre del Plan *', _nombre, isRequired: true),
          _input('Descripción', _desc),
          _input('Precio (\$) *', _precio, isDecimal: true, isRequired: true),
          _input('Duración (días) *', _duracion, isNumber: true, isRequired: true),
          SwitchListTile(
            title: const Text('Membresía Activa', style: TextStyle(color: Colors.white, fontSize: 14)),
            value: _activa,
            activeThumbColor: const Color(0xFFf36100),
            onChanged: (val) => setState(() => _activa = val),
          ),
          const SizedBox(height: 20),
          _submitBtn(),
        ],
      ),
    );
  }

  Widget _submitBtn() => SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFf36100), padding: const EdgeInsets.symmetric(vertical: 14)),
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              widget.onSave({
                'nombre': _nombre.text.trim(),
                'descripcion': _desc.text.trim(),
                'precio': double.parse(_precio.text.trim()),
                'duracion_dias': int.parse(_duracion.text.trim()),
                'activa': _activa,
              });
            }
          },
          child: const Text('GUARDAR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      );
}

class _ZonaForm extends StatefulWidget {
  final Zona? item;
  final Function(Map<String, dynamic>) onSave;

  const _ZonaForm({this.item, required this.onSave});

  @override
  State<_ZonaForm> createState() => _ZonaFormState();
}

class _ZonaFormState extends State<_ZonaForm> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nombre;
  late TextEditingController _desc;
  late TextEditingController _capacidad;
  bool _disponible = true;

  @override
  void initState() {
    super.initState();
    _nombre = TextEditingController(text: widget.item?.nombre ?? '');
    _desc = TextEditingController(text: widget.item?.descripcion ?? '');
    _capacidad = TextEditingController(text: widget.item?.capacidadMaxima.toString() ?? '');
    _disponible = widget.item?.disponible ?? true;
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          _input('Nombre de la Zona *', _nombre, isRequired: true),
          _input('Descripción', _desc),
          _input('Capacidad Máxima *', _capacidad, isNumber: true, isRequired: true),
          SwitchListTile(
            title: const Text('Disponible para reservas', style: TextStyle(color: Colors.white, fontSize: 14)),
            value: _disponible,
            activeThumbColor: const Color(0xFFf36100),
            onChanged: (val) => setState(() => _disponible = val),
          ),
          const SizedBox(height: 20),
          _submitBtn(),
        ],
      ),
    );
  }

  Widget _submitBtn() => SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFf36100), padding: const EdgeInsets.symmetric(vertical: 14)),
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              widget.onSave({
                'nombre': _nombre.text.trim(),
                'descripcion': _desc.text.trim(),
                'capacidad_maxima': int.parse(_capacidad.text.trim()),
                'disponible': _disponible,
              });
            }
          },
          child: const Text('GUARDAR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      );
}

class _EntrenadorForm extends StatefulWidget {
  final Entrenador? item;
  final Function(Map<String, dynamic>) onSave;

  const _EntrenadorForm({this.item, required this.onSave});

  @override
  State<_EntrenadorForm> createState() => _EntrenadorFormState();
}

class _EntrenadorFormState extends State<_EntrenadorForm> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nombre;
  late TextEditingController _apellido;
  late TextEditingController _especialidad;
  late TextEditingController _telefono;
  late TextEditingController _email;
  late TextEditingController _capacidad;

  @override
  void initState() {
    super.initState();
    _nombre = TextEditingController(text: widget.item?.nombre ?? '');
    _apellido = TextEditingController(text: widget.item?.apellido ?? '');
    _especialidad = TextEditingController(text: widget.item?.especialidad ?? '');
    _telefono = TextEditingController(text: widget.item?.telefono ?? '');
    _email = TextEditingController(text: widget.item?.email ?? '');
    _capacidad = TextEditingController(text: widget.item?.capacidadPorHora.toString() ?? '1');
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          _input('Nombre *', _nombre, isRequired: true),
          _input('Apellido *', _apellido, isRequired: true),
          _input('Especialidad *', _especialidad, isRequired: true),
          _input('Email *', _email, isEmail: true, isRequired: true),
          _input('Teléfono', _telefono, isNumber: true),
          _input('Capacidad por Hora *', _capacidad, isNumber: true, isRequired: true),
          const SizedBox(height: 20),
          _submitBtn(),
        ],
      ),
    );
  }

  Widget _submitBtn() => SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFf36100), padding: const EdgeInsets.symmetric(vertical: 14)),
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              widget.onSave({
                'nombre': _nombre.text.trim(),
                'apellido': _apellido.text.trim(),
                'especialidad': _especialidad.text.trim(),
                'email': _email.text.trim(),
                'telefono': _telefono.text.trim(),
                'capacidad_por_hora': int.parse(_capacidad.text.trim()),
              });
            }
          },
          child: const Text('GUARDAR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      );
}

class _ReservaForm extends StatefulWidget {
  final Reserva? item;
  final UserSession session;
  final List<Socio> socios;
  final List<Zona> zonas;
  final List<Entrenador> entrenadores;
  final Function(Map<String, dynamic>) onSave;

  const _ReservaForm({
    this.item,
    required this.session,
    required this.socios,
    required this.zonas,
    required this.entrenadores,
    required this.onSave,
  });

  @override
  State<_ReservaForm> createState() => _ReservaFormState();
}

class _ReservaFormState extends State<_ReservaForm> {
  final _formKey = GlobalKey<FormState>();
  int? _socioId;
  int? _zonaId;
  int? _entrenadorId;
  late TextEditingController _fechaHoraController;
  String _estado = 'CONFIRMADA';

  @override
  void initState() {
    super.initState();
    _socioId = widget.item?.socio ?? (widget.session.isSocio ? widget.session.socioId : null);
    _zonaId = widget.item?.zona;
    _entrenadorId = widget.item?.entrenador ?? (widget.session.isEntrenador ? widget.session.entrenadorId : null);
    _estado = widget.item?.estado ?? 'CONFIRMADA';

    String initDate = '';
    if (widget.item != null) {
      final date = widget.item!.fechaReserva;
      initDate = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')} '
          '${date.hour.toString().padLeft(2, '0')}:00';
    }
    _fechaHoraController = TextEditingController(text: initDate);
  }

  @override
  Widget build(BuildContext context) {
    final isSocio = widget.session.isSocio;
    final isEntrenador = widget.session.isEntrenador;

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isSocio)
            Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: Text(
                'Socio: ${widget.session.username}',
                style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            )
          else
            _dropdown<int>('Seleccionar Socio *', _socioId, widget.socios.map((s) {
              return DropdownMenuItem<int>(
                value: s.id,
                child: Text('${s.nombre} ${s.apellido} (${s.cedula})'),
              );
            }).toList(), (val) => setState(() => _socioId = val), isRequired: true),

          _dropdown<int>('Seleccionar Zona *', _zonaId, widget.zonas.map((z) {
            return DropdownMenuItem<int>(
              value: z.id,
              child: Text(z.nombre),
            );
          }).toList(), (val) => setState(() => _zonaId = val), isRequired: true),

          if (isEntrenador)
            Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: Text(
                'Entrenador asignado: ${widget.session.username}',
                style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            )
          else
            _dropdown<int>('Seleccionar Entrenador (Opcional)', _entrenadorId, widget.entrenadores.map((e) {
              return DropdownMenuItem<int>(
                value: e.id,
                child: Text('${e.nombre} ${e.apellido} · ${e.especialidad}'),
              );
            }).toList(), (val) => setState(() => _entrenadorId = val)),

          _dateTimeInput('Fecha y Hora del Turno *', _fechaHoraController, isRequired: true),

          if (!isSocio)
            _dropdown<String>('Estado del Turno *', _estado, const [
              DropdownMenuItem<String>(value: 'CONFIRMADA', child: Text('Confirmada')),
              DropdownMenuItem<String>(value: 'CANCELADA', child: Text('Cancelada')),
              DropdownMenuItem<String>(value: 'ASISTIO', child: Text('Asistió')),
            ], (val) => setState(() => _estado = val ?? 'CONFIRMADA'), isRequired: true),

          const SizedBox(height: 20),
          _submitBtn(),
        ],
      ),
    );
  }

  Widget _submitBtn() => SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFf36100), padding: const EdgeInsets.symmetric(vertical: 14)),
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              if (_zonaId == null) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Por favor selecciona una Zona')));
                return;
              }
              final dateStr = _fechaHoraController.text.trim();
              DateTime dt = DateTime.parse(dateStr.replaceFirst(' ', 'T'));

              widget.onSave({
                'socio': _socioId,
                'zona': _zonaId,
                'entrenador': _entrenadorId,
                'fecha_reserva': dt.toIso8601String(),
                'estado': _estado,
              });
            }
          },
          child: const Text('GUARDAR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      );
}

// ─── COMPONENTES AUXILIARES DE INPUTS CON ESTILO OSCURO ───────────────────────

Widget _input(String label, TextEditingController controller,
    {bool isNumber = false, bool isDecimal = false, bool isEmail = false, bool isEnabled = true, bool isRequired = false, int? maxLen}) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 12.0),
    child: TextFormField(
      controller: controller,
      enabled: isEnabled,
      keyboardType: isNumber
          ? TextInputType.number
          : isDecimal
              ? const TextInputType.numberWithOptions(decimal: true)
              : isEmail
                  ? TextInputType.emailAddress
                  : TextInputType.text,
      maxLength: maxLen,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white54, fontSize: 13),
        filled: true,
        fillColor: const Color(0xFF222222),
        enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF333333))),
        focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFf36100))),
        disabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF2a2a2a))),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        counterText: '',
      ),
      validator: (val) {
        if (isRequired && (val == null || val.trim().isEmpty)) {
          return 'Este campo es obligatorio';
        }
        if (isEmail && val != null && val.isNotEmpty && !val.contains('@')) {
          return 'Formato de correo inválido';
        }
        return null;
      },
    ),
  );
}

Widget _dateInput(String label, TextEditingController controller, {bool isRequired = false}) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 12.0),
    child: Builder(builder: (context) {
      return TextFormField(
        controller: controller,
        readOnly: true,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white54, fontSize: 13),
          filled: true,
          fillColor: const Color(0xFF222222),
          enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF333333))),
          focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFf36100))),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          suffixIcon: const Icon(Icons.calendar_today, color: Color(0xFFf36100), size: 18),
        ),
        validator: (val) => isRequired && (val == null || val.isEmpty) ? 'Este campo es obligatorio' : null,
        onTap: () async {
          final now = DateTime.now();
          final picked = await showDatePicker(
            context: context,
            initialDate: now.subtract(const Duration(days: 365 * 18)),
            firstDate: DateTime(1920),
            lastDate: now,
            builder: (ctx, child) {
              return Theme(
                data: ThemeData.dark().copyWith(
                  colorScheme: const ColorScheme.dark(
                    primary: Color(0xFFf36100),
                    surface: Color(0xFF1a1a1a),
                  ),
                ),
                child: child!,
              );
            },
          );
          if (picked != null) {
            final monthStr = picked.month.toString().padLeft(2, '0');
            final dayStr = picked.day.toString().padLeft(2, '0');
            controller.text = '${picked.year}-$monthStr-$dayStr';
          }
        },
      );
    }),
  );
}

Widget _dateTimeInput(String label, TextEditingController controller, {bool isRequired = false}) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 12.0),
    child: Builder(builder: (context) {
      return TextFormField(
        controller: controller,
        readOnly: true,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white54, fontSize: 13),
          filled: true,
          fillColor: const Color(0xFF222222),
          enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF333333))),
          focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFf36100))),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          suffixIcon: const Icon(Icons.access_time, color: Color(0xFFf36100), size: 18),
        ),
        validator: (val) => isRequired && (val == null || val.isEmpty) ? 'Este campo es obligatorio' : null,
        onTap: () async {
          final now = DateTime.now();
          final date = await showDatePicker(
            context: context,
            initialDate: now.add(const Duration(days: 1)),
            firstDate: now,
            lastDate: now.add(const Duration(days: 60)),
            builder: (ctx, child) {
              return Theme(
                data: ThemeData.dark().copyWith(
                  colorScheme: const ColorScheme.dark(
                    primary: Color(0xFFf36100),
                    surface: Color(0xFF1a1a1a),
                  ),
                ),
                child: child!,
              );
            },
          );
          if (date == null) return;

          if (!context.mounted) return;
          final time = await showTimePicker(
            context: context,
            initialTime: const TimeOfDay(hour: 8, minute: 0),
            builder: (ctx, child) {
              return Theme(
                data: ThemeData.dark().copyWith(
                  colorScheme: const ColorScheme.dark(
                    primary: Color(0xFFf36100),
                    surface: Color(0xFF1a1a1a),
                  ),
                ),
                child: child!,
              );
            },
          );
          if (time == null) return;

          final formattedMonth = date.month.toString().padLeft(2, '0');
          final formattedDay = date.day.toString().padLeft(2, '0');
          final formattedHour = time.hour.toString().padLeft(2, '0');

          controller.text = '${date.year}-$formattedMonth-$formattedDay $formattedHour:00';
        },
      );
    }),
  );
}

Widget _dropdown<K>(String label, K? initialValue, List<DropdownMenuItem<K>> items, Function(K?) onChanged, {bool isRequired = false}) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 12.0),
    child: DropdownButtonFormField<K>(
      initialValue: initialValue,
      items: items,
      onChanged: onChanged,
      dropdownColor: const Color(0xFF1a1a1a),
      style: const TextStyle(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white54, fontSize: 13),
        filled: true,
        fillColor: const Color(0xFF222222),
        enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF333333))),
        focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFf36100))),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      ),
      validator: (val) => isRequired && val == null ? 'Este campo es obligatorio' : null,
    ),
  );
}
