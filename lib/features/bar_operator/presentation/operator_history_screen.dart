import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class OperatorHistoryScreen extends StatelessWidget {
  const OperatorHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Hist?rico operacional',
      description: 'Hist?rico de valida??es realizadas pelo operador/gar?om.',
      actions: [PlaceholderAction('Validador', '/bar-operator/scan')],
    );
  }
}
