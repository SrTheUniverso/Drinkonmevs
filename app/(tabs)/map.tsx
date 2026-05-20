import { StyleSheet, View, ActivityIndicator, Pressable, FlatList, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, calculateDistance } from "@/hooks/use-location";
import { useThemeColor } from "@/hooks/use-theme-color";
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

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { location: userLocation, loading: locationLoading, error: locationError, requestPermission } = useLocation();
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const mapRef = useRef<MapView>(null);
  const textColor = useThemeColor({}, "text");
  const secondaryColor = useThemeColor({}, "secondary");
  const surfaceColor = useThemeColor({}, "surface");

  useEffect(() => {
    if (userLocation) {
      loadBars();
    }
  }, [userLocation]);

  const loadBars = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await Auth.getSessionToken();
      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/bares`;

      console.log("[MapScreen] Loading bars from:", url);

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

      if (!response.ok) {
        throw new Error("Falha ao carregar bares");
      }

      const data = await response.json();
      console.log("[MapScreen] Bares loaded:", data);

      // Handle both array and object responses
      let barsList = Array.isArray(data) ? data : data.bares || [];

      // Calculate distance from user location
      if (userLocation) {
        barsList = barsList.map((bar: Bar) => {
          if (bar.location) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              bar.location.latitude,
              bar.location.longitude
            );
            return { ...bar, distance };
          }
          return bar;
        });

        // Sort by distance
        barsList.sort((a: Bar, b: Bar) => (a.distance || Infinity) - (b.distance || Infinity));
      }

      setBars(barsList);
    } catch (err) {
      console.error("[MapScreen] Error loading bars:", err);
      const message = err instanceof Error ? err.message : "Erro ao carregar bares";
      setError(message);
      setBars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBarPress = (barId: string) => {
    router.push({
      pathname: "/bar/[id]",
      params: { id: barId },
    } as any);
  };

  const handleMarkerPress = (bar: Bar) => {
    setSelectedBar(bar);
    if (bar.location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: bar.location.latitude,
        longitude: bar.location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const handlePermissionRequest = async () => {
    await requestPermission();
  };

  if (locationLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={secondaryColor} />
        <ThemedText style={styles.loadingText}>Obtendo localização...</ThemedText>
      </ThemedView>
    );
  }

  if (locationError) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle" style={styles.errorTitle}>
          Localização não disponível
        </ThemedText>
        <ThemedText style={styles.errorMessage}>{locationError.message}</ThemedText>
        <Pressable
          onPress={handlePermissionRequest}
          style={({ pressed }) => [
            styles.permissionButton,
            pressed && styles.permissionButtonPressed,
          ]}
        >
          <ThemedText style={styles.permissionButtonText}>
            Permitir Localização
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (!userLocation) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle">Localização não obtida</ThemedText>
        <Pressable
          onPress={handlePermissionRequest}
          style={({ pressed }) => [
            styles.permissionButton,
            pressed && styles.permissionButtonPressed,
          ]}
        >
          <ThemedText style={styles.permissionButtonText}>Tentar Novamente</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  // Map is not supported on web
  if (Platform.OS === "web") {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.centerContainer}>
          <ThemedText type="subtitle" style={styles.errorTitle}>
            Mapa não disponível na web
          </ThemedText>
          <ThemedText style={styles.errorMessage}>
            Use o aplicativo em iOS ou Android para visualizar o mapa interativo.
          </ThemedText>
          <ThemedText style={styles.infoMessage}>
            Você pode visualizar a lista de bares abaixo:
          </ThemedText>
          <FlatList
            data={bars}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleBarPress(item.id)}
                style={({ pressed }) => [
                  styles.listItem,
                  pressed && styles.listItemPressed,
                ]}
              >
                <ThemedView>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  {item.distance && (
                    <ThemedText style={styles.listItemDistance}>
                      {item.distance} km
                    </ThemedText>
                  )}
                </ThemedView>
              </Pressable>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            style={styles.list}
          />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
        followsUserLocation={false}
      >
        {/* User Location Marker */}
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Sua Localização"
          pinColor="#FF6B35"
        />

        {/* Bar Markers */}
        {bars.map((bar) => (
          bar.location && (
            <Marker
              key={bar.id}
              coordinate={{
                latitude: bar.location.latitude,
                longitude: bar.location.longitude,
              }}
              title={bar.name}
              description={bar.address}
              pinColor={selectedBar?.id === bar.id ? "#FF6B35" : "#004E89"}
              onPress={() => handleMarkerPress(bar)}
            />
          )
        ))}
      </MapView>

      {/* Selected Bar Info Card */}
      {selectedBar && (
        <ThemedView style={[styles.infoCard, { backgroundColor: surfaceColor }]}>
          <ThemedText type="defaultSemiBold" style={styles.barName}>
            {selectedBar.name}
          </ThemedText>
          <ThemedText style={styles.barAddress} numberOfLines={2}>
            {selectedBar.address}
          </ThemedText>
          {selectedBar.distance && (
            <ThemedText style={styles.distance}>
              📍 {selectedBar.distance} km de distância
            </ThemedText>
          )}
          {selectedBar.rating && (
            <ThemedText style={styles.rating}>
              ⭐ {selectedBar.rating.toFixed(1)} avaliação
            </ThemedText>
          )}
          <Pressable
            onPress={() => handleBarPress(selectedBar.id)}
            style={({ pressed }) => [
              styles.detailsButton,
              pressed && styles.detailsButtonPressed,
            ]}
          >
            <ThemedText style={styles.detailsButtonText}>Ver Detalhes</ThemedText>
          </Pressable>
        </ThemedView>
      )}

      {/* Bars List (Bottom Sheet Style) */}
      {!selectedBar && bars.length > 0 && (
        <ThemedView style={[styles.listContainer, { backgroundColor: surfaceColor }]}>
          <ThemedText type="subtitle" style={styles.listTitle}>
            Bares Próximos
          </ThemedText>
          <FlatList
            data={bars}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleMarkerPress(item)}
                style={({ pressed }) => [
                  styles.listItem,
                  pressed && styles.listItemPressed,
                ]}
              >
                <ThemedView>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  {item.distance && (
                    <ThemedText style={styles.listItemDistance}>
                      {item.distance} km
                    </ThemedText>
                  )}
                </ThemedView>
              </Pressable>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            style={styles.list}
          />
        </ThemedView>
      )}

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={secondaryColor} />
        </View>
      )}

      {/* Error State */}
      {error && (
        <ThemedView style={styles.errorBanner}>
          <ThemedText style={styles.errorBannerText}>{error}</ThemedText>
        </ThemedView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
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
  infoMessage: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  permissionButtonPressed: {
    opacity: 0.8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  map: {
    flex: 1,
  },
  infoCard: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    gap: 8,
  },
  barName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  barAddress: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  distance: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "600",
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "600",
  },
  detailsButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  detailsButtonPressed: {
    opacity: 0.8,
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "40%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  list: {
    maxHeight: "100%",
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "rgba(255, 107, 53, 0.05)",
  },
  listItemPressed: {
    backgroundColor: "rgba(255, 107, 53, 0.15)",
  },
  listItemDistance: {
    fontSize: 12,
    color: "#FF6B35",
    marginTop: 4,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  errorBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
  },
  errorBannerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
