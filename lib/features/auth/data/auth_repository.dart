import 'package:drinkonme/features/auth/domain/auth_models.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthRepository {
  const AuthRepository(this._client);

  final SupabaseClient? _client;

  SupabaseClient get _requiredClient {
    final client = _client;
    if (client == null) {
      throw StateError(
        'Supabase n?o est? configurado. Rode o app com SUPABASE_URL e SUPABASE_ANON_KEY.',
      );
    }
    return client;
  }

  Future<AppSession> currentSession() async {
    final client = _client;
    if (client == null) return const AppSession.unauthenticated();

    final user = client.auth.currentUser;
    if (user == null) return const AppSession.unauthenticated();

    return _loadSessionForUser(user);
  }

  Future<AppSession> signIn({
    required String email,
    required String password,
  }) async {
    final response = await _requiredClient.auth.signInWithPassword(
      email: email.trim(),
      password: password,
    );

    final user = response.user;
    if (user == null) return const AppSession.unauthenticated();

    return _loadSessionForUser(user);
  }

  Future<AppSession> signUp({
    required String fullName,
    required String email,
    required String password,
  }) async {
    final response = await _requiredClient.auth.signUp(
      email: email.trim(),
      password: password,
      data: {'full_name': fullName.trim()},
    );

    final user = response.user;
    if (user == null || response.session == null) {
      return const AppSession.unauthenticated();
    }

    await _requiredClient.from('profiles').upsert({
      'id': user.id,
      'full_name': fullName.trim(),
    });

    return _loadSessionForUser(user);
  }

  Future<void> signOut() async {
    final client = _client;
    if (client == null) return;
    await client.auth.signOut();
  }

  Future<AppSession> _loadSessionForUser(User user) async {
    final profile = await _loadProfile(user.id);
    final roles = await _loadRoles(user.id);
    final memberships = await _loadBarMemberships(user.id);

    return AppSession(
      userId: user.id,
      email: user.email,
      profile: profile,
      roles: roles,
      barMemberships: memberships,
    );
  }

  Future<UserProfile?> _loadProfile(String userId) async {
    final data = await _requiredClient
        .from('profiles')
        .select()
        .eq('id', userId)
        .maybeSingle();

    if (data == null) return null;
    return UserProfile.fromJson(data);
  }

  Future<List<UserRole>> _loadRoles(String userId) async {
    final rows = await _requiredClient
        .from('user_roles')
        .select('roles(code, name)')
        .eq('user_id', userId);

    return rows
        .map<UserRole>((row) {
          final role = row['roles'] as Map<String, dynamic>;
          return UserRole.fromCode(
            role['code'] as String,
            role['name'] as String,
          );
        })
        .toList(growable: false);
  }

  Future<List<BarMembership>> _loadBarMemberships(String userId) async {
    final rows = await _requiredClient
        .from('bar_members')
        .select()
        .eq('user_id', userId)
        .eq('is_active', true);

    return rows
        .map<BarMembership>((row) => BarMembership.fromJson(row))
        .toList(growable: false);
  }
}
