import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "drinkonme_favorites";

export interface FavoriteBar {
  id: string;
  name: string;
  address: string;
  image?: string;
  rating?: number;
  distance?: number;
  addedAt: number; // Timestamp when added to favorites
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("[useFavorites] Loaded favorites:", parsed);
        setFavorites(parsed);
      }
    } catch (err) {
      console.error("[useFavorites] Error loading favorites:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar favoritos");
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = async (newFavorites: FavoriteBar[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      console.log("[useFavorites] Favorites saved:", newFavorites);
      setFavorites(newFavorites);
    } catch (err) {
      console.error("[useFavorites] Error saving favorites:", err);
      setError(err instanceof Error ? err.message : "Erro ao salvar favoritos");
    }
  };

  const addFavorite = useCallback(
    async (bar: Omit<FavoriteBar, "addedAt">) => {
      try {
        // Check if already favorited
        const isFavorited = favorites.some((fav) => fav.id === bar.id);
        if (isFavorited) {
          console.log("[useFavorites] Bar already favorited:", bar.id);
          return;
        }

        const newFavorite: FavoriteBar = {
          ...bar,
          addedAt: Date.now(),
        };

        const updated = [newFavorite, ...favorites];
        await saveFavorites(updated);
        console.log("[useFavorites] Favorite added:", bar.id);
      } catch (err) {
        console.error("[useFavorites] Error adding favorite:", err);
        setError(err instanceof Error ? err.message : "Erro ao adicionar favorito");
      }
    },
    [favorites]
  );

  const removeFavorite = useCallback(
    async (barId: string) => {
      try {
        const updated = favorites.filter((fav) => fav.id !== barId);
        await saveFavorites(updated);
        console.log("[useFavorites] Favorite removed:", barId);
      } catch (err) {
        console.error("[useFavorites] Error removing favorite:", err);
        setError(err instanceof Error ? err.message : "Erro ao remover favorito");
      }
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (bar: Omit<FavoriteBar, "addedAt">) => {
      const isFavorited = favorites.some((fav) => fav.id === bar.id);
      if (isFavorited) {
        await removeFavorite(bar.id);
      } else {
        await addFavorite(bar);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const isFavorited = useCallback(
    (barId: string) => {
      return favorites.some((fav) => fav.id === barId);
    },
    [favorites]
  );

  const getFavorite = useCallback(
    (barId: string) => {
      return favorites.find((fav) => fav.id === barId);
    },
    [favorites]
  );

  const clearFavorites = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
      setFavorites([]);
      console.log("[useFavorites] All favorites cleared");
    } catch (err) {
      console.error("[useFavorites] Error clearing favorites:", err);
      setError(err instanceof Error ? err.message : "Erro ao limpar favoritos");
    }
  }, []);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
    getFavorite,
    clearFavorites,
    refresh: loadFavorites,
  };
}
