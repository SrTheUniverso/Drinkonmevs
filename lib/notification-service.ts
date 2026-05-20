import { useNotifications } from "@/hooks/use-notifications";
import { useFavorites } from "@/hooks/use-favorites";

/**
 * Notification Service
 * Integrates notifications with favorites and drinks
 */

export interface DrinkNotification {
  barId: string;
  barName: string;
  drinkId: string;
  drinkName: string;
  timestamp: number;
}

// Store for tracking sent notifications (to avoid duplicates)
const sentNotifications = new Map<string, number>();

/**
 * Check if a notification has been sent recently (within 1 hour)
 */
export function hasRecentNotification(key: string): boolean {
  const lastSent = sentNotifications.get(key);
  if (!lastSent) return false;

  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  return lastSent > oneHourAgo;
}

/**
 * Mark a notification as sent
 */
export function markNotificationAsSent(key: string): void {
  sentNotifications.set(key, Date.now());
}

/**
 * Clear old notifications from memory (older than 24 hours)
 */
export function clearOldNotifications(): void {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  for (const [key, timestamp] of sentNotifications.entries()) {
    if (timestamp < oneDayAgo) {
      sentNotifications.delete(key);
    }
  }
}

/**
 * Send notification for new drink in favorite bar
 */
export async function notifyNewDrinkInFavorite(
  useNotificationsHook: ReturnType<typeof useNotifications>,
  barName: string,
  drinkName: string
): Promise<void> {
  const notificationKey = `new_drink_${barName}_${drinkName}`;

  // Avoid duplicate notifications within 1 hour
  if (hasRecentNotification(notificationKey)) {
    console.log("[NotificationService] Skipping duplicate notification:", notificationKey);
    return;
  }

  try {
    await useNotificationsHook.sendNewDrinkNotification(barName, drinkName);
    markNotificationAsSent(notificationKey);
    console.log("[NotificationService] New drink notification sent:", {
      barName,
      drinkName,
    });
  } catch (err) {
    console.error("[NotificationService] Error sending new drink notification:", err);
  }
}

/**
 * Send notification for weekly resgate availability
 */
export async function notifyWeeklyResgateAvailable(
  useNotificationsHook: ReturnType<typeof useNotifications>,
  barName: string
): Promise<void> {
  const notificationKey = `weekly_resgate_${barName}`;

  // Avoid duplicate notifications within 1 hour
  if (hasRecentNotification(notificationKey)) {
    console.log("[NotificationService] Skipping duplicate notification:", notificationKey);
    return;
  }

  try {
    await useNotificationsHook.sendWeeklyResgateReminder(barName);
    markNotificationAsSent(notificationKey);
    console.log("[NotificationService] Weekly resgate notification sent:", { barName });
  } catch (err) {
    console.error("[NotificationService] Error sending weekly resgate notification:", err);
  }
}

/**
 * Send notification for bar updates (events, promotions, etc)
 */
export async function notifyBarUpdate(
  useNotificationsHook: ReturnType<typeof useNotifications>,
  barName: string,
  updateMessage: string
): Promise<void> {
  const notificationKey = `bar_update_${barName}_${updateMessage}`;

  // Avoid duplicate notifications within 1 hour
  if (hasRecentNotification(notificationKey)) {
    console.log("[NotificationService] Skipping duplicate notification:", notificationKey);
    return;
  }

  try {
    await useNotificationsHook.sendBarUpdateNotification(barName, updateMessage);
    markNotificationAsSent(notificationKey);
    console.log("[NotificationService] Bar update notification sent:", {
      barName,
      updateMessage,
    });
  } catch (err) {
    console.error("[NotificationService] Error sending bar update notification:", err);
  }
}

/**
 * Monitor favorite bars for new drinks and send notifications
 * This would typically be called periodically or when the app checks for updates
 */
export async function monitorFavoriteBarsForNewDrinks(
  useNotificationsHook: ReturnType<typeof useNotifications>,
  useFavoritesHook: ReturnType<typeof useFavorites>,
  newDrinks: Array<{ barId: string; barName: string; drinkName: string }>
): Promise<void> {
  const { favorites } = useFavoritesHook;

  for (const drink of newDrinks) {
    // Check if the bar is in favorites
    const isFavorited = favorites.some((fav) => fav.id === drink.barId);

    if (isFavorited) {
      await notifyNewDrinkInFavorite(
        useNotificationsHook,
        drink.barName,
        drink.drinkName
      );
    }
  }
}

/**
 * Schedule periodic cleanup of old notifications
 */
export function setupNotificationCleanup(): () => void {
  const interval = setInterval(() => {
    clearOldNotifications();
    console.log("[NotificationService] Cleaned up old notifications");
  }, 60 * 60 * 1000); // Run every hour

  // Return cleanup function
  return () => clearInterval(interval);
}
