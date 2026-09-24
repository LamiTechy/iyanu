"use client";

import useSWR from "swr";
import Navbar from "@/components/Navbar";
import { Bell, AlertTriangle, Calendar, MessageSquare, Inbox } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

const typeIcons: Record<string, { icon: React.ReactNode; gradient: string }> = {
  alert: { icon: <AlertTriangle size={16} />, gradient: "from-red-400 to-rose-500" },
  deadline: { icon: <Calendar size={16} />, gradient: "from-orange-400 to-amber-500" },
  reminder: { icon: <Bell size={16} />, gradient: "from-blue-400 to-cyan-500" },
};

export default function NotificationsPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/notifications", fetcher, { refreshInterval: 15000 });

  const markRead = async (id: number) => {
    await fetch(`/api/notifications/${id}`, { method: "PUT" });
    mutate();
  };

  if (error) return <div className="p-8 text-center text-red-500">Failed to load notifications</div>;

  const notifications = data?.notifications || [];
  const unread = notifications.filter((n: any) => !n.isRead);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">
              {unread.length > 0
                ? `${unread.length} unread notification${unread.length === 1 ? "" : "s"}`
                : "All caught up!"}
            </p>
          </div>
          {unread.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
              <Bell size={12} />
              {unread.length} new
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/3 mt-2" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-12 text-center">
            <Inbox size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">You&apos;ll see alerts and reminders here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif: any, idx: number) => {
              const typeConfig = typeIcons[notif.type] || { icon: <MessageSquare size={16} />, gradient: "from-gray-400 to-gray-500" };
              return (
                <div key={notif.id}
                  className={`card p-5 flex items-start gap-4 cursor-pointer transition-all slide-up ${
                    !notif.isRead ? "bg-gradient-to-r from-blue-50/80 to-transparent border-l-4 border-l-blue-500" : "hover:bg-gray-50/50"
                  }`}
                  onClick={() => !notif.isRead && markRead(notif.id)}
                  style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${typeConfig.gradient} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                    {typeConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.isRead ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.sentAt).toLocaleString()}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="flex-shrink-0">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full block" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
