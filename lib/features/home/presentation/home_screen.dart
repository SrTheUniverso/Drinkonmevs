import 'package:drinkonme/features/bars/presentation/providers/bars_providers.dart';
import 'package:drinkonme/features/bars/presentation/widgets/bar_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final barsAsync = ref.watch(barsWithDistanceProvider);
    final favoritesAsync = ref.watch(favoriteBarIdsProvider);
    final favoriteIds = favoritesAsync.value ?? const <String>{};

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bares próximos'),
        actions: [
          IconButton(
            tooltip: 'Favoritos',
            onPressed: () => context.go('/favorites'),
            icon: const Icon(Icons.favorite_border),
          ),
          IconButton(
            tooltip: 'Perfil',
            onPressed: () => context.go('/profile'),
            icon: const Icon(Icons.person_outline),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(currentPositionProvider);
            ref.invalidate(activeBarsProvider);
            ref.invalidate(favoriteBarIdsProvider);
            await ref.read(barsWithDistanceProvider.future);
          },
          child: barsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => _ErrorState(
              message: error.toString(),
              onRetry: () {
                ref.invalidate(activeBarsProvider);
                ref.invalidate(barsWithDistanceProvider);
              },
            ),
            data: (bars) {
              if (bars.isEmpty) {
                return const _EmptyState();
              }

              return ListView.separated(
                padding: const EdgeInsets.all(16),
                itemBuilder: (context, index) {
                  final item = bars[index];
                  final bar = item.bar;
                  final isFavorite = favoriteIds.contains(bar.id);

                  return BarCard(
                    bar: bar,
                    distanceKm: item.distanceKm,
                    isFavorite: isFavorite,
                    onTap: () => context.go('/bars/${bar.id}'),
                    onFavoritePressed: () => setFavoriteBar(
                      ref,
                      barId: bar.id,
                      shouldFavorite: !isFavorite,
                    ),
                  );
                },
                separatorBuilder: (_, _) => const SizedBox(height: 12),
                itemCount: bars.length,
              );
            },
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: const [
        SizedBox(height: 120),
        Icon(Icons.sports_bar_outlined, size: 56),
        SizedBox(height: 16),
        Center(child: Text('Nenhum bar ativo encontrado.')),
      ],
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const SizedBox(height: 80),
        Icon(
          Icons.error_outline,
          color: Theme.of(context).colorScheme.error,
          size: 56,
        ),
        const SizedBox(height: 16),
        Text(
          'Não foi possível carregar os bares.',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Text(message),
        const SizedBox(height: 16),
        FilledButton(onPressed: onRetry, child: const Text('Tentar novamente')),
      ],
    );
  }
}
