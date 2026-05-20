import 'package:drinkonme/core/auth/app_role.dart';

class AppArea {
  const AppArea({required this.role, required this.label, required this.route});

  final AppRole role;
  final String label;
  final String route;
}
