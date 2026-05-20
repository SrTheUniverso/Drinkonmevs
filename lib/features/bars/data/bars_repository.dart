import 'package:drinkonme/features/bars/domain/bar.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class BarsRepository {
  const BarsRepository(this._client);

  final SupabaseClient? _client;

  SupabaseClient get _requiredClient {
    final client = _client;
    if (client == null) {
      throw StateError(
        'Supabase não está configurado. Rode o app com SUPABASE_URL e SUPABASE_ANON_KEY.',
      );
    }
    return client;
  }

  String get _currentUserId {
    final id = _requiredClient.auth.currentUser?.id;
    if (id == null) {
      throw StateError('Usuário não autenticado.');
    }
    return id;
  }

  Future<List<Bar>> fetchActiveBars() async {
    final rows = await _requiredClient
        .from('bars')
        .select()
        .eq('is_active', true)
        .order('name');

    return rows.map<Bar>((row) => Bar.fromJson(row)).toList(growable: false);
  }

  Future<Bar> fetchBarById(String barId) async {
    final row = await _requiredClient
        .from('bars')
        .select()
        .eq('id', barId)
        .single();

    return Bar.fromJson(row);
  }

  Future<Set<String>> fetchFavoriteBarIds() async {
    final rows = await _requiredClient
        .from('favorites')
        .select('bar_id')
        .eq('user_id', _currentUserId);

    return rows.map<String>((row) => row['bar_id'] as String).toSet();
  }

  Future<List<Bar>> fetchFavoriteBars() async {
    final rows = await _requiredClient
        .from('favorites')
        .select('created_at, bars(*)')
        .eq('user_id', _currentUserId)
        .order('created_at', ascending: false);

    return rows
        .map<Bar>((row) {
          final bar = row['bars'] as Map<String, dynamic>;
          return Bar.fromJson(bar);
        })
        .toList(growable: false);
  }

  Future<void> addFavorite(String barId) async {
    await _requiredClient.from('favorites').upsert({
      'user_id': _currentUserId,
      'bar_id': barId,
    });
  }

  Future<void> removeFavorite(String barId) async {
    await _requiredClient
        .from('favorites')
        .delete()
        .eq('user_id', _currentUserId)
        .eq('bar_id', barId);
  }

  Future<void> setFavorite({
    required String barId,
    required bool shouldFavorite,
  }) {
    return shouldFavorite ? addFavorite(barId) : removeFavorite(barId);
  }
}
