import 'package:drinkonme/core/auth/auth_providers.dart';
import 'package:drinkonme/features/auth/data/auth_repository.dart';
import 'package:drinkonme/features/auth/domain/app_area.dart';
import 'package:drinkonme/features/auth/domain/auth_models.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(supabaseClientProvider));
});

final selectedAreaProvider = NotifierProvider<SelectedAreaController, AppArea?>(
  SelectedAreaController.new,
);

class SelectedAreaController extends Notifier<AppArea?> {
  @override
  AppArea? build() => null;

  void select(AppArea area) => state = area;
  void clear() => state = null;
}

final authControllerProvider =
    AsyncNotifierProvider<AuthController, AppSession>(AuthController.new);

class AuthController extends AsyncNotifier<AppSession> {
  @override
  Future<AppSession> build() {
    return ref.watch(authRepositoryProvider).currentSession();
  }

  Future<void> signIn({required String email, required String password}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      ref.read(selectedAreaProvider.notifier).clear();
      return ref
          .read(authRepositoryProvider)
          .signIn(email: email, password: password);
    });
  }

  Future<void> signUp({
    required String fullName,
    required String email,
    required String password,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      ref.read(selectedAreaProvider.notifier).clear();
      return ref
          .read(authRepositoryProvider)
          .signUp(fullName: fullName, email: email, password: password);
    });
  }

  Future<void> signOut() async {
    state = const AsyncLoading();
    await ref.read(authRepositoryProvider).signOut();
    ref.read(selectedAreaProvider.notifier).clear();
    state = const AsyncData(AppSession.unauthenticated());
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      ref.read(authRepositoryProvider).currentSession,
    );
  }
}
