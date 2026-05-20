import { StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Image } from "expo-image";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useFavorites } from "@/hooks/use-favorites";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "@/lib/auth";

interface Bar {
  id: string;
  name: string;
  address: string;
  image?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
  rating?: number;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textColor = useThemeColor({}, "text");
  const secondaryColor = useThemeColor({}, "secondary");
  const surfaceColor = useThemeColor({}, "surface");
  const dividerColor = useThemeColor({}, "divider");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBars();
    }
  }, [isAuthenticated]);

  const loadBars = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await Auth.getSessionToken();
      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/bares`;

      console.log("[HomeScreen] Loading bars from:", url);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        headers,
        credentials: "include",
      });

      console.log("[HomeScreen] Response status:", response.status);

      if (!response.ok) {
        throw new Error("Falha ao carregar bares");
      }

      const data = await response.json();
      console.log("[HomeScreen] Bares loaded:", data);

      // Handle both array and object responses
      const barsList = Array.isArray(data) ? data : data.bares || [];
      setBars(barsList);
    } catch (err) {
      console.error("[HomeScreen] Error loading bars:", err);
      const message = err instanceof Error ? err.message : "Erro ao carregar bares";
      setError(message);
      // Set empty array on error to avoid crashes
      setBars([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBars().finally(() => setRefreshing(false));
  }, []);

  const handleBarPress = (barId: string) => {
    router.push({
      pathname: "/bar/[id]",
      params: { id: barId },
    } as any);
  };

  const renderBarCard = ({ item }: { item: Bar }) => (
    <Pressable
      onPress={() => handleBarPress(item.id)}
      style={({ pressed }) => [
        styles.barCard,
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
          <Pressable
            onPress={() => toggleFavorite({ id: item.id, name: item.name, address: item.address, image: item.image, rating: item.rating, distance: item.distance })}
            style={styles.favoriteButton}
          >
            <ThemedText style={styles.favoriteIcon}>
              {isFavorited(item.id) ? "❤️" : "🤍"}
            </ThemedText>
          </Pressable>
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
      </ThemedView>
    </Pressable>
  );

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        Nenhum bar encontrado
      </ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Tente novamente ou volte mais tarde
      </ThemedText>
    </ThemedView>
  );

  if (authLoading) {
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
        <ThemedView>
          <ThemedText style={styles.greeting}>
            Olá, {user?.name?.split(" ")[0] || "Usuário"}!
          </ThemedText>
          <ThemedText type="subtitle">Bares Participantes</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Error Message */}
      {error && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      )}

      {/* Bars List */}
      {loading && !refreshing ? (
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={secondaryColor} />
        </ThemedView>
      ) : (
        <FlatList
          data={bars}
          renderItem={renderBarCard}
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
      )}
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
  greeting: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  listContent: {
    gap: 12,
    paddingBottom: 20,
  },
  barCard: {
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
    marginBottom: 8,
  },
  barName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
  favoriteIcon: {
    fontSize: 20,
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
  errorContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    marginBottom: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
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
  },
});
