import { StyleSheet, Switch, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useNotifications } from "@/hooks/use-notifications";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const {
    notificationsEnabled,
    loading,
    preferences,
    toggleNotifications,
    updatePreferences,
    sendNotification,
  } = useNotifications();
  const [testLoading, setTestLoading] = useState(false);
  const textColor = useThemeColor({}, "text");
  const secondaryColor = useThemeColor({}, "secondary");
  const surfaceColor = useThemeColor({}, "surface");

  const handleToggleNotifications = async (enabled: boolean) => {
    await toggleNotifications(enabled);
  };

  const handleTogglePreference = async (
    key: keyof typeof preferences,
    value: boolean
  ) => {
    await updatePreferences({ [key]: value });
  };

  const handleSendTestNotification = async () => {
    try {
      setTestLoading(true);
      await sendNotification(
        "🍹 Teste de Notificação",
        "Esta é uma notificação de teste do DrinkOnMe!",
        { type: "test" }
      );
    } finally {
      setTestLoading(false);
    }
  };

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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">Notificações</ThemedText>
          <ThemedText style={styles.subtitle}>
            Controle quando deseja receber alertas
          </ThemedText>
        </ThemedView>

        {/* Main Toggle */}
        <ThemedView
          style={[
            styles.section,
            {
              backgroundColor: surfaceColor,
            },
          ]}
        >
          <ThemedView style={styles.sectionHeader}>
            <ThemedView style={styles.headerContent}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                🔔 Ativar Notificações
              </ThemedText>
              <ThemedText style={styles.sectionDescription}>
                Receba alertas sobre drinks e resgates
              </ThemedText>
            </ThemedView>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: "#ccc", true: "#FF6B35" }}
              thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
            />
          </ThemedView>
        </ThemedView>

        {/* Notification Preferences */}
        {notificationsEnabled && (
          <>
            {/* New Drinks in Favorites */}
            <ThemedView
              style={[
                styles.section,
                {
                  backgroundColor: surfaceColor,
                },
              ]}
            >
              <ThemedView style={styles.preferenceItem}>
                <ThemedView style={styles.preferenceContent}>
                  <ThemedText type="defaultSemiBold" style={styles.preferenceName}>
                    🍹 Novos Drinks
                  </ThemedText>
                  <ThemedText style={styles.preferenceDescription}>
                    Alerta quando um novo drink fica disponível em bares favoritos
                  </ThemedText>
                </ThemedView>
                <Switch
                  value={preferences.newDrinksInFavorites}
                  onValueChange={(value) =>
                    handleTogglePreference("newDrinksInFavorites", value)
                  }
                  trackColor={{ false: "#ccc", true: "#FF6B35" }}
                  thumbColor={preferences.newDrinksInFavorites ? "#fff" : "#f4f3f4"}
                />
              </ThemedView>
            </ThemedView>

            {/* Weekly Resgate Reminder */}
            <ThemedView
              style={[
                styles.section,
                {
                  backgroundColor: surfaceColor,
                },
              ]}
            >
              <ThemedView style={styles.preferenceItem}>
                <ThemedView style={styles.preferenceContent}>
                  <ThemedText type="defaultSemiBold" style={styles.preferenceName}>
                    🎉 Resgate Semanal
                  </ThemedText>
                  <ThemedText style={styles.preferenceDescription}>
                    Lembrete quando seu resgate semanal fica disponível
                  </ThemedText>
                </ThemedView>
                <Switch
                  value={preferences.weeklyResgateReminder}
                  onValueChange={(value) =>
                    handleTogglePreference("weeklyResgateReminder", value)
                  }
                  trackColor={{ false: "#ccc", true: "#FF6B35" }}
                  thumbColor={preferences.weeklyResgateReminder ? "#fff" : "#f4f3f4"}
                />
              </ThemedView>
            </ThemedView>

            {/* Bar Updates */}
            <ThemedView
              style={[
                styles.section,
                {
                  backgroundColor: surfaceColor,
                },
              ]}
            >
              <ThemedView style={styles.preferenceItem}>
                <ThemedView style={styles.preferenceContent}>
                  <ThemedText type="defaultSemiBold" style={styles.preferenceName}>
                    📢 Atualizações de Bares
                  </ThemedText>
                  <ThemedText style={styles.preferenceDescription}>
                    Notificações sobre eventos e promoções dos bares
                  </ThemedText>
                </ThemedView>
                <Switch
                  value={preferences.barUpdates}
                  onValueChange={(value) =>
                    handleTogglePreference("barUpdates", value)
                  }
                  trackColor={{ false: "#ccc", true: "#FF6B35" }}
                  thumbColor={preferences.barUpdates ? "#fff" : "#f4f3f4"}
                />
              </ThemedView>
            </ThemedView>

            {/* Test Notification */}
            <ThemedView style={styles.section}>
              <Pressable
                onPress={handleSendTestNotification}
                disabled={testLoading}
                style={({ pressed }) => [
                  styles.testButton,
                  pressed && styles.testButtonPressed,
                  testLoading && styles.testButtonDisabled,
                ]}
              >
                {testLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <ThemedText style={styles.testButtonText}>
                    📬 Enviar Notificação de Teste
                  </ThemedText>
                )}
              </Pressable>
            </ThemedView>
          </>
        )}

        {/* Info Section */}
        <ThemedView style={styles.infoSection}>
          <ThemedText style={styles.infoTitle}>ℹ️ Informações</ThemedText>
          <ThemedText style={styles.infoText}>
            As notificações são armazenadas localmente no seu dispositivo. Para receber
            notificações push em tempo real, você pode conectar uma conta de backend.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.spacer} />
      </ScrollView>
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
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  headerContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: "#666",
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceName: {
    fontSize: 15,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  testButtonPressed: {
    opacity: 0.8,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  infoSection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#FF6B35",
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  spacer: {
    height: 20,
  },
});
