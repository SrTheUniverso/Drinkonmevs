import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class BarDashboardScreen extends StatelessWidget {
  const BarDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Dashboard do bar',
      description:
          'Resumo operacional do bar: ofertas ativas, cota di?ria e resgates recentes.',
      actions: [
        PlaceholderAction('Dados do bar', '/bar-admin/bar-data'),
        PlaceholderAction('Gerenciar drinks', '/bar-admin/drinks'),
        PlaceholderAction('Ofertas di?rias', '/bar-admin/offers'),
        PlaceholderAction('Hist?rico', '/bar-admin/redemptions'),
      ],
    );
  }
}
