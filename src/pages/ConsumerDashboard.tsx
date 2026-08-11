//ConsumerDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Bell, TrendingUp, Package, Star, ArrowRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StatCard } from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import { useApp } from '../contexts/AppContext';

interface DashboardOrder {
  id: number;
  order_code: string;
  product: string;
  quantity: number;
  price: number;
  gst: number;
  total: number;
  status: string;
  payment_status: string;
  order_date: string;
  delivery_date: string | null;
}

interface DashboardProduct {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
}

interface DashboardData {
  stats: {
    totalOrders: number;
    cartItems: number;
    wishlistItems: number;
    unreadNotifications: number;
  };
  recentOrders: DashboardOrder[];
  spendingOverview: { month: string; label: string; value: number }[];
  recommendedProducts: DashboardProduct[];
}

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  pending: 'bg-amber-100 text-amber-700',
  Processing: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  Packed: 'bg-indigo-100 text-indigo-700',
  packed: 'bg-indigo-100 text-indigo-700',
  Shipped: 'bg-violet-100 text-violet-700',
  shipped: 'bg-violet-100 text-violet-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function ConsumerDashboard() {
  const { state } = useApp();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch('/api/user/dashboard', { credentials: 'include' });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to load dashboard.');
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="consumer" title="My Dashboard">
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
          Loading your dashboard…
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout role="consumer" title="My Dashboard">
        <div className="flex items-center justify-center h-64 text-red-500 text-sm">
          {error || 'Something went wrong loading your dashboard.'}
        </div>
      </DashboardLayout>
    );
  }

  const { stats, recentOrders, spendingOverview, recommendedProducts } = data;

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
          <p className="text-blue-200 text-sm">
            You have {stats.unreadNotifications} unread notifications and {stats.cartItems} items in your cart.
          </p>
        </div>
        <img src={state.user?.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 hidden sm:block relative" />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders" value={stats.totalOrders} icon={<ShoppingBag className="w-5 h-5" />} color="blue" />
        <StatCard label="Wishlist Items" value={stats.wishlistItems} icon={<Heart className="w-5 h-5" />} color="orange" />
        <StatCard label="Cart Items" value={stats.cartItems} icon={<Package className="w-5 h-5" />} color="purple" />
        <StatCard label="Notifications" value={stats.unreadNotifications} icon={<Bell className="w-5 h-5" />} color="red" />
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
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingOverview}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: number) => [`₹${v}`, 'Spent']} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
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
            {recentOrders.length === 0 && (
              <p className="text-sm text-slate-400">No orders yet.</p>
            )}
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{order.order_code}</p>
                  <p className="text-xs text-slate-500 truncate">{order.product} × {order.quantity}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                  {order.status}
                </span>
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
            <p className="text-slate-500 text-sm">Top rated picks</p>
          </div>
          <Link to="/products" className="flex items-center gap-1 text-blue-600 text-xs font-semibold hover:underline">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedProducts.length === 0 && (
            <p className="text-sm text-slate-400 col-span-full">No recommendations available yet.</p>
          )}
          {recommendedProducts.map(p => (
            <Link key={p.id} to={`/products/${p.id}`}
              className="group block bg-slate-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 overflow-hidden bg-slate-200">
                {p.image && (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
              </div>
              <div className="p-3">
                <p className="text-slate-800 font-semibold text-xs line-clamp-2 mb-1">{p.name}</p>
                <StarRating rating={p.rating} size="sm" />
                <p className="text-blue-600 font-bold text-sm mt-1">₹{p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}