import 'package:drinkonme/app/drinkonme_app.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('opens login placeholder', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: DrinkonmeApp()));
    await tester.pumpAndSettle();

    expect(find.text('Login'), findsWidgets);
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
