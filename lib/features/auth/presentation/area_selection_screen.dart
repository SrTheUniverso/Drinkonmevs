import 'package:drinkonme/features/auth/presentation/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class AreaSelectionScreen extends ConsumerWidget {
  const AreaSelectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionAsync = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Escolher ?rea')),
      body: SafeArea(
        child: sessionAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(child: Text(error.toString())),
          data: (session) {
            final areas = session.availableAreas;
            return ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text(
                  'Como voc? quer entrar?',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                const Text('Seu usu?rio possui mais de um papel no Drinkonme.'),
                const SizedBox(height: 24),
                for (final area in areas)
                  Card(
                    child: ListTile(
                      title: Text(area.label),
                      subtitle: Text(area.role.label),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        ref.read(selectedAreaProvider.notifier).select(area);
                        context.go(area.route);
                      },
                    ),
                  ),
                const SizedBox(height: 16),
                OutlinedButton(
                  onPressed: () =>
                      ref.read(authControllerProvider.notifier).signOut(),
                  child: const Text('Sair'),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
