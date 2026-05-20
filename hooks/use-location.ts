import { useEffect, useState } from "react";
import * as Location from "expo-location";

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationError {
  code: string;
  message: string;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LocationError | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      console.log("[useLocation] Permission status:", status);

      if (status !== "granted") {
        setError({
          code: "PERMISSION_DENIED",
          message: "Permissão de localização negada",
        });
        setLoading(false);
        return;
      }

      // Get current location
      await getCurrentLocation();
    } catch (err) {
      console.error("[useLocation] Error requesting permission:", err);
      setError({
        code: "ERROR",
        message: err instanceof Error ? err.message : "Erro ao obter localização",
      });
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[useLocation] Getting current location...");

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      console.log("[useLocation] Location obtained:", currentLocation);

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy || undefined,
      });
    } catch (err) {
      console.error("[useLocation] Error getting location:", err);
      setError({
        code: "LOCATION_ERROR",
        message: err instanceof Error ? err.message : "Erro ao obter localização",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    await getCurrentLocation();
  };

  return {
    location,
    loading,
    error,
    permissionStatus,
    refreshLocation,
    requestPermission: requestLocationPermission,
  };
}

/**
 * Calculate distance between two coordinates in kilometers
 * Using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}
