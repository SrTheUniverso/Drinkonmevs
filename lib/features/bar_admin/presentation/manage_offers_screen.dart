import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class ManageOffersScreen extends StatelessWidget {
  const ManageOffersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Gerenciar ofertas',
      description: 'Controle da cota di?ria promocional por drink/oferta.',
      actions: [
        PlaceholderAction('Hist?rico do bar', '/bar-admin/redemptions'),
      ],
    );
  }
}
