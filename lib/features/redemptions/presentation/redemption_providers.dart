import 'package:drinkonme/core/auth/auth_providers.dart';
import 'package:drinkonme/features/redemptions/data/redemptions_repository.dart';
import 'package:drinkonme/features/redemptions/domain/redemption_token.dart';
import 'package:drinkonme/features/redemptions/domain/redemption_validation_result.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final redemptionsRepositoryProvider = Provider<RedemptionsRepository>((ref) {
  return RedemptionsRepository(ref.watch(supabaseClientProvider));
});

final redemptionTokenProvider = FutureProvider.family<RedemptionToken, String>((
  ref,
  tokenId,
) {
  return ref.watch(redemptionsRepositoryProvider).fetchTokenById(tokenId);
});

final prepareRedemptionControllerProvider =
    AsyncNotifierProvider.autoDispose<
      PrepareRedemptionController,
      RedemptionToken?
    >(PrepareRedemptionController.new);

class PrepareRedemptionController extends AsyncNotifier<RedemptionToken?> {
  @override
  Future<RedemptionToken?> build() async => null;

  Future<RedemptionToken?> prepare(String drinkOfferId) async {
    state = const AsyncLoading();
    final result = await AsyncValue.guard(
      () => ref
          .read(redemptionsRepositoryProvider)
          .prepareRedemptionToken(drinkOfferId),
    );
    state = result;
    return result.value;
  }
}

final validateRedemptionControllerProvider =
    AsyncNotifierProvider.autoDispose<
      ValidateRedemptionController,
      RedemptionValidationResult?
    >(ValidateRedemptionController.new);

class ValidateRedemptionController
    extends AsyncNotifier<RedemptionValidationResult?> {
  @override
  Future<RedemptionValidationResult?> build() async => null;

  Future<RedemptionValidationResult?> validate(String token) async {
    state = const AsyncLoading();
    final result = await AsyncValue.guard(
      () => ref
          .read(redemptionsRepositoryProvider)
          .validateRedemptionToken(token),
    );
    state = result;
    return result.value;
  }
}
