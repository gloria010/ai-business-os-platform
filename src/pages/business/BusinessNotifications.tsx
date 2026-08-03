import React, { useEffect, useState } from "react";
import { Bell, ShoppingBag } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const API_BASE = "http://localhost:5000";

interface NotificationItem {
  id: number;
  icon: React.ReactNode;
  title: string;
  message: string;
  time: string;
}

export default function BusinessNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      let businessId = localStorage.getItem("businessId") || "BIZ-FUR-HOME";

      try {
        const sessionRes = await fetch(`${API_BASE}/api/login/session`, {
          credentials: "include",
        });
        const sessionData = await sessionRes.json();
        if (sessionData?.success && sessionData?.user?.company) {
          businessId = sessionData.user.company;
        }
      } catch {
        // Keep the stored fallback.
      }

      localStorage.setItem("businessId", businessId);

      try {
        const res = await fetch(
          `${API_BASE}/api/messages?businessId=${encodeURIComponent(businessId)}&to=HR`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();

        if (data?.success) {
          const messages = Array.isArray(data.messages) ? data.messages : [];

          setNotifications(
            messages.map((msg: any, index: number) => ({
              id: msg.id ?? index + 1,
              icon:
                index % 2 === 0 ? (
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                ) : (
                  <Bell className="w-5 h-5 text-orange-600" />
                ),
              title: msg.subject || msg.title || "Message",
              message: msg.message || msg.content || "No content",
              time: msg.created_at ? new Date(msg.created_at).toLocaleString() : "Just now",
            }))
          );
        } else {
          setNotifications([]);
        }
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, []);

  return (
    <DashboardLayout role="business" title="Business Notifications">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Notifications</h2>

        <div className="space-y-4">
          {notifications.length === 0 && <p className="text-slate-500">No notifications yet.</p>}
          {notifications.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                {item.icon}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{item.title}</h3>

                <p className="text-sm text-slate-600 mt-1">{item.message}</p>

                <p className="text-xs text-slate-400 mt-2">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}