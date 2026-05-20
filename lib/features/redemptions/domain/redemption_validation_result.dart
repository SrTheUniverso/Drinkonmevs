class RedemptionValidationResult {
  const RedemptionValidationResult({
    required this.redemptionId,
    required this.barId,
    required this.drinkName,
    required this.validatedAt,
    required this.status,
    required this.message,
  });

  final String redemptionId;
  final String barId;
  final String drinkName;
  final DateTime validatedAt;
  final String status;
  final String message;

  factory RedemptionValidationResult.fromJson(Map<String, dynamic> json) {
    return RedemptionValidationResult(
      redemptionId: json['redemption_id'] as String,
      barId: json['bar_id'] as String,
      drinkName: json['drink_name'] as String,
      validatedAt: DateTime.parse(json['validated_at'] as String).toLocal(),
      status: json['status'] as String,
      message: json['message'] as String,
    );
  }
}
