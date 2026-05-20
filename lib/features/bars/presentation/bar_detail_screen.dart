import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class BarDetailScreen extends StatelessWidget {
  const BarDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Detalhe do bar',
      description:
          'Informa??es do bar, endere?o, bot?o de rota externa e acesso aos drinks dispon?veis.',
      actions: [
        PlaceholderAction('Drinks dispon?veis', '/bars/demo/drinks'),
        PlaceholderAction('Hist?rico de resgates', '/redemptions/history'),
      ],
    );
  }
}
