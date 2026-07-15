import React from 'react';
import { useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, TrendingDown, ArrowRight, Eye } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { aiInsights, revenueData, ordersData, categoryDistribution, products, mockOrders } from '../../data/mockData';

export default function BusinessDashboard() {
  const stats = { revenue: 98000, orders: 980, customers: 5800, products: 215 };
const location = useLocation();

const company = location.state?.company;
  return (
<DashboardLayout
  role="business"
  title={`${company?.name || "Business"} CEO Dashboard`}
>      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
          <div className="absolute -bottom-10 right-20 w-32 h-32 bg-white rounded-full" />
        </div>
        <div className="relative">
          <h2 className="text-white text-xl font-bold mb-1">Welcome to {company?.name || "Your Business"}</h2>
          <p className="text-emerald-100 text-sm">Here's what's happening with your business today</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`$${(stats.revenue / 1000).toFixed(0)}K`} change={18} icon={<DollarSign className="w-5 h-5" />} color="green" />
        <StatCard label="Total Orders" value={stats.orders} change={12} icon={<ShoppingBag className="w-5 h-5" />} color="blue" />
        <StatCard label="Customers" value={`${(stats.customers / 1000).toFixed(1)}K`} change={24} icon={<Users className="w-5 h-5" />} color="purple" />
        <StatCard label="Products" value={stats.products} change={5} icon={<Package className="w-5 h-5" />} color="orange" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Revenue Overview</h3>
              <p className="text-slate-500 text-sm">Monthly revenue for 2024</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold bg-emerald-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" /> +18% YoY
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="bizRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip formatter={(v: number) => [`$${(v / 1000).toFixed(1)}K`, 'Revenue']} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#10B981" fill="url(#bizRevGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Sales by Category</h3>
          <p className="text-slate-500 text-sm mb-4">Distribution this month</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {categoryDistribution.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-slate-600 truncate">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Orders Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Monthly Orders</h3>
          <p className="text-slate-500 text-sm mb-4">Orders trend this year</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Recent Orders</h3>
            <Link to="/business/orders" className="text-blue-600 text-xs font-semibold hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {mockOrders.map(order => (
              <div key={order.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{order.id}</p>
                  <p className="text-xs text-slate-500">{order.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">${order.total}</p>
                  <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'info'} className="text-xs capitalize">{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Top Products</h3>
            <Link to="/business/products" className="text-blue-600 text-xs font-semibold hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {products.slice(0, 4).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-slate-400 font-bold text-sm w-5 flex-shrink-0">#{i + 1}</span>
                <img src={p.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.reviewCount} sales</p>
                </div>
                <p className="text-sm font-bold text-slate-900 flex-shrink-0">${p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-800">AI Business Insights</h3>
            <p className="text-slate-500 text-sm">Powered by AI analytics engine</p>
          </div>
          <Link to="/business/insights" className="flex items-center gap-1 text-blue-600 text-xs font-semibold hover:underline">
            All Insights <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiInsights.map((insight, i) => (
            <motion.div key={insight.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`p-4 rounded-xl border ${insight.trend === 'up' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${insight.trend === 'up' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {insight.trend === 'up' ? <TrendingUp className={`w-4 h-4 text-emerald-600`} /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                </div>
                <span className={`text-sm font-black ${insight.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {insight.change > 0 ? '+' : ''}{insight.change}%
                </span>
              </div>
              <p className="font-bold text-slate-800 text-sm">{insight.title}</p>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{insight.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
