import 'dart:async';

import 'package:drinkonme/features/redemptions/presentation/redemption_providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class RedemptionTokenScreen extends ConsumerStatefulWidget {
  const RedemptionTokenScreen({required this.tokenId, super.key});

  final String tokenId;

  @override
  ConsumerState<RedemptionTokenScreen> createState() =>
      _RedemptionTokenScreenState();
}

class _RedemptionTokenScreenState extends ConsumerState<RedemptionTokenScreen> {
  late final Timer _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tokenAsync = ref.watch(redemptionTokenProvider(widget.tokenId));

    return Scaffold(
      appBar: AppBar(title: const Text('Token de resgate')),
      body: SafeArea(
        child: tokenAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text('Erro ao carregar token: $error'),
            ),
          ),
          data: (token) {
            final remaining = token.expiresAt.difference(DateTime.now());
            final isExpired = remaining.isNegative;
            final minutes = remaining.inMinutes
                .clamp(0, 999)
                .toString()
                .padLeft(2, '0');
            final seconds = (remaining.inSeconds % 60)
                .clamp(0, 59)
                .toString()
                .padLeft(2, '0');

            return ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text(
                  isExpired ? 'Token expirado' : 'Apresente este token no bar',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Este é um placeholder do QR Code. O scanner e a validação final pelo operador entram em uma próxima etapa.',
                ),
                const SizedBox(height: 28),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    color: Theme.of(
                      context,
                    ).colorScheme.surfaceContainerHighest,
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.qr_code_2, size: 96),
                      const SizedBox(height: 16),
                      SelectableText(
                        token.token,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.2,
                            ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  isExpired
                      ? 'Tempo restante: 00:00'
                      : 'Tempo restante: $minutes:$seconds',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: isExpired
                        ? Theme.of(context).colorScheme.error
                        : Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Expira em: ${token.expiresAt}',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
