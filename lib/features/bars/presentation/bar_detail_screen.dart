import 'package:drinkonme/core/utils/external_maps.dart';
import 'package:drinkonme/features/bars/domain/bar.dart';
import 'package:drinkonme/features/bars/presentation/providers/bars_providers.dart';
import 'package:drinkonme/features/drink_offers/presentation/widgets/today_drink_offers_section.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class BarDetailScreen extends ConsumerWidget {
  const BarDetailScreen({required this.barId, super.key});

  final String barId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final barAsync = ref.watch(barDetailsProvider(barId));
    final favoritesAsync = ref.watch(favoriteBarIdsProvider);
    final favoriteIds = favoritesAsync.value ?? const <String>{};
    final isFavorite = favoriteIds.contains(barId);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalhe do bar'),
        actions: [
          IconButton(
            tooltip: isFavorite ? 'Remover dos favoritos' : 'Favoritar',
            onPressed: () =>
                setFavoriteBar(ref, barId: barId, shouldFavorite: !isFavorite),
            icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border),
          ),
        ],
      ),
      body: SafeArea(
        child: barAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => _DetailError(message: error.toString()),
          data: (bar) => _BarDetailContent(bar: bar, isFavorite: isFavorite),
        ),
      ),
    );
  }
}

class _BarDetailContent extends StatelessWidget {
  const _BarDetailContent({required this.bar, required this.isFavorite});

  final Bar bar;
  final bool isFavorite;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          height: 180,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: LinearGradient(
              colors: [
                Theme.of(context).colorScheme.primary,
                Theme.of(context).colorScheme.secondary,
              ],
            ),
          ),
          child: const Center(
            child: Icon(Icons.sports_bar, color: Colors.white, size: 72),
          ),
        ),
        const SizedBox(height: 24),
        Text(
          bar.name,
          style: Theme.of(
            context,
          ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900),
        ),
        if (bar.description != null && bar.description!.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text(bar.description!, style: Theme.of(context).textTheme.bodyLarge),
        ],
        const SizedBox(height: 24),
        _InfoTile(
          icon: Icons.location_on_outlined,
          label: 'Endereço',
          value: bar.address ?? 'Não informado',
        ),
        if (bar.phone != null && bar.phone!.isNotEmpty)
          _InfoTile(
            icon: Icons.phone_outlined,
            label: 'Telefone',
            value: bar.phone!,
          ),
        if (bar.instagram != null && bar.instagram!.isNotEmpty)
          _InfoTile(
            icon: Icons.alternate_email,
            label: 'Instagram',
            value: bar.instagram!,
          ),
        const SizedBox(height: 24),
        TodayDrinkOffersSection(barId: bar.id),
        const SizedBox(height: 24),
        FilledButton.icon(
          onPressed: bar.hasCoordinates
              ? () => ExternalMaps.openRoute(
                  latitude: bar.latitude!,
                  longitude: bar.longitude!,
                )
              : null,
          icon: const Icon(Icons.directions_outlined),
          label: const Text('Ver rota'),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () => context.go('/bars/${bar.id}/drinks'),
          icon: const Icon(Icons.local_bar_outlined),
          label: const Text('Ver drinks disponíveis'),
        ),
        const SizedBox(height: 12),
        Text(
          'Favoritos ${isFavorite ? 'ativado' : 'desativado'} para este bar.',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: Theme.of(context).textTheme.labelLarge),
                const SizedBox(height: 4),
                Text(value),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailError extends StatelessWidget {
  const _DetailError({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text('Erro ao carregar bar: $message'),
      ),
    );
  }
}
