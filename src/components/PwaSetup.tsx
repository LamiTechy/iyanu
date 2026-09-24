"use client";

import { useEffect, useState } from "react";

export default function PwaSetup() {
  const [supported, setSupported] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unset">("unset");

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      nukeStaleServiceWorker();
      return;
    }
    if ("serviceWorker" in navigator) {
      setSupported(true);
      registerSw();
    }
    if ("Notification" in window) {
      setPermission(Notification.permission || "unset");
    }
    if ("PushManager" in window) {
      setPushSupported(true);
    }
  }, []);

  async function nukeStaleServiceWorker() {
    try {
      if (!("serviceWorker" in navigator) || !("caches" in window)) return;
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      if (regs.length > 0 && !sessionStorage.getItem("sw-nuked")) {
        sessionStorage.setItem("sw-nuked", "1");
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to clean up service worker:", err);
    }
  }

  async function registerSw() {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("SW registered:", reg.scope);
    } catch (err) {
      console.error("SW registration failed:", err);
    }
  }

  async function requestPermission() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      await subscribeToPush();
    }
  }

  async function subscribeToPush() {
    try {
      const reg = await navigator.serviceWorker.ready;

      const res = await fetch("/api/push/vapid-public-key");
      const { publicKey } = await res.json();
      if (!publicKey) return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
    } catch (err) {
      console.error("Push subscribe failed:", err);
    }
  }

  if (!supported) return null;

  if (permission === "granted") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {(permission === "unset" || permission === "default") && pushSupported && (
        <button
          onClick={requestPermission}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium hover:bg-blue-700 animate-bounce"
        >
          Enable Notifications
        </button>
      )}
      {permission === "denied" && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl shadow-lg text-sm">
          Notifications blocked — enable in browser settings
        </div>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
