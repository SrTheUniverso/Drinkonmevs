import { StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Image } from "expo-image";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useFavorites } from "@/hooks/use-favorites";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favorites, loading, refresh } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);
  const textColor = useThemeColor({}, "text");
  const secondaryColor = useThemeColor({}, "secondary");
  const surfaceColor = useThemeColor({}, "surface");

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  }, [refresh]);

  const handleBarPress = (barId: string) => {
    router.push({
      pathname: "/bar/[id]",
      params: { id: barId },
    } as any);
  };

  const renderFavoriteCard = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => handleBarPress(item.id)}
      style={({ pressed }) => [
        styles.favoriteCard,
        {
          backgroundColor: surfaceColor,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.barImage}
          contentFit="cover"
        />
      )}
      <ThemedView style={styles.barContent}>
        <ThemedView style={styles.headerRow}>
          <ThemedText type="defaultSemiBold" style={styles.barName}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.favoriteIcon}>❤️</ThemedText>
        </ThemedView>
        <ThemedView style={styles.addressContainer}>
          <ThemedText style={styles.addressIcon}>📍</ThemedText>
          <ThemedText style={styles.address} numberOfLines={2}>
            {item.address}
          </ThemedText>
        </ThemedView>
        {item.distance && (
          <ThemedText style={styles.distance}>
            {item.distance.toFixed(1)} km de distância
          </ThemedText>
        )}
        {item.rating && (
          <ThemedText style={styles.rating}>
            ⭐ {item.rating.toFixed(1)} avaliação
          </ThemedText>
        )}
        {item.addedAt && (
          <ThemedText style={styles.addedAt}>
            Adicionado em {new Date(item.addedAt).toLocaleDateString("pt-BR")}
          </ThemedText>
        )}
      </ThemedView>
    </Pressable>
  );

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyIcon}>💔</ThemedText>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        Nenhum favorito ainda
      </ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Adicione bares aos seus favoritos para acessá-los rapidamente
      </ThemedText>
      <Pressable
        onPress={() => router.push("/")}
        style={({ pressed }) => [
          styles.exploreButton,
          pressed && styles.exploreButtonPressed,
        ]}
      >
        <ThemedText style={styles.exploreButtonText}>Explorar Bares</ThemedText>
      </Pressable>
    </ThemedView>
  );

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={secondaryColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        },
      ]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Meus Favoritos</ThemedText>
        {favorites.length > 0 && (
          <ThemedText style={styles.count}>
            {favorites.length} bar{favorites.length !== 1 ? "es" : ""}
          </ThemedText>
        )}
      </ThemedView>

      {/* Favorites List */}
      <FlatList
        data={favorites}
        renderItem={renderFavoriteCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={secondaryColor}
          />
        }
        scrollEnabled={true}
        nestedScrollEnabled={true}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  count: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
    marginTop: 4,
  },
  listContent: {
    gap: 12,
    paddingBottom: 20,
  },
  favoriteCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  barImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#E0E0E0",
  },
  barContent: {
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  favoriteIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  addressIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  distance: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "600",
    marginTop: 4,
  },
  addedAt: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  exploreButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  exploreButtonPressed: {
    opacity: 0.8,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
