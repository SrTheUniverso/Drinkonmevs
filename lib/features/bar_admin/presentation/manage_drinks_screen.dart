import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class ManageDrinksScreen extends StatelessWidget {
  const ManageDrinksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Gerenciar drinks',
      description:
          'CRUD de drinks do bar. Receitas/ingredientes ficam fora do MVP salvo decis?o futura.',
      actions: [PlaceholderAction('Ofertas di?rias', '/bar-admin/offers')],
    );
  }
}
