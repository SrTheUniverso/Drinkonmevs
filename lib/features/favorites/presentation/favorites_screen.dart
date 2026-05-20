import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Favoritos',
      description:
          'Favoritos sincronizados no Supabase para funcionar entre dispositivos.',
      actions: [PlaceholderAction('Explorar bares', '/home')],
    );
  }
}
