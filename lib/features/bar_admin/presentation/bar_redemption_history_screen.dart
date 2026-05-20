import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class BarRedemptionHistoryScreen extends StatelessWidget {
  const BarRedemptionHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Hist?rico de resgates do bar',
      description: 'Hist?rico operacional visto pelo gerente do bar.',
      actions: [PlaceholderAction('Dashboard', '/bar-admin/dashboard')],
    );
  }
}
