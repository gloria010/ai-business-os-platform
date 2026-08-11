//BusinessDashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Package, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
// AI Insights still mock: no /api/ceo/ai-insights endpoint yet
import { aiInsights } from '../../data/mockData';

const API_BASE = 'http://localhost:5000';

const getImageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
};

const CATEGORY_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#14B8A6', '#EC4899', '#6366F1'];
interface SalesOrder {
  id: number;
  order_code: string;
  product: string;
  total: number;
  status: string;
  order_date: string;
  created_at: string;
}

interface CeoProduct {
  id: number;
  name: string;
  price: number;
  category?: string;
  images?: string[];
  image?: string;
  image_path?: string | null;
  [key: string]: any;
}

interface MonthlySalesRow {
  month: string; // 'YYYY-MM'
  sales: number;
}

export default function BusinessDashboard() {
  const location = useLocation();
  const company = location.state?.company;

  const [insights, setInsights] = useState({
    orders: { totalOrders: 0, currentMonthOrders: 0, previousMonthOrders: 0 },
    sales: { currentMonthSales: 0, previousMonthSales: 0, salesGrowth: 0 },
  });
  const [recentOrders, setRecentOrders] = useState<SalesOrder[]>([]);
  const [allOrders, setAllOrders] = useState<SalesOrder[]>([]);
  const [topProducts, setTopProducts] = useState<CeoProduct[]>([]);
  const [allProducts, setAllProducts] = useState<CeoProduct[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [insightsRes, ordersRes, productsRes, monthlySalesRes] = await Promise.all([
          fetch(`${API_BASE}/api/ceo/insights`, { credentials: 'include' }),
          fetch(`${API_BASE}/api/ceo/orders`, { credentials: 'include' }),
          fetch(`${API_BASE}/api/ceo/products`, { credentials: 'include' }),
fetch(`${API_BASE}/api/ceo/reports/monthly-sales`, { credentials: 'include' }),        ]);

        const insightsData = await insightsRes.json();
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        const monthlySalesData = await monthlySalesRes.json();

        if (insightsData.success) setInsights(insightsData.insights);
        if (ordersData.success) {
          setAllOrders(ordersData.orders);
          setRecentOrders(ordersData.orders.slice(0, 5));
        }
        if (productsData.success) {
          setAllProducts(productsData.products);
          setTopProducts(productsData.products.slice(0, 4));
        }
        if (monthlySalesData.success) setMonthlySales(monthlySalesData.monthlySales);
      } catch (error) {
        console.error('[BusinessDashboard] Failed to load CEO data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Real monthly orders count, derived from the actual order list (last 6 months)
  const ordersByMonth = useMemo(() => {
    const counts: Record<string, number> = {};
    allOrders.forEach((o) => {
      const d = new Date(o.order_date || o.created_at);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, value]) => ({
        label: new Date(`${month}-01`).toLocaleDateString('en-US', { month: 'short' }),
        value,
      }));
  }, [allOrders]);

  // Real revenue series from sales.js monthly-sales endpoint
  const revenueChartData = useMemo(
    () =>
      monthlySales.map((row) => ({
        label: new Date(`${row.month}-01`).toLocaleDateString('en-US', { month: 'short' }),
        value: row.sales,
      })),
    [monthlySales]
  );

  // Real category distribution derived from product list
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const total = allProducts.length || 1;
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count], i) => ({
        name,
        value: Math.round((count / total) * 100),
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }));
  }, [allProducts]);

  const stats = {
    revenue: insights.sales.currentMonthSales,
    orders: insights.orders.totalOrders,
    products: allProducts.length,
  };

  return (
    <DashboardLayout role="business" title={`${company?.name || 'Business'} CEO Dashboard`}>
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
          <div className="absolute -bottom-10 right-20 w-32 h-32 bg-white rounded-full" />
        </div>
        <div className="relative">
          <h2 className="text-white text-xl font-bold mb-1">Welcome to {company?.name || 'Your Business'}</h2>
          <p className="text-emerald-100 text-sm">Here's what's happening with your business today</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Revenue this month" value={`$${(stats.revenue / 1000).toFixed(1)}K`}
          change={Math.round(insights.sales.salesGrowth)} icon={<DollarSign className="w-5 h-5" />} color="green" />
        <StatCard label="Total Orders" value={stats.orders} icon={<ShoppingBag className="w-5 h-5" />} color="blue" />
        <StatCard label="Products" value={stats.products} icon={<Package className="w-5 h-5" />} color="orange" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Revenue Overview</h3>
              <p className="text-slate-500 text-sm">Monthly revenue</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
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

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Sales by Category</h3>
          <p className="text-slate-500 text-sm mb-4">Product mix this catalog</p>
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
            {categoryDistribution.length === 0 && !loading && (
              <span className="text-xs text-slate-400">No products yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Monthly Orders</h3>
          <p className="text-slate-500 text-sm mb-4">Orders trend, last 6 months</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByMonth}>
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
            {recentOrders.length === 0 && !loading && (
              <p className="text-sm text-slate-400">No recent orders.</p>
            )}
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{order.order_code}</p>
                  <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">${Number(order.total).toFixed(2)}</p>
                  <Badge variant={order.status === 'Delivered' ? 'success' : order.status === 'Cancelled' ? 'error' : 'info'} className="text-xs">
                    {order.status}
                  </Badge>
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
            {topProducts.length === 0 && !loading && (
              <p className="text-sm text-slate-400">No products found.</p>
            )}
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-slate-400 font-bold text-sm w-5 flex-shrink-0">#{i + 1}</span>
                <img
                  src={getImageUrl(p.images?.[0] || p.image || p.image_path)}
                  alt=""
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.category || 'Product'}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 flex-shrink-0">${Number(p.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights — still mock: no /api/ceo/ai-insights endpoint */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-800">AI Business Insights</h3>
            <p className="text-slate-500 text-sm">Sample data — no AI insights endpoint yet</p>
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
                  {insight.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
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