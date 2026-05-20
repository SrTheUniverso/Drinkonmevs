class DrinkOffer {
  const DrinkOffer({
    required this.offerId,
    required this.drinkId,
    required this.barId,
    required this.name,
    this.description,
    this.imageUrl,
    required this.offerDate,
    required this.totalQuantity,
    required this.redeemedQuantity,
    required this.isActive,
  });

  final String offerId;
  final String drinkId;
  final String barId;
  final String name;
  final String? description;
  final String? imageUrl;
  final DateTime offerDate;
  final int totalQuantity;
  final int redeemedQuantity;
  final bool isActive;

  int get availableQuantity => totalQuantity - redeemedQuantity;

  factory DrinkOffer.fromJson(Map<String, dynamic> json) {
    final drink = json['drinks'] as Map<String, dynamic>;

    return DrinkOffer(
      offerId: json['id'] as String,
      drinkId: json['drink_id'] as String,
      barId: drink['bar_id'] as String,
      name: drink['name'] as String,
      description: drink['description'] as String?,
      imageUrl: drink['image_url'] as String?,
      offerDate: DateTime.parse(json['offer_date'] as String),
      totalQuantity: json['total_quantity'] as int,
      redeemedQuantity: json['redeemed_quantity'] as int? ?? 0,
      isActive: json['is_active'] as bool? ?? true,
    );
  }
}
