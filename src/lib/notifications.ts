/**
 * Client-side notification manager for Web Push & In-App Notifications
 */

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    return reg;
  } catch (err) {
    console.warn("[Notifications] Service worker registration failed:", err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      await registerServiceWorker();
      return true;
    }
    return false;
  } catch (err) {
    console.error("[Notifications] Permission request error:", err);
    return false;
  }
}

export async function showSongNotification(senderName?: string, trackName?: string) {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;

  const title = "Musicophile 💌";
  const body = senderName
    ? `${senderName} sent you a song. Take a quiet moment.`
    : "A friend sent you a song. Take a quiet moment.";

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: "/icon.svg",
          badge: "/icon.svg",
          data: { url: "/" },
        });
        return;
      }
    }

    new Notification(title, {
      body,
      icon: "/icon.svg",
    });
  } catch (err) {
    console.error("[Notifications] Failed to display notification:", err);
  }
}
