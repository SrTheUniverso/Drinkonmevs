import 'package:drinkonme/core/auth/auth_providers.dart';
import 'package:drinkonme/core/location/location_service.dart';
import 'package:drinkonme/features/bars/data/bars_repository.dart';
import 'package:drinkonme/features/bars/domain/bar.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

final barsRepositoryProvider = Provider<BarsRepository>((ref) {
  return BarsRepository(ref.watch(supabaseClientProvider));
});

final currentPositionProvider = FutureProvider<Position?>((ref) async {
  try {
    return const LocationService().getCurrentPositionIfAllowed();
  } catch (_) {
    return null;
  }
});

final activeBarsProvider = FutureProvider<List<Bar>>((ref) {
  return ref.watch(barsRepositoryProvider).fetchActiveBars();
});

final barsWithDistanceProvider = FutureProvider<List<BarWithDistance>>((
  ref,
) async {
  final bars = await ref.watch(activeBarsProvider.future);
  final position = await ref.watch(currentPositionProvider.future);

  final mapped = bars.map((bar) {
    final distanceKm = distanceKmFromPosition(position, bar);
    return BarWithDistance(bar: bar, distanceKm: distanceKm);
  }).toList();

  mapped.sort((a, b) {
    final left = a.distanceKm;
    final right = b.distanceKm;
    if (left == null && right == null) return a.bar.name.compareTo(b.bar.name);
    if (left == null) return 1;
    if (right == null) return -1;
    return left.compareTo(right);
  });

  return mapped;
});

final barDetailsProvider = FutureProvider.family<Bar, String>((ref, barId) {
  return ref.watch(barsRepositoryProvider).fetchBarById(barId);
});

final favoriteBarIdsProvider = FutureProvider<Set<String>>((ref) {
  return ref.watch(barsRepositoryProvider).fetchFavoriteBarIds();
});

final favoriteBarsProvider = FutureProvider<List<Bar>>((ref) {
  return ref.watch(barsRepositoryProvider).fetchFavoriteBars();
});

Future<void> setFavoriteBar(
  WidgetRef ref, {
  required String barId,
  required bool shouldFavorite,
}) async {
  await ref
      .read(barsRepositoryProvider)
      .setFavorite(barId: barId, shouldFavorite: shouldFavorite);
  ref.invalidate(favoriteBarIdsProvider);
  ref.invalidate(favoriteBarsProvider);
}

double? distanceKmFromPosition(Position? position, Bar bar) {
  final latitude = bar.latitude;
  final longitude = bar.longitude;
  if (position == null || latitude == null || longitude == null) return null;

  final meters = Geolocator.distanceBetween(
    position.latitude,
    position.longitude,
    latitude,
    longitude,
  );
  return meters / 1000;
}
