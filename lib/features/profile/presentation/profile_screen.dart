import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Perfil',
      description:
          'Dados do usu?rio, papel ativo, assinatura e configura??es b?sicas.',
      actions: [
        PlaceholderAction('Planos/assinatura', '/subscriptions'),
        PlaceholderAction('Hist?rico de resgates', '/redemptions/history'),
      ],
    );
  }
}
