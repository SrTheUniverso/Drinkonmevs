import 'package:drinkonme/core/widgets/placeholder_page.dart';
import 'package:flutter/material.dart';

class SubscriptionsScreen extends StatelessWidget {
  const SubscriptionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Planos e assinatura',
      description:
          'Tela preparada para assinatura recorrente via Mercado Pago. Sem integra??o de pagamento nesta etapa.',
      actions: [PlaceholderAction('Perfil', '/profile')],
    );
  }
}
