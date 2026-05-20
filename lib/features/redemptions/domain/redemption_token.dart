class RedemptionToken {
  const RedemptionToken({
    required this.id,
    required this.userId,
    required this.drinkOfferId,
    required this.token,
    required this.expiresAt,
    required this.createdAt,
  });

  final String id;
  final String userId;
  final String drinkOfferId;
  final String token;
  final DateTime expiresAt;
  final DateTime createdAt;

  factory RedemptionToken.fromJson(Map<String, dynamic> json) {
    return RedemptionToken(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      drinkOfferId: json['drink_offer_id'] as String,
      token: json['token'] as String,
      expiresAt: DateTime.parse(json['expires_at'] as String).toLocal(),
      createdAt: DateTime.parse(json['created_at'] as String).toLocal(),
    );
  }

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}

class SubscriptionPlan {
  const SubscriptionPlan({
    required this.id,
    required this.code,
    required this.name,
    required this.maxDailyRedemptions,
    required this.maxWeeklyRedemptions,
  });

  final int id;
  final String code;
  final String name;
  final int maxDailyRedemptions;
  final int maxWeeklyRedemptions;
}
