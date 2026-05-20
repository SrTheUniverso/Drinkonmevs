import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class DrinksScreen extends StatelessWidget {
  const DrinksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Drinks dispon?veis',
      description:
          'Lista de drinks/ofertas do bar. O resgate por QR com reserva de 5 minutos ser? implementado depois.',
      actions: [PlaceholderAction('Voltar para home', '/home')],
    );
  }
}
