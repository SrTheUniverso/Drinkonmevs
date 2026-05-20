import 'package:drinkonme/core/auth/auth_providers.dart';
import 'package:drinkonme/features/drink_offers/data/drink_offers_repository.dart';
import 'package:drinkonme/features/drink_offers/domain/drink_offer.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final drinkOffersRepositoryProvider = Provider<DrinkOffersRepository>((ref) {
  return DrinkOffersRepository(ref.watch(supabaseClientProvider));
});

final todayDrinkOffersProvider =
    FutureProvider.family<List<DrinkOffer>, String>((ref, barId) {
      return ref
          .watch(drinkOffersRepositoryProvider)
          .fetchTodayOffersByBar(barId);
    });
