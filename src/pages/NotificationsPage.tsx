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
  return (
    <DashboardLayout role="consumer" title="Notifications">
      <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
        <Bell className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Notifications are turned off.</p>
      </div>
    </DashboardLayout>
  );
}
