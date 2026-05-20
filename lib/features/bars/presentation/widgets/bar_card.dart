import 'package:drinkonme/features/bars/domain/bar.dart';
import 'package:flutter/material.dart';

class BarCard extends StatelessWidget {
  const BarCard({
    required this.bar,
    this.distanceKm,
    this.isFavorite = false,
    this.onTap,
    this.onFavoritePressed,
    super.key,
  });

  final Bar bar;
  final double? distanceKm;
  final bool isFavorite;
  final VoidCallback? onTap;
  final VoidCallback? onFavoritePressed;

  @override
  Widget build(BuildContext context) {
    final description = bar.description;
    final address = bar.address;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      bar.name,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  if (onFavoritePressed != null)
                    IconButton(
                      tooltip: isFavorite
                          ? 'Remover dos favoritos'
                          : 'Favoritar',
                      onPressed: onFavoritePressed,
                      icon: Icon(
                        isFavorite ? Icons.favorite : Icons.favorite_border,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                ],
              ),
              if (description != null && description.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(description, maxLines: 2, overflow: TextOverflow.ellipsis),
              ],
              if (address != null && address.isNotEmpty) ...[
                const SizedBox(height: 12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.location_on_outlined,
                      size: 18,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 6),
                    Expanded(child: Text(address)),
                  ],
                ),
              ],
              if (distanceKm != null) ...[
                const SizedBox(height: 10),
                Text(
                  '${distanceKm!.toStringAsFixed(1)} km de distância',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
