enum AppRole {
  subscriber,
  barManager,
  barOperator,
  platformAdmin;

  String get code => switch (this) {
    AppRole.subscriber => 'subscriber',
    AppRole.barManager => 'bar_manager',
    AppRole.barOperator => 'bar_operator',
    AppRole.platformAdmin => 'platform_admin',
  };

  String get label => switch (this) {
    AppRole.subscriber => 'Assinante',
    AppRole.barManager => 'Gerente do bar',
    AppRole.barOperator => 'Operador do bar',
    AppRole.platformAdmin => 'Administrador',
  };
}
