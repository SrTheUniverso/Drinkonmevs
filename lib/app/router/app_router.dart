import 'package:drinkonme/features/auth/domain/auth_models.dart';
import 'package:drinkonme/features/auth/presentation/area_selection_screen.dart';
import 'package:drinkonme/features/auth/presentation/auth_controller.dart';
import 'package:drinkonme/features/auth/presentation/login_screen.dart';
import 'package:drinkonme/features/auth/presentation/signup_screen.dart';
import 'package:drinkonme/features/bar_admin/presentation/bar_dashboard_screen.dart';
import 'package:drinkonme/features/bar_admin/presentation/bar_data_screen.dart';
import 'package:drinkonme/features/bar_admin/presentation/bar_redemption_history_screen.dart';
import 'package:drinkonme/features/bar_admin/presentation/manage_drinks_screen.dart';
import 'package:drinkonme/features/bar_admin/presentation/manage_offers_screen.dart';
import 'package:drinkonme/features/bar_operator/presentation/operator_history_screen.dart';
import 'package:drinkonme/features/bar_operator/presentation/qr_validator_screen.dart';
import 'package:drinkonme/features/bars/presentation/bar_detail_screen.dart';
import 'package:drinkonme/features/bars/presentation/drinks_screen.dart';
import 'package:drinkonme/features/favorites/presentation/favorites_screen.dart';
import 'package:drinkonme/features/home/presentation/home_screen.dart';
import 'package:drinkonme/features/profile/presentation/profile_screen.dart';
import 'package:drinkonme/features/redemptions/presentation/redemption_history_screen.dart';
import 'package:drinkonme/features/subscriptions/presentation/subscriptions_screen.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);
  final selectedArea = ref.watch(selectedAreaProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final path = state.uri.path;
      final isAuthRoute = path == '/login' || path == '/signup';
      final isAreaSelection = path == '/area-selection';

      if (authState.isLoading) return null;

      final session = authState.value ?? const AppSession.unauthenticated();

      if (!session.isAuthenticated) {
        return isAuthRoute ? null : '/login';
      }

      if (session.hasMultipleAreas && selectedArea == null) {
        return isAreaSelection ? null : '/area-selection';
      }

      final targetRoute = selectedArea?.route ?? session.defaultRoute;

      if (isAuthRoute || isAreaSelection) {
        return targetRoute;
      }

      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: '/area-selection',
        builder: (context, state) => const AreaSelectionScreen(),
      ),
      GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
      GoRoute(
        path: '/bars/:barId',
        builder: (context, state) =>
            BarDetailScreen(barId: state.pathParameters['barId']!),
      ),
      GoRoute(
        path: '/bars/:barId/drinks',
        builder: (context, state) => const DrinksScreen(),
      ),
      GoRoute(
        path: '/favorites',
        builder: (context, state) => const FavoritesScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/subscriptions',
        builder: (context, state) => const SubscriptionsScreen(),
      ),
      GoRoute(
        path: '/redemptions/history',
        builder: (context, state) => const RedemptionHistoryScreen(),
      ),
      GoRoute(
        path: '/bar-admin/dashboard',
        builder: (context, state) => const BarDashboardScreen(),
      ),
      GoRoute(
        path: '/bar-admin/bar-data',
        builder: (context, state) => const BarDataScreen(),
      ),
      GoRoute(
        path: '/bar-admin/drinks',
        builder: (context, state) => const ManageDrinksScreen(),
      ),
      GoRoute(
        path: '/bar-admin/offers',
        builder: (context, state) => const ManageOffersScreen(),
      ),
      GoRoute(
        path: '/bar-admin/redemptions',
        builder: (context, state) => const BarRedemptionHistoryScreen(),
      ),
      GoRoute(
        path: '/bar-operator/scan',
        builder: (context, state) => const QrValidatorScreen(),
      ),
      GoRoute(
        path: '/bar-operator/history',
        builder: (context, state) => const OperatorHistoryScreen(),
      ),
    ],
  );
});
