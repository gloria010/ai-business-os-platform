import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, padding = 'md', onClick }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${paddings[padding]} ${hover ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({ label, value, change, icon, color = 'blue' }: {
  label: string; value: string | number; change?: number; icon: React.ReactNode; color?: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-violet-50 text-violet-600',
    red: 'bg-red-50 text-red-600',
    teal: 'bg-teal-50 text-teal-600',
  };
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {change !== undefined && (
            <p className={`text-xs font-medium mt-1 ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
