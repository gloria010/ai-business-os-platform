import React, { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';

const API_BASE = 'http://localhost:5000';
const CATEGORY_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#14B8A6', '#EC4899', '#6366F1'];

interface SalesOrder {
  id: number;
  order_code: string;
  email: string;
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
  [key: string]: any;
}

interface MonthlySalesRow {
  month: string; // 'YYYY-MM'
  sales: number;
}

export default function BusinessAnalytics() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [products, setProducts] = useState<CeoProduct[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [ordersRes, productsRes, monthlySalesRes] = await Promise.all([
          fetch(`${API_BASE}/api/ceo/orders`, { credentials: 'include' }),
          fetch(`${API_BASE}/api/ceo/products`, { credentials: 'include' }),
          fetch(`${API_BASE}/api/ceo/reports/monthly-sales`, { credentials: 'include' }),
        ]);

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        const monthlySalesData = await monthlySalesRes.json();

        if (ordersData.success) setOrders(ordersData.orders);
        if (productsData.success) setProducts(productsData.products);
        if (monthlySalesData.success) setMonthlySales(monthlySalesData.monthlySales);
      } catch (error) {
        console.error('[BusinessAnalytics] Failed to load CEO data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // Revenue Trend: from monthly-sales endpoint
  const revenueData = useMemo(
    () =>
      monthlySales.map((row) => ({
        label: new Date(`${row.month}-01`).toLocaleDateString('en-US', { month: 'short' }),
        value: row.sales,
      })),
    [monthlySales]
  );

  // Order Volume: orders grouped by month, last 6 months
  const ordersData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
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
  }, [orders]);

  // Customer Growth: new vs returning customers per month, based on email history
  const userGrowthData = useMemo(() => {
    const sorted = [...orders]
      .filter((o) => o.email)
      .sort((a, b) => new Date(a.order_date || a.created_at).getTime() - new Date(b.order_date || b.created_at).getTime());

    const firstSeenMonth: Record<string, string> = {};
    const monthlyNew: Record<string, Set<string>> = {};
    const monthlyReturning: Record<string, Set<string>> = {};

    sorted.forEach((o) => {
      const d = new Date(o.order_date || o.created_at);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      if (!firstSeenMonth[o.email]) {
        firstSeenMonth[o.email] = key;
        if (!monthlyNew[key]) monthlyNew[key] = new Set();
        monthlyNew[key].add(o.email);
      } else {
        if (!monthlyReturning[key]) monthlyReturning[key] = new Set();
        monthlyReturning[key].add(o.email);
      }
    });

    const now = new Date();
    const result: { label: string; value: number; value2: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const newCount = monthlyNew[key]?.size || 0;
      const returningCount = monthlyReturning[key]?.size || 0;
      result.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        value: newCount + returningCount, // Total
        value2: newCount, // New
      });
    }
    return result;
  }, [orders]);

  // Sales Distribution: products grouped by category
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const total = products.length || 1;
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count], i) => ({
        name,
        value: Math.round((count / total) * 100),
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }));
  }, [products]);

  return (
    <DashboardLayout role="business" title="Analytics">
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Revenue Trend</h3>
          <p className="text-slate-500 text-sm mb-4">Monthly revenue, last 6 months</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="aRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                <Tooltip formatter={(v: number) => [`$${(v/1000).toFixed(1)}K`]} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="value" name="Revenue" stroke="#10B981" fill="url(#aRev)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Order Volume</h3>
          <p className="text-slate-500 text-sm mb-4">Monthly orders count</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Customer Growth</h3>
          <p className="text-slate-500 text-sm mb-4">New vs returning customers</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="value" name="Total" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="value2" name="New" stroke="#3B82F6" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Sales Distribution</h3>
          <p className="text-slate-500 text-sm mb-4">Product mix by category</p>
          <div className="h-56 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryDistribution} cx="40%" cy="50%" outerRadius={90} dataKey="value" paddingAngle={2}>
                  {categoryDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-shrink-0">
              {categoryDistribution.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-slate-600">{d.name}</span>
                  <span className="text-xs font-bold text-slate-800 ml-auto">{d.value}%</span>
                </div>
              ))}
              {categoryDistribution.length === 0 && !loading && (
                <span className="text-xs text-slate-400">No products yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}