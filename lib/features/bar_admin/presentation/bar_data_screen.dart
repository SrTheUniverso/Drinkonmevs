import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class BarDataScreen extends StatelessWidget {
  const BarDataScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Gerenciar dados do bar',
      description:
          'Cadastro e edi??o de nome, endere?o, telefone, descri??o, hor?rios e imagens.',
      actions: [PlaceholderAction('Dashboard', '/bar-admin/dashboard')],
    );
  }
}
