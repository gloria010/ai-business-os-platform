import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Package, DollarSign, Star, Tag, ShoppingBag, Activity, TrendingUp, CheckCircle, XCircle, Shield } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { revenueData, userGrowthData } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

interface BusinessOwner {
  id: number;
  business_id: string;
  company: string;
  business_category: string;
  pincode: string | null;
  status: string;
  owner_name: string;
  email: string;
  phone: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pendingApprovals, setPendingApprovals] = useState<BusinessOwner[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const loadPending = () => {
    fetch('http://localhost:5000/api/admin/business-owners?status=pending', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPendingCount(data.businessOwners.length);
          setPendingApprovals(data.businessOwners.slice(0, 3));
        }
      })
      .catch(() => showToast('Could not load pending businesses', 'error', 'Error'));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: number, company: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/business-owners/${id}/approve`,
        { method: 'PATCH', credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Approval failed', 'error', 'Error');
        return;
      }
      showToast(`${company} approved!`, 'success');
      loadPending();
    } catch {
      showToast('Unable to reach the server', 'error', 'Connection Error');
    }
  };

  const handleReject = async (id: number, company: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/business-owners/${id}/reject`,
        { method: 'PATCH', credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Rejection failed', 'error', 'Error');
        return;
      }
      showToast(`${company} rejected`, 'error');
      loadPending();
    } catch {
      showToast('Unable to reach the server', 'error', 'Connection Error');
    }
  };

  return (
    <DashboardLayout role="admin" title="Admin Dashboard">
      {/* Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
        </div>
        <div className="relative">
          <h2 className="text-white text-xl font-bold mb-1">Platform Administration</h2>
          <p className="text-violet-200 text-sm">Full control and visibility across all platform operations</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div onClick={() => navigate("/businesses")} className="cursor-pointer hover:scale-105 transition-transform">
          <StatCard label="Total Businesses" value="5" change={12} icon={<Building2 className="w-5 h-5" />} color="green" />
        </div>

        <StatCard label="Total Consumers" value="2,486" change={18} icon={<Users className="w-5 h-5" />} color="blue"/>
        <StatCard label="Total Admins" value="2" change={0} icon={<Shield className="w-5 h-5" />} color="purple"/>
        <StatCard label="Products" value="850K" change={15} icon={<Package className="w-5 h-5" />} color="orange" />
        <StatCard label="Revenue" value="$2.4M" change={18} icon={<DollarSign className="w-5 h-5" />} color="purple" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Orders" value="340K" change={12} icon={<ShoppingBag className="w-5 h-5" />} color="blue" />
        <StatCard label="Categories" value="10" icon={<Tag className="w-5 h-5" />} color="teal" />
        <div onClick={() => navigate("/admin/approvals")} className="cursor-pointer hover:scale-105 transition-transform">
          <StatCard label="Pending Approvals" value={String(pendingCount)} icon={<Star className="w-5 h-5" />} color="orange" />
        </div>
        <StatCard label="Platform Health" value="99.9%" icon={<Activity className="w-5 h-5" />} color="green" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Platform Revenue</h3>
              <p className="text-slate-500 text-sm">Monthly platform revenue</p>
            </div>
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 text-sm font-semibold px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" /> +18%
            </span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                <Tooltip formatter={(v: number | undefined) => [`$${((v ?? 0)/1000).toFixed(1)}K`]} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="value" stroke="#7C3AED" fill="url(#adminRevGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">User Growth</h3>
          <p className="text-slate-500 text-sm mb-4">Monthly registrations</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="value" name="Users" stroke="#7C3AED" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="value2" name="Businesses" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-800">Pending Business Approvals</h3>
            <p className="text-slate-500 text-sm">{pendingCount} businesses awaiting review</p>
          </div>
          <Link to="/admin/approvals" className="text-blue-600 text-sm font-semibold hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {pendingApprovals.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-8">No pending approvals right now.</p>
          )}
          {pendingApprovals.map((biz, i) => (
            <motion.div key={biz.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 font-bold text-violet-600">
                {biz.company.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{biz.company}</p>
                <p className="text-slate-500 text-sm">{biz.business_category}{biz.pincode ? ` · ${biz.pincode}` : ''}</p>
              </div>
              <Badge variant="warning">Pending</Badge>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(biz.id, biz.company)}
                  className="flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-3 h-3" /> Approve
                </button>
                <button
                  onClick={() => handleReject(biz.id, biz.company)}
                  className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <XCircle className="w-3 h-3" /> Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}