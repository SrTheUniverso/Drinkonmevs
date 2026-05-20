import 'package:drinkonme/features/auth/presentation/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class PlaceholderPage extends ConsumerWidget {
  const PlaceholderPage({
    required this.title,
    required this.description,
    this.actions = const [],
    this.leading,
    super.key,
  });

  final String title;
  final String description;
  final List<PlaceholderAction> actions;
  final Widget? leading;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authControllerProvider).value;

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: [
          if (session?.isAuthenticated ?? false)
            IconButton(
              tooltip: 'Sair',
              onPressed: () =>
                  ref.read(authControllerProvider.notifier).signOut(),
              icon: const Icon(Icons.logout),
            ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            if (leading != null) ...[
              Center(child: leading!),
              const SizedBox(height: 24),
            ],
            Text(
              title,
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            Text(description, style: Theme.of(context).textTheme.bodyLarge),
            if (session?.profile?.fullName != null) ...[
              const SizedBox(height: 12),
              Text('Logado como: ${session!.profile!.fullName}'),
            ],
            if (actions.isNotEmpty) ...[
              const SizedBox(height: 28),
              for (final action in actions) ...[
                FilledButton(
                  onPressed: () => context.go(action.route),
                  child: Text(action.label),
                ),
                const SizedBox(height: 12),
              ],
            ],
          ],
        ),
      ),
    );
  }
}

class PlaceholderAction {
  const PlaceholderAction(this.label, this.route);

  final String label;
  final String route;
}
