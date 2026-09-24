"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 card p-4 shadow-xl max-w-xs">
      <p className="text-sm font-medium mb-2">Install MAPOLY</p>
      <p className="text-xs text-gray-500 mb-3">Install this app on your device for offline access.</p>
      <div className="flex gap-2">
        <button onClick={handleInstall} className="btn-primary text-xs px-3 py-1.5">Install</button>
        <button onClick={() => setShow(false)} className="btn-outline text-xs px-3 py-1.5">Dismiss</button>
      </div>
    </div>
  );
}
