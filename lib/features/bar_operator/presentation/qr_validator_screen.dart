import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class QrValidatorScreen extends StatelessWidget {
  const QrValidatorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Validador de QR Code',
      description:
          'Placeholder do leitor/validador. A valida??o real ser? feita por Edge Function do Supabase.',
      actions: [
        PlaceholderAction('Hist?rico operacional', '/bar-operator/history'),
      ],
    );
  }
}
