import 'package:drinkonme/core/auth/app_role.dart';
import 'package:drinkonme/features/auth/domain/app_area.dart';

class UserProfile {
  const UserProfile({
    required this.id,
    this.fullName,
    this.phone,
    this.avatarUrl,
  });

  final String id;
  final String? fullName;
  final String? phone;
  final String? avatarUrl;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      fullName: json['full_name'] as String?,
      phone: json['phone'] as String?,
      avatarUrl: json['avatar_url'] as String?,
    );
  }
}

class UserRole {
  const UserRole({required this.code, required this.name});

  final AppRole code;
  final String name;

  factory UserRole.fromCode(String code, String name) {
    return UserRole(code: appRoleFromCode(code), name: name);
  }
}

class BarMembership {
  const BarMembership({
    required this.id,
    required this.barId,
    required this.userId,
    required this.role,
    required this.isActive,
  });

  final String id;
  final String barId;
  final String userId;
  final AppRole role;
  final bool isActive;

  factory BarMembership.fromJson(Map<String, dynamic> json) {
    return BarMembership(
      id: json['id'] as String,
      barId: json['bar_id'] as String,
      userId: json['user_id'] as String,
      role: appRoleFromCode(json['role'] as String),
      isActive: json['is_active'] as bool? ?? false,
    );
  }
}

class AppSession {
  const AppSession({
    required this.userId,
    required this.email,
    required this.profile,
    required this.roles,
    required this.barMemberships,
  });

  const AppSession.unauthenticated()
    : userId = null,
      email = null,
      profile = null,
      roles = const [],
      barMemberships = const [];

  final String? userId;
  final String? email;
  final UserProfile? profile;
  final List<UserRole> roles;
  final List<BarMembership> barMemberships;

  bool get isAuthenticated => userId != null;
  bool get hasMultipleAreas => availableAreas.length > 1;

  List<AppArea> get availableAreas {
    final areas = <AppArea>[];
    final roleCodes = roles.map((role) => role.code).toSet();

    if (roleCodes.contains(AppRole.subscriber)) {
      areas.add(
        const AppArea(
          role: AppRole.subscriber,
          label: '?rea do assinante',
          route: '/home',
        ),
      );
    }
    if (roleCodes.contains(AppRole.barManager)) {
      areas.add(
        const AppArea(
          role: AppRole.barManager,
          label: '?rea do gerente',
          route: '/bar-admin/dashboard',
        ),
      );
    }
    if (roleCodes.contains(AppRole.barOperator)) {
      areas.add(
        const AppArea(
          role: AppRole.barOperator,
          label: '?rea do operador',
          route: '/bar-operator/scan',
        ),
      );
    }
    if (roleCodes.contains(AppRole.platformAdmin)) {
      areas.add(
        const AppArea(
          role: AppRole.platformAdmin,
          label: 'Administra??o da plataforma',
          route: '/home',
        ),
      );
    }

    return areas;
  }

  String get defaultRoute {
    final areas = availableAreas;
    if (areas.isEmpty) return '/home';
    return areas.first.route;
  }
}

AppRole appRoleFromCode(String code) {
  return switch (code) {
    'subscriber' => AppRole.subscriber,
    'bar_manager' => AppRole.barManager,
    'bar_operator' => AppRole.barOperator,
    'platform_admin' => AppRole.platformAdmin,
    _ => AppRole.subscriber,
  };
}
