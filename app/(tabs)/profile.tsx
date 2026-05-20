import { StyleSheet, Pressable, ActivityIndicator, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as Auth from "@/lib/auth";

interface Resgate {
  id: string;
  barId: string;
  barName: string;
  drinkName: string;
  resgatoDate: string;
  createdAt: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();
  const [resgates, setResgates] = useState<Resgate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textColor = useThemeColor({}, "text");
  const secondaryColor = useThemeColor({}, "secondary");
  const successColor = useThemeColor({}, "success");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      loadResgates();
    }
  }, [user]);

  const loadResgates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getStoredToken();
      if (!token) {
        setError("Token não encontrado");
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/resgates/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar resgates");
      }

      const data = await response.json();
      setResgates(Array.isArray(data) ? data : data.resgates || []);
    } catch (err) {
      console.error("Erro ao carregar resgates:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const getStoredToken = async () => {
    const token = await Auth.getSessionToken();
    return token;
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

  if (authLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={secondaryColor} />
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={secondaryColor} />
      </ThemedView>
    );
  }

  const renderResgate = ({ item }: { item: Resgate }) => (
    <ThemedView style={styles.resgateCard}>
      <ThemedView style={styles.resgateLine}>
        <ThemedText type="defaultSemiBold" style={styles.barName}>
          {item.barName}
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.drinkName}>{item.drinkName}</ThemedText>
      <ThemedText style={styles.date}>
        {new Date(item.createdAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        },
      ]}
    >
      {/* Header com info do usuário */}
      {user && (
        <ThemedView style={styles.header}>
          <ThemedView style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.userInfo}>
            <ThemedText type="title" style={styles.userName}>
              {user.name || user.email || "Usuário"}
            </ThemedText>
            <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      {/* Estatísticas */}
      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statCard}>
          <ThemedText type="defaultSemiBold" style={styles.statValue}>
            {resgates.length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Resgates Totais</ThemedText>
        </ThemedView>
        {resgates.length > 0 && (
          <ThemedView style={styles.statCard}>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>
              {new Date(resgates[0].createdAt).toLocaleDateString("pt-BR")}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Último Resgate</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Histórico de Resgates */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Histórico de Resgates
      </ThemedText>

      {error && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={secondaryColor} style={styles.loader} />
      ) : resgates.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            Você ainda não resgatou nenhum drink.
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Visite a aba Home para encontrar bares participantes!
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={resgates}
          renderItem={renderResgate}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Botão Logout */}
      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}
      >
        <ThemedText style={styles.logoutText}>Sair</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    color: "#FF6B35",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  listContainer: {
    gap: 12,
    marginBottom: 16,
  },
  resgateCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(46, 204, 113, 0.05)",
    borderLeftWidth: 4,
    borderLeftColor: "#2ECC71",
  },
  resgateLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  barName: {
    fontSize: 16,
    flex: 1,
  },
  drinkName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#999",
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
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  loader: {
    marginVertical: 32,
  },
  logoutButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
