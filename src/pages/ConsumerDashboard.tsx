import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Bell, TrendingUp, Package, Star, ArrowRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StatCard } from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import { useApp } from '../contexts/AppContext';
import { products, mockOrders, revenueData } from '../data/mockData';

export default function ConsumerDashboard() {
  const { state } = useApp();
  const recommended = products.slice(0, 4);
  const recentOrders = mockOrders.slice(0, 3);
  const unread = state.notifications.filter(n => !n.read).length;

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    packed: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-violet-100 text-violet-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <DashboardLayout role="consumer" title="My Dashboard">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 flex items-center justify-between overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full" />
        </div>
        <div className="relative">
          <h2 className="text-white text-xl font-bold mb-1">Welcome back, {state.user?.name.split(' ')[0]}!</h2>
          <p className="text-blue-200 text-sm">You have {unread} unread notifications and {state.cart.length} items in your cart.</p>
        </div>
        <img src={state.user?.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 hidden sm:block relative" />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders" value={mockOrders.length} change={12} icon={<ShoppingBag className="w-5 h-5" />} color="blue" />
        <StatCard label="Wishlist Items" value={state.wishlist.length} icon={<Heart className="w-5 h-5" />} color="orange" />
        <StatCard label="Cart Items" value={state.cart.reduce((s, i) => s + i.quantity, 0)} icon={<Package className="w-5 h-5" />} color="purple" />
        <StatCard label="Notifications" value={unread} icon={<Bell className="w-5 h-5" />} color="red" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Spending Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Spending Overview</h3>
              <p className="text-slate-500 text-sm">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" /> +18%
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData.slice(-6).map(d => ({ ...d, value: Math.round(d.value / 20) }))}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v: number) => [`$${v}`, 'Spent']} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="url(#spendGrad)" strokeWidth={2} dot={{ fill: '#3B82F6', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Recent Orders</h3>
            <Link to="/dashboard/orders" className="text-blue-600 text-xs font-semibold hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center gap-3">
                <img src={order.items[0].productImage} alt="" className="w-10 h-10 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{order.id}</p>
                  <p className="text-xs text-slate-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[order.status]}`}>{order.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-800">Recommended for You</h3>
            <p className="text-slate-500 text-sm">Based on your browsing history</p>
          </div>
          <Link to="/products" className="flex items-center gap-1 text-blue-600 text-xs font-semibold hover:underline">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {recommended.map(p => (
            <Link key={p.id} to={`/products/${p.id}`}
              className="group block bg-slate-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 overflow-hidden">
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <p className="text-slate-800 font-semibold text-xs line-clamp-2 mb-1">{p.name}</p>
                <StarRating rating={p.rating} size="sm" />
                <p className="text-blue-600 font-bold text-sm mt-1">${p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
