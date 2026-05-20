import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class RedemptionHistoryScreen extends StatelessWidget {
  const RedemptionHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Hist?rico de resgates',
      description:
          'Hist?rico do assinante com resgates aprovados, pendentes ou expirados.',
      actions: [PlaceholderAction('Home', '/home')],
    );
  }
}
