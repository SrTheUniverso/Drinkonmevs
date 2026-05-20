import 'package:drinkonme/features/bars/presentation/providers/bars_providers.dart';
import 'package:drinkonme/features/bars/presentation/widgets/bar_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesAsync = ref.watch(favoriteBarsProvider);
    final positionAsync = ref.watch(currentPositionProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Favoritos')),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(favoriteBarsProvider);
            ref.invalidate(favoriteBarIdsProvider);
            await ref.read(favoriteBarsProvider.future);
          },
          child: favoritesAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => _FavoritesError(message: error.toString()),
            data: (bars) {
              if (bars.isEmpty) {
                return const _EmptyFavorites();
              }

              final position = positionAsync.value;

              return ListView.separated(
                padding: const EdgeInsets.all(16),
                itemBuilder: (context, index) {
                  final bar = bars[index];
                  return BarCard(
                    bar: bar,
                    distanceKm: distanceKmFromPosition(position, bar),
                    isFavorite: true,
                    onTap: () => context.go('/bars/${bar.id}'),
                    onFavoritePressed: () => setFavoriteBar(
                      ref,
                      barId: bar.id,
                      shouldFavorite: false,
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

class _EmptyFavorites extends StatelessWidget {
  const _EmptyFavorites();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const SizedBox(height: 120),
        const Icon(Icons.favorite_border, size: 56),
        const SizedBox(height: 16),
        const Center(child: Text('Nenhum bar favorito ainda.')),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: () => context.go('/home'),
          child: const Text('Explorar bares'),
        ),
      ],
    );
  }
}

class _FavoritesError extends StatelessWidget {
  const _FavoritesError({required this.message});

  final String message;

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
          'Erro ao carregar favoritos.',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Text(message),
      ],
    );
  }
}
