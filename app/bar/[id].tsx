import { StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "@/lib/auth";
import { useLocation, calculateDistance } from "@/hooks/use-location";
import { useFavorites } from "@/hooks/use-favorites";
import { useNotifications } from "@/hooks/use-notifications";

interface Drink {
  id: string;
  name: string;
  description?: string;
}

interface BarDetails {
  id: string;
  name: string;
  address: string;
  image?: string;
  drinks: Drink[];
  location?: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  description?: string;
}

interface ResgateStatus {
  canResgate: boolean;
  nextAvailableDate?: string;
  message: string;
}

export default function BarDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { location: userLocation } = useLocation();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { sendNewDrinkNotification } = useNotifications();
  const [bar, setBar] = useState<BarDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [resgateLoading, setResgateLoading] = useState(false);
  const [resgateStatus, setResgateStatus] = useState<ResgateStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textColor = useThemeColor({}, "text");
  const secondaryColor = useThemeColor({}, "secondary");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const surfaceColor = useThemeColor({}, "surface");

  useEffect(() => {
    if (id) {
      loadBarDetails();
      checkResgateStatus();
    }
  }, [id]);

  const loadBarDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await Auth.getSessionToken();
      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/bares/${id}`;

      console.log("[BarDetails] Loading bar from:", url);

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

      console.log("[BarDetails] Response status:", response.status);

      if (!response.ok) {
        throw new Error("Falha ao carregar detalhes do bar");
      }

      const data = await response.json();
      console.log("[BarDetails] Bar details loaded:", data);

      setBar(data);
    } catch (err) {
      console.error("[BarDetails] Error loading bar:", err);
      const message = err instanceof Error ? err.message : "Erro ao carregar bar";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const checkResgateStatus = async () => {
    try {
      const token = await Auth.getSessionToken();
      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/resgates/status/${id}`;

      console.log("[BarDetails] Checking resgate status from:", url);

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

      if (response.ok) {
        const data = await response.json();
        console.log("[BarDetails] Resgate status:", data);
        setResgateStatus(data);
      }
    } catch (err) {
      console.error("[BarDetails] Error checking resgate status:", err);
      // Don't show error for status check
    }
  };

  const handleResgate = async () => {
    try {
      if (!resgateStatus?.canResgate) {
        Alert.alert(
          "Resgate Indisponível",
          resgateStatus?.message || "Você já resgatou um drink recentemente"
        );
        return;
      }

      setResgateLoading(true);
      const token = await Auth.getSessionToken();
      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/resgatar/${id}`;

      console.log("[BarDetails] Attempting resgate at:", url);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
      });

      console.log("[BarDetails] Resgate response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Falha ao resgatar drink");
      }

      const data = await response.json();
      console.log("[BarDetails] Resgate successful:", data);

      // Haptic feedback for success
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success message
      Alert.alert(
        "Sucesso! 🎉",
        "Drink resgatado com sucesso! Aproveite!",
        [
          {
            text: "OK",
            onPress: () => {
              // Refresh status
              checkResgateStatus();
            },
          },
        ]
      );
    } catch (err) {
      console.error("[BarDetails] Error during resgate:", err);
      const message = err instanceof Error ? err.message : "Erro ao resgatar drink";
      
      // Haptic feedback for error
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      Alert.alert("Erro", message);
    } finally {
      setResgateLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={secondaryColor} />
      </ThemedView>
    );
  }

  if (!bar || error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle" style={styles.errorTitle}>
          Erro ao carregar bar
        </ThemedText>
        <ThemedText style={styles.errorMessage}>{error || "Tente novamente"}</ThemedText>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 20),
      }}
      style={styles.container}
    >
      {/* Back Button */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backButtonHeader,
          pressed && styles.backButtonHeaderPressed,
        ]}
      >
        <ThemedText style={styles.backButtonHeaderText}>← Voltar</ThemedText>
      </Pressable>

      {/* Bar Image */}
      {bar.image && (
        <Image
          source={{ uri: bar.image }}
          style={styles.barImage}
          contentFit="cover"
        />
      )}

      {/* Bar Info */}
      <ThemedView style={styles.content}>
        <ThemedView style={styles.titleRow}>
          <ThemedText type="title" style={styles.barName}>
            {bar.name}
          </ThemedText>
          <Pressable
            onPress={() => toggleFavorite({ id: bar.id, name: bar.name, address: bar.address, image: bar.image, rating: bar.rating })}
            style={styles.favoriteButtonLarge}
          >
            <ThemedText style={styles.favoriteIconLarge}>
              {isFavorited(bar.id) ? "❤️" : "🤍"}
            </ThemedText>
          </Pressable>
        </ThemedView>

        {/* Address */}
        <ThemedView style={styles.infoSection}>
          <ThemedText style={styles.infoLabel}>📍 Endereço</ThemedText>
          <ThemedText style={styles.infoValue}>{bar.address}</ThemedText>
        </ThemedView>

        {/* Rating */}
        {bar.rating && (
          <ThemedView style={styles.infoSection}>
            <ThemedText style={styles.infoLabel}>⭐ Avaliação</ThemedText>
            <ThemedText style={styles.infoValue}>{bar.rating.toFixed(1)}</ThemedText>
          </ThemedView>
        )}

        {/* Description */}
        {bar.description && (
          <ThemedView style={styles.infoSection}>
            <ThemedText style={styles.infoLabel}>Sobre</ThemedText>
            <ThemedText style={styles.infoValue}>{bar.description}</ThemedText>
          </ThemedView>
        )}

        {/* Drinks Section */}
        <ThemedView style={styles.drinksSection}>
          <ThemedText type="subtitle" style={styles.drinksSectionTitle}>
            Drinks Disponíveis
          </ThemedText>
          {bar.drinks && bar.drinks.length > 0 ? (
            bar.drinks.map((drink) => (
              <ThemedView key={drink.id} style={styles.drinkCard}>
                <ThemedText type="defaultSemiBold" style={styles.drinkName}>
                  {drink.name}
                </ThemedText>
                {drink.description && (
                  <ThemedText style={styles.drinkDescription}>
                    {drink.description}
                  </ThemedText>
                )}
              </ThemedView>
            ))
          ) : (
            <ThemedText style={styles.noDrinksText}>
              Nenhum drink disponível no momento
            </ThemedText>
          )}
        </ThemedView>

        {/* Resgate Status */}
        {resgateStatus && (
          <ThemedView
            style={[
              styles.statusContainer,
              {
                backgroundColor: resgateStatus.canResgate
                  ? "rgba(46, 204, 113, 0.1)"
                  : "rgba(243, 156, 18, 0.1)",
              },
            ]}
          >
            <ThemedText
              style={[
                styles.statusText,
                {
                  color: resgateStatus.canResgate ? successColor : warningColor,
                },
              ]}
            >
              {resgateStatus.message}
            </ThemedText>
          </ThemedView>
        )}

        {/* Resgate Button */}
        <Pressable
          onPress={handleResgate}
          disabled={resgateLoading || !resgateStatus?.canResgate}
          style={({ pressed }) => [
            styles.resgateButton,
            {
              opacity: resgateLoading || !resgateStatus?.canResgate ? 0.6 : pressed ? 0.8 : 1,
            },
          ]}
        >
          {resgateLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.resgateButtonText}>
              Resgatar Drink Grátis
            </ThemedText>
          )}
        </Pressable>

        {/* Map Section (Native Only) */}
        {bar.location && userLocation && Platform.OS !== "web" && (
          <ThemedView style={styles.mapSection}>
            <ThemedText type="subtitle" style={styles.mapTitle}>
              Localização
            </ThemedText>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: bar.location.latitude,
                longitude: bar.location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: bar.location.latitude,
                  longitude: bar.location.longitude,
                }}
                title={bar.name}
                pinColor="#FF6B35"
              />
              <Marker
                coordinate={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                }}
                title="Sua Localização"
                pinColor="#004E89"
              />
            </MapView>
            <ThemedText style={styles.mapDistance}>
              📍 {calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                bar.location.latitude,
                bar.location.longitude
              )} km de distância
            </ThemedText>
          </ThemedView>
        )}

        {/* Info Text */}
        <ThemedView style={styles.infoBox}>
          <ThemedText style={styles.infoBoxText}>
            Você pode resgatar 1 drink grátis por semana em cada bar participante.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
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
  backButtonHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  backButtonHeaderPressed: {
    opacity: 0.7,
  },
  backButtonHeaderText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  barImage: {
    width: "100%",
    height: 240,
    backgroundColor: "#E0E0E0",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  barName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoSection: {
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
  },
  infoValue: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  drinksSection: {
    marginTop: 8,
    gap: 12,
  },
  drinksSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  drinkCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 107, 53, 0.05)",
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
    gap: 4,
  },
  drinkName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  drinkDescription: {
    fontSize: 14,
    color: "#666",
  },
  noDrinksText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  statusContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  resgateButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginVertical: 12,
  },
  resgateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 78, 137, 0.05)",
    borderLeftWidth: 4,
    borderLeftColor: "#004E89",
  },
  infoBoxText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  errorTitle: {
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#FF6B35",
  },
  backButtonPressed: {
    opacity: 0.8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  mapSection: {
    marginTop: 8,
    gap: 12,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  mapDistance: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
    textAlign: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  favoriteButtonLarge: {
    padding: 8,
  },
  favoriteIconLarge: {
    fontSize: 28,
  },
  distanceInfoWeb: {
    padding: 12,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    borderRadius: 8,
    marginVertical: 8,
  },
});
