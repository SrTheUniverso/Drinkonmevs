import 'package:drinkonme/features/drink_offers/domain/drink_offer.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DrinkOffersRepository {
  const DrinkOffersRepository(this._client);

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

  Future<List<DrinkOffer>> fetchTodayOffersByBar(String barId) async {
    final today = _todaySaoPauloDateString();

    final rows = await _requiredClient
        .from('drink_offers')
        .select(
          'id, drink_id, offer_date, total_quantity, redeemed_quantity, is_active, drinks!inner(id, bar_id, name, description, image_url, is_active)',
        )
        .eq('offer_date', today)
        .eq('is_active', true)
        .eq('drinks.bar_id', barId)
        .eq('drinks.is_active', true)
        .order('total_quantity', ascending: false);

    return rows
        .map<DrinkOffer>((row) => DrinkOffer.fromJson(row))
        .toList(growable: false);
  }

  String _todaySaoPauloDateString() {
    final utcNow = DateTime.now().toUtc();
    final saoPauloNow = utcNow.subtract(const Duration(hours: 3));
    final year = saoPauloNow.year.toString().padLeft(4, '0');
    final month = saoPauloNow.month.toString().padLeft(2, '0');
    final day = saoPauloNow.day.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }
}
