import { useEffect, useState, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATIONS_ENABLED_KEY = "drinkonme_notifications_enabled";
const NOTIFICATION_TOKEN_KEY = "drinkonme_notification_token";

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPreferences {
  enabled: boolean;
  newDrinksInFavorites: boolean;
  weeklyResgateReminder: boolean;
  barUpdates: boolean;
}

export function useNotifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    newDrinksInFavorites: true,
    weeklyResgateReminder: true,
    barUpdates: false,
  });

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
    registerForPushNotifications();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      const enabled = stored ? JSON.parse(stored) : true;
      setNotificationsEnabled(enabled);

      const token = await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
      if (token) {
        setExpoPushToken(token);
      }

      console.log("[useNotifications] Preferences loaded:", { enabled });
    } catch (err) {
      console.error("[useNotifications] Error loading preferences:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar preferências");
    } finally {
      setLoading(false);
    }
  };

  const registerForPushNotifications = async () => {
    try {
      // Check if device is physical (not simulator)
      if (!Device.isDevice) {
        console.log("[useNotifications] Running on simulator, skipping push registration");
        return;
      }

      // Request notification permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("[useNotifications] Permission not granted for notifications");
        setNotificationsEnabled(false);
        return;
      }

      // Get push token (for local notifications, we use a local token)
      const token = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setExpoPushToken(token);
      await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);

      console.log("[useNotifications] Push token registered:", token);
    } catch (err) {
      console.error("[useNotifications] Error registering for push notifications:", err);
      setError(err instanceof Error ? err.message : "Erro ao registrar notificações");
    }
  };

  const toggleNotifications = useCallback(async (enabled: boolean) => {
    try {
      setNotificationsEnabled(enabled);
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, JSON.stringify(enabled));
      console.log("[useNotifications] Notifications toggled:", enabled);
    } catch (err) {
      console.error("[useNotifications] Error toggling notifications:", err);
      setError(err instanceof Error ? err.message : "Erro ao alternar notificações");
    }
  }, []);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      setPreferences(updated);
      await AsyncStorage.setItem(
        "drinkonme_notification_preferences",
        JSON.stringify(updated)
      );
      console.log("[useNotifications] Preferences updated:", updated);
    } catch (err) {
      console.error("[useNotifications] Error updating preferences:", err);
      setError(err instanceof Error ? err.message : "Erro ao atualizar preferências");
    }
  }, [preferences]);

  const sendNotification = useCallback(
    async (title: string, body: string, data?: Record<string, any>) => {
      try {
        if (!notificationsEnabled) {
          console.log("[useNotifications] Notifications disabled, skipping");
          return;
        }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          badge: 1,
        },
        trigger: {
          type: "timeInterval",
          seconds: 1, // Send immediately
        } as any,
      });

        console.log("[useNotifications] Notification sent:", { title, body });
      } catch (err) {
        console.error("[useNotifications] Error sending notification:", err);
        setError(err instanceof Error ? err.message : "Erro ao enviar notificação");
      }
    },
    [notificationsEnabled]
  );

  const sendNewDrinkNotification = useCallback(
    async (barName: string, drinkName: string) => {
      if (!preferences.newDrinksInFavorites) {
        console.log("[useNotifications] New drinks notifications disabled");
        return;
      }

      await sendNotification(
        `🍹 ${barName}`,
        `Novo drink disponível: ${drinkName}`,
        { type: "new_drink", barName, drinkName }
      );
    },
    [preferences.newDrinksInFavorites, sendNotification]
  );

  const sendWeeklyResgateReminder = useCallback(
    async (barName: string) => {
      if (!preferences.weeklyResgateReminder) {
        console.log("[useNotifications] Weekly resgate reminders disabled");
        return;
      }

      await sendNotification(
        "🎉 Resgate Disponível",
        `Seu resgate semanal está disponível em ${barName}!`,
        { type: "weekly_resgate", barName }
      );
    },
    [preferences.weeklyResgateReminder, sendNotification]
  );

  const sendBarUpdateNotification = useCallback(
    async (barName: string, updateMessage: string) => {
      if (!preferences.barUpdates) {
        console.log("[useNotifications] Bar update notifications disabled");
        return;
      }

      await sendNotification(
        `📢 ${barName}`,
        updateMessage,
        { type: "bar_update", barName }
      );
    },
    [preferences.barUpdates, sendNotification]
  );

  const cancelAllNotifications = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("[useNotifications] All notifications cancelled");
    } catch (err) {
      console.error("[useNotifications] Error cancelling notifications:", err);
      setError(err instanceof Error ? err.message : "Erro ao cancelar notificações");
    }
  }, []);

  return {
    notificationsEnabled,
    loading,
    error,
    expoPushToken,
    preferences,
    toggleNotifications,
    updatePreferences,
    sendNotification,
    sendNewDrinkNotification,
    sendWeeklyResgateReminder,
    sendBarUpdateNotification,
    cancelAllNotifications,
    requestPermissions: registerForPushNotifications,
  };
}
