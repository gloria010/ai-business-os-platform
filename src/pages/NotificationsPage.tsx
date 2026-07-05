import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Package, Tag, MessageSquare, Zap, Check } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useApp } from '../contexts/AppContext';
import { Notification } from '../types';

const iconMap: Record<Notification['type'], React.ReactNode> = {
  order: <Package className="w-5 h-5" />,
  offer: <Tag className="w-5 h-5" />,
  recommendation: <Zap className="w-5 h-5" />,
  message: <MessageSquare className="w-5 h-5" />,
  system: <Bell className="w-5 h-5" />,
};

const colorMap: Record<Notification['type'], string> = {
  order: 'bg-blue-100 text-blue-600',
  offer: 'bg-amber-100 text-amber-600',
  recommendation: 'bg-violet-100 text-violet-600',
  message: 'bg-emerald-100 text-emerald-600',
  system: 'bg-slate-100 text-slate-600',
};

export default function NotificationsPage() {
  const { state, dispatch } = useApp();
  const unread = state.notifications.filter(n => !n.read).length;

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <DashboardLayout role="consumer" title="Notifications">
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-500 text-sm">{unread} unread</p>
        {unread > 0 && (
          <button onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
            className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold hover:underline">
            <Check className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {state.notifications.map((notif, i) => (
          <motion.div key={notif.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id })}
            className={`bg-white rounded-2xl border p-5 flex gap-4 cursor-pointer transition-all hover:shadow-md ${notif.read ? 'border-slate-100' : 'border-blue-200 bg-blue-50/30'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[notif.type]}`}>
              {iconMap[notif.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className={`font-semibold text-sm ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h3>
                <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(notif.createdAt)}</span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">{notif.message}</p>
            </div>
            {!notif.read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />}
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
