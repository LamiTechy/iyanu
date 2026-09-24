"use client";

import { useEffect, useRef } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PushNotificationSync() {
  const lastIdRef = useRef<number>(0);
  const { data } = useSWR("/api/notifications", fetcher, { refreshInterval: 30000 });

  useEffect(() => {
    if (!data?.notifications?.length) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if (!("serviceWorker" in navigator)) return;

    const notifs = data.notifications as Array<{ id: number; message: string; type: string }>;
    const latest = Math.max(...notifs.map((n: any) => n.id));

    if (lastIdRef.current === 0) {
      lastIdRef.current = latest;
      return;
    }

    const newNotifs = notifs.filter((n: any) => n.id > lastIdRef.current);
    if (newNotifs.length === 0) return;

    lastIdRef.current = latest;

    navigator.serviceWorker.ready.then((reg) => {
      newNotifs.forEach((n) => {
        reg.showNotification("MAPOLY", {
          body: n.message,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          tag: String(n.id),
          data: { url: "/notifications" },
        });
      });
    });
  }, [data]);

  return null;
}
