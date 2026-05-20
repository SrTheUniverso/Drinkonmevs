import 'dart:io' show Platform;

import 'package:url_launcher/url_launcher.dart';

class ExternalMaps {
  const ExternalMaps._();

  static Future<void> openRoute({
    required double latitude,
    required double longitude,
  }) async {
    final uri = Platform.isIOS
        ? Uri.parse('http://maps.apple.com/?daddr=$latitude,$longitude')
        : Uri.parse(
            'https://www.google.com/maps/dir/?api=1&destination=$latitude,$longitude',
          );

    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}
