import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
import PwaSetup from "@/components/PwaSetup";
import PushNotificationSync from "@/components/PushNotificationSync";
import InstallPrompt from "@/components/InstallPrompt";

export const metadata: Metadata = {
  title: "MAPOLY - Assignment Progression Tracker",
  description: "Assignment Progression Tracker with Predictive Alert - Moshood Abiola Polytechnic",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "MAPOLY",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#1d4ed8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#f0f4f8]">
        {children}
        <PwaSetup />
        <PushNotificationSync />
        <InstallPrompt />
      </body>
    </html>
  );
}
