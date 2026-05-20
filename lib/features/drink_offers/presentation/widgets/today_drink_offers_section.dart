import 'package:drinkonme/features/drink_offers/domain/drink_offer.dart';
import 'package:drinkonme/features/drink_offers/presentation/providers/drink_offers_providers.dart';
import 'package:drinkonme/features/redemptions/presentation/redemption_providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class TodayDrinkOffersSection extends ConsumerWidget {
  const TodayDrinkOffersSection({required this.barId, super.key});

  final String barId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final offersAsync = ref.watch(todayDrinkOffersProvider(barId));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Drinks disponíveis hoje',
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 12),
        offersAsync.when(
          loading: () => const Center(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: CircularProgressIndicator(),
            ),
          ),
          error: (error, _) => _OffersError(message: error.toString()),
          data: (offers) {
            if (offers.isEmpty) {
              return const _NoOffersToday();
            }

            return Column(
              children: [
                for (final offer in offers) ...[
                  _DrinkOfferCard(offer: offer),
                  const SizedBox(height: 12),
                ],
              ],
            );
          },
        ),
      ],
    );
  }
}

class _DrinkOfferCard extends ConsumerWidget {
  const _DrinkOfferCard({required this.offer});

  final DrinkOffer offer;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final available = offer.availableQuantity;
    final progress = offer.totalQuantity == 0
        ? 0.0
        : (offer.redeemedQuantity / offer.totalQuantity).clamp(0.0, 1.0);
    final prepareState = ref.watch(prepareRedemptionControllerProvider);
    final isPreparing = prepareState.isLoading;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: Theme.of(
                    context,
                  ).colorScheme.primaryContainer,
                  child: Icon(
                    Icons.local_bar,
                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    offer.name,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                _AvailabilityBadge(available: available),
              ],
            ),
            if (offer.description != null && offer.description!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(offer.description!),
            ],
            const SizedBox(height: 14),
            LinearProgressIndicator(value: progress),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _QuantityChip(label: 'Total', value: offer.totalQuantity),
                _QuantityChip(
                  label: 'Resgatados',
                  value: offer.redeemedQuantity,
                ),
                _QuantityChip(label: 'Disponíveis', value: available),
              ],
            ),
            const SizedBox(height: 14),
            if (prepareState.hasError) ...[
              Text(
                prepareState.error.toString(),
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
              const SizedBox(height: 10),
            ],
            FilledButton(
              onPressed: available <= 0 || isPreparing
                  ? null
                  : () async {
                      final token = await ref
                          .read(prepareRedemptionControllerProvider.notifier)
                          .prepare(offer.offerId);

                      if (context.mounted && token != null) {
                        context.go('/redemptions/token/${token.id}');
                      }
                    },
              child: isPreparing
                  ? const SizedBox.square(
                      dimension: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Resgatar drink'),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuantityChip extends StatelessWidget {
  const _QuantityChip({required this.label, required this.value});

  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Chip(label: Text('$label: $value'));
  }
}

class _AvailabilityBadge extends StatelessWidget {
  const _AvailabilityBadge({required this.available});

  final int available;

  @override
  Widget build(BuildContext context) {
    final color = available > 0
        ? Theme.of(context).colorScheme.primary
        : Theme.of(context).colorScheme.error;

    return Text(
      available > 0 ? '$available disp.' : 'esgotado',
      style: Theme.of(context).textTheme.labelMedium?.copyWith(
        color: color,
        fontWeight: FontWeight.w800,
      ),
    );
  }
}

class _NoOffersToday extends StatelessWidget {
  const _NoOffersToday();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(
              Icons.info_outline,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Este bar ainda não possui drinks disponíveis para hoje.',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OffersError extends StatelessWidget {
  const _OffersError({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text('Erro ao carregar ofertas: $message'),
      ),
    );
  }
}
