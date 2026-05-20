class Bar {
  const Bar({
    required this.id,
    required this.name,
    this.description,
    this.address,
    this.latitude,
    this.longitude,
    this.phone,
    this.instagram,
    required this.isActive,
  });

  final String id;
  final String name;
  final String? description;
  final String? address;
  final double? latitude;
  final double? longitude;
  final String? phone;
  final String? instagram;
  final bool isActive;

  factory Bar.fromJson(Map<String, dynamic> json) {
    return Bar(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      address: json['address'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      phone: json['phone'] as String?,
      instagram: json['instagram'] as String?,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  bool get hasCoordinates => latitude != null && longitude != null;
}

class BarWithDistance {
  const BarWithDistance({required this.bar, this.distanceKm});

  final Bar bar;
  final double? distanceKm;
}
