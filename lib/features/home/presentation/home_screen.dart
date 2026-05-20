import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Home',
      description:
          'Mapa/lista de bares pr?ximos. A consulta real de bares no Supabase entra em etapa pr?pria.',
      actions: [
        PlaceholderAction('Detalhe do bar', '/bars/demo'),
        PlaceholderAction('Favoritos', '/favorites'),
        PlaceholderAction('Planos', '/subscriptions'),
        PlaceholderAction('Perfil', '/profile'),
      ],
    );
  }
}
