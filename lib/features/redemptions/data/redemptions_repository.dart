import 'package:drinkonme/features/redemptions/domain/redemption_token.dart';
import 'package:drinkonme/features/redemptions/domain/redemption_validation_result.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class RedemptionsRepository {
  const RedemptionsRepository(this._client);

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

  Future<RedemptionToken> prepareRedemptionToken(String drinkOfferId) async {
    final response = await _requiredClient.rpc(
      'prepare_redemption_token',
      params: {'p_drink_offer_id': drinkOfferId},
    );

    final row = switch (response) {
      final List<dynamic> list when list.isNotEmpty => list.first,
      final Map<String, dynamic> map => map,
      _ => throw StateError('Resposta inesperada ao preparar resgate.'),
    };

    return RedemptionToken.fromJson(Map<String, dynamic>.from(row as Map));
  }

  Future<RedemptionToken> fetchTokenById(String tokenId) async {
    final row = await _requiredClient
        .from('redemption_tokens')
        .select()
        .eq('id', tokenId)
        .single();

    return RedemptionToken.fromJson(row);
  }

  Future<RedemptionValidationResult> validateRedemptionToken(
    String token,
  ) async {
    final response = await _requiredClient.rpc(
      'validate_redemption_token',
      params: {'p_token': token.trim()},
    );

    final row = switch (response) {
      final List<dynamic> list when list.isNotEmpty => list.first,
      final Map<String, dynamic> map => map,
      _ => throw StateError('Resposta inesperada ao validar token.'),
    };

    return RedemptionValidationResult.fromJson(
      Map<String, dynamic>.from(row as Map),
    );
  }
}
