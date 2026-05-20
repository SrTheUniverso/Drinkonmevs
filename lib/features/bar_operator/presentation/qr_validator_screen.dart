import 'package:drinkonme/features/redemptions/domain/redemption_validation_result.dart';
import 'package:drinkonme/features/redemptions/presentation/redemption_providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class QrValidatorScreen extends ConsumerStatefulWidget {
  const QrValidatorScreen({super.key});

  @override
  ConsumerState<QrValidatorScreen> createState() => _QrValidatorScreenState();
}

class _QrValidatorScreenState extends ConsumerState<QrValidatorScreen> {
  final _formKey = GlobalKey<FormState>();
  final _tokenController = TextEditingController();

  @override
  void dispose() {
    _tokenController.dispose();
    super.dispose();
  }

  Future<void> _validate() async {
    if (!_formKey.currentState!.validate()) return;
    await ref
        .read(validateRedemptionControllerProvider.notifier)
        .validate(_tokenController.text);
  }

  @override
  Widget build(BuildContext context) {
    final validationState = ref.watch(validateRedemptionControllerProvider);
    final isLoading = validationState.isLoading;
    final result = validationState.value;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Validar resgate'),
        actions: [
          IconButton(
            tooltip: 'Histórico operacional',
            onPressed: () => context.go('/bar-operator/history'),
            icon: const Icon(Icons.history),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              'Validação manual do token',
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            const Text(
              'Cole o token apresentado pelo cliente. O scanner por câmera será implementado depois.',
            ),
            const SizedBox(height: 24),
            Form(
              key: _formKey,
              child: TextFormField(
                controller: _tokenController,
                minLines: 2,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Token do cliente',
                  hintText: 'Cole o token aqui',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Informe o token';
                  }
                  return null;
                },
              ),
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: isLoading ? null : _validate,
              icon: isLoading
                  ? const SizedBox.square(
                      dimension: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.verified_outlined),
              label: const Text('Validar resgate'),
            ),
            const SizedBox(height: 20),
            if (validationState.hasError)
              _ValidationError(message: validationState.error.toString()),
            if (result != null) _ValidationSuccess(result: result),
          ],
        ),
      ),
    );
  }
}

class _ValidationSuccess extends StatelessWidget {
  const _ValidationSuccess({required this.result});

  final RedemptionValidationResult result;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.check_circle,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Resgate validado',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text('Drink: ${result.drinkName}'),
            const SizedBox(height: 6),
            Text('Horário: ${result.validatedAt}'),
            const SizedBox(height: 6),
            Text(result.message),
          ],
        ),
      ),
    );
  }
}

class _ValidationError extends StatelessWidget {
  const _ValidationError({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Theme.of(context).colorScheme.errorContainer,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(
          message,
          style: TextStyle(
            color: Theme.of(context).colorScheme.onErrorContainer,
          ),
        ),
      ),
    );
  }
}
