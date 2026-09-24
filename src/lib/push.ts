import webpush from "web-push";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    `mailto:admin@mapoly.edu.ng`,
    vapidPublicKey,
    vapidPrivateKey
  );
}

export function getVapidPublicKey(): string {
  return vapidPublicKey;
}

export function isPushConfigured(): boolean {
  return !!(vapidPublicKey && vapidPrivateKey);
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string; url?: string }
) {
  if (!isPushConfigured()) {
    console.warn("Push not configured — set VAPID keys");
    return;
  }
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.warn("Push subscription expired or invalid");
      return { expired: true };
    }
    throw error;
  }
}
