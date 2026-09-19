//AdminDashboard.tsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Package, DollarSign, Star, Tag, ShoppingBag, TrendingUp, CheckCircle, XCircle, Shield, X, Mail, Phone, Calendar, Heart } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
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

interface AdminStats {
  totalBusinesses: number;
  pendingBusinesses: number;
  totalConsumers: number;
  totalAdmins: number;
  totalEmployees: number;
  totalOrders: number;
  totalRevenue: number;
  totalCategories: number;
  totalProducts: number;
}

interface TrendPoint {
  label: string;
  value: number;
  value2?: number;
}

type UserType = 'consumer' | 'business' | 'admin';

interface UserListItem {
  id: number;
  type: UserType;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  company: string | null;
  status: string | null;
}

interface ConsumerOrder {
  id: number;
  order_code: string;
  company: string;
  product: string;
  quantity: number;
  total: number;
  status: string;
  order_date: string;
}

interface ConsumerDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  totalOrders: number;
  totalSpent: number;
  orders: ConsumerOrder[];
  wishlist: { product_id: number; created_at: string }[];
  cart: { product_id: number; quantity: number; created_at: string }[];
}

interface BusinessDetail {
  id: number;
  business_id: string;
  company: string;
  business_category: string;
  pincode: string | null;
  status: string;
  created_at: string;
  owner_name: string;
  email: string;
  phone: string;
  orders: ConsumerOrder[];
  productCount: number;
}

interface AdminDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

const typeConfig: Record<UserType, { label: string; color: string; icon: React.ReactNode }> = {
  consumer: { label: 'Consumer', color: 'bg-blue-100 text-blue-700', icon: <Users className="w-3.5 h-3.5" /> },
  business: { label: 'Business', color: 'bg-emerald-100 text-emerald-700', icon: <Building2 className="w-3.5 h-3.5" /> },
  admin: { label: 'Admin', color: 'bg-violet-100 text-violet-700', icon: <Shield className="w-3.5 h-3.5" /> },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [pendingApprovals, setPendingApprovals] = useState<BusinessOwner[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [revenueData, setRevenueData] = useState<TrendPoint[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<TrendPoint[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Combined users table (shown inline, toggled by clicking the "Total Consumers" card)
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | UserType>('all');

  const [selected, setSelected] = useState<{ type: UserType; id: number } | null>(null);
  const [consumerDetail, setConsumerDetail] = useState<ConsumerDetail | null>(null);
  const [businessDetail, setBusinessDetail] = useState<BusinessDetail | null>(null);
  const [adminDetail, setAdminDetail] = useState<AdminDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const loadStats = () => {
    setStatsLoading(true);
    fetch('http://localhost:5000/api/admin/stats', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setRevenueData(data.revenueData || []);
          setUserGrowthData(data.userGrowthData || []);
        } else {
          showToast(data.message || 'Could not load platform stats', 'error', 'Error');
        }
      })
      .catch(() => showToast('Could not load platform stats', 'error', 'Error'))
      .finally(() => setStatsLoading(false));
  };

  const loadUsers = () => {
    setUsersLoading(true);
    fetch('http://localhost:5000/api/admin/users', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users);
          setUsersLoaded(true);
        } else {
          showToast(data.message || 'Could not load users', 'error', 'Error');
        }
      })
      .catch(() => showToast('Could not load users', 'error', 'Error'))
      .finally(() => setUsersLoading(false));
  };

useEffect(() => {
    loadPending();
    loadStats();
  }, []);

  // Sidebar's "Consumers" link points at /admin/consumers — landing here
  // should open the users table automatically, same as clicking the card.
  useEffect(() => {
    if (location.pathname === '/admin/consumers' && !showUsers) {
      setShowUsers(true);
      if (!usersLoaded) {
        loadUsers();
      }
    }
  }, [location.pathname]);

  const toggleUsers = () => {
    const next = !showUsers;
    setShowUsers(next);
    if (next && !usersLoaded) {
      loadUsers();
    }
  };

  const openUser = (type: UserType, id: number) => {
    setSelected({ type, id });
    setConsumerDetail(null);
    setBusinessDetail(null);
    setAdminDetail(null);
    setDetailLoading(true);

    fetch(`http://localhost:5000/api/admin/users/${type}/${id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          showToast(data.message || 'Could not load details', 'error', 'Error');
          setSelected(null);
          return;
        }
        if (type === 'consumer') setConsumerDetail(data.data);
        if (type === 'business') setBusinessDetail(data.data);
        if (type === 'admin') setAdminDetail(data.data);
      })
      .catch(() => {
        showToast('Could not load details', 'error', 'Error');
        setSelected(null);
      })
      .finally(() => setDetailLoading(false));
  };

  const closeModal = () => {
    setSelected(null);
    setConsumerDetail(null);
    setBusinessDetail(null);
    setAdminDetail(null);
  };

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
      loadStats();
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
      loadStats();
    } catch {
      showToast('Unable to reach the server', 'error', 'Connection Error');
    }
  };

  const formatRevenue = (value: number) => {
    if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
    return `₹${value}`;
  };

  const formatCount = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return String(value);
  };

  const filteredUsers = userFilter === 'all' ? users : users.filter((u) => u.type === userFilter);
  const userCounts = {
    all: users.length,
    consumer: users.filter((u) => u.type === 'consumer').length,
    business: users.filter((u) => u.type === 'business').length,
    admin: users.filter((u) => u.type === 'admin').length,
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
          <StatCard label="Total Businesses" value={statsLoading ? '—' : String(stats?.totalBusinesses ?? 0)} icon={<Building2 className="w-5 h-5" />} color="green" />
        </div>

        <div onClick={toggleUsers} className="cursor-pointer hover:scale-105 transition-transform">
          <StatCard label="Total Consumers" value={statsLoading ? '—' : formatCount(stats?.totalConsumers ?? 0)} icon={<Users className="w-5 h-5" />} color="blue" />
        </div>
        <div onClick={toggleUsers} className="cursor-pointer hover:scale-105 transition-transform">
          <StatCard label="Total Admins" value={statsLoading ? '—' : String(stats?.totalAdmins ?? 0)} icon={<Shield className="w-5 h-5" />} color="purple" />
        </div>
        <StatCard label="Products" value={statsLoading ? '—' : formatCount(stats?.totalProducts ?? 0)} icon={<Package className="w-5 h-5" />} color="orange" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Revenue" value={statsLoading ? '—' : formatRevenue(stats?.totalRevenue ?? 0)} icon={<DollarSign className="w-5 h-5" />} color="purple" />
        <StatCard label="Orders" value={statsLoading ? '—' : formatCount(stats?.totalOrders ?? 0)} icon={<ShoppingBag className="w-5 h-5" />} color="blue" />
        <StatCard label="Categories" value={statsLoading ? '—' : String(stats?.totalCategories ?? 0)} icon={<Tag className="w-5 h-5" />} color="teal" />
        <div onClick={() => navigate("/admin/approvals")} className="cursor-pointer hover:scale-105 transition-transform">
          <StatCard label="Pending Approvals" value={String(pendingCount)} icon={<Star className="w-5 h-5" />} color="orange" />
        </div>
      </div>

      {/* Users Table — shown inline when "Total Consumers"/"Total Admins" card is clicked */}
      {showUsers && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">All Users</h2>
              <p className="text-slate-500 text-sm">{users.length} total across consumers, businesses, and admins</p>
            </div>
            <button onClick={() => setShowUsers(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 pt-4 flex gap-2 flex-wrap">
            {(['all', 'consumer', 'business', 'admin'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setUserFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  userFilter === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'all' ? `All (${userCounts.all})` : `${tab}s (${userCounts[tab]})`}
              </button>
            ))}
          </div>

          {usersLoading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Loading users…</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">No users found.</div>
          ) : (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-6 py-3 font-semibold">Type</th>
                    <th className="text-left px-6 py-3 font-semibold">Name</th>
                    <th className="text-left px-6 py-3 font-semibold">Email</th>
                    <th className="text-left px-6 py-3 font-semibold">Phone</th>
                    <th className="text-left px-6 py-3 font-semibold">Company</th>
                    <th className="text-left px-6 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const conf = typeConfig[u.type];
                    return (
                      <tr
                        key={`${u.type}-${u.id}`}
                        onClick={() => openUser(u.type, u.id)}
                        className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${conf.color}`}>
                            {conf.icon} {conf.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{u.name}</td>
                        <td className="px-6 py-4 text-slate-600">{u.email}</td>
                        <td className="px-6 py-4 text-slate-600">{u.phone || '—'}</td>
                        <td className="px-6 py-4 text-slate-600">{u.company || '—'}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Platform Revenue</h3>
              <p className="text-slate-500 text-sm">Monthly platform revenue</p>
            </div>
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 text-sm font-semibold px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
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
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: number | undefined) => [`₹${((v ?? 0) / 1000).toFixed(1)}K`]} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
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

      {/* User Detail Modal */}
      {selected !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800 text-lg">{typeConfig[selected.type].label} Details</h3>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-10 text-center text-slate-400 text-sm">Loading details…</div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Consumer detail */}
                {selected.type === 'consumer' && consumerDetail && (
                  <>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3">{consumerDetail.name}</h4>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600"><Mail className="w-4 h-4 text-slate-400" /> {consumerDetail.email}</div>
                        <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4 text-slate-400" /> {consumerDetail.phone || '—'}</div>
                        <div className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4 text-slate-400" /> Joined {new Date(consumerDetail.created_at).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2 text-slate-600"><DollarSign className="w-4 h-4 text-slate-400" /> ₹{consumerDetail.totalSpent.toFixed(2)} total spent</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Orders ({consumerDetail.orders.length})</h4>
                      {consumerDetail.orders.length === 0 ? (
                        <p className="text-slate-400 text-sm">No orders placed.</p>
                      ) : (
                        <div className="space-y-2">
                          {consumerDetail.orders.map((o) => (
                            <div key={o.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 text-sm">
                              <div>
                                <p className="font-semibold text-slate-800">{o.order_code}</p>
                                <p className="text-slate-500 text-xs">{o.product} · Qty {o.quantity} · {o.company}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-slate-800">₹{Number(o.total).toFixed(2)}</p>
                                <Badge variant="default">{o.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Heart className="w-4 h-4" /> Wishlist ({consumerDetail.wishlist.length})</h4>
                      {consumerDetail.wishlist.length === 0 ? (
                        <p className="text-slate-400 text-sm">No wishlist items.</p>
                      ) : (
                        <p className="text-slate-600 text-sm">Product IDs: {consumerDetail.wishlist.map((w) => w.product_id).join(', ')}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> Current Cart ({consumerDetail.cart.length})</h4>
                      {consumerDetail.cart.length === 0 ? (
                        <p className="text-slate-400 text-sm">Cart is empty.</p>
                      ) : (
                        <div className="space-y-1 text-sm text-slate-600">
                          {consumerDetail.cart.map((item) => (
                            <p key={item.product_id}>Product #{item.product_id} × {item.quantity}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Business detail */}
                {selected.type === 'business' && businessDetail && (
                  <>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3">{businessDetail.company}</h4>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600"><Building2 className="w-4 h-4 text-slate-400" /> {businessDetail.business_category}</div>
                        <div className="flex items-center gap-2 text-slate-600"><Mail className="w-4 h-4 text-slate-400" /> {businessDetail.email}</div>
                        <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4 text-slate-400" /> {businessDetail.phone || '—'}</div>
                        <div className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4 text-slate-400" /> Joined {new Date(businessDetail.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <Badge variant={businessDetail.status === 'approved' ? 'success' : businessDetail.status === 'pending' ? 'warning' : 'error'}>{businessDetail.status}</Badge>
                        <span className="text-sm text-slate-500">Owner: {businessDetail.owner_name}</span>
                        <span className="text-sm text-slate-500">· {businessDetail.productCount} products</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Recent Orders ({businessDetail.orders.length})</h4>
                      {businessDetail.orders.length === 0 ? (
                        <p className="text-slate-400 text-sm">No orders yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {businessDetail.orders.map((o) => (
                            <div key={o.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 text-sm">
                              <div>
                                <p className="font-semibold text-slate-800">{o.order_code}</p>
                                <p className="text-slate-500 text-xs">{o.product} · Qty {o.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-slate-800">₹{Number(o.total).toFixed(2)}</p>
                                <Badge variant="default">{o.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Admin detail */}
                {selected.type === 'admin' && adminDetail && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-3">{adminDetail.name}</h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600"><Mail className="w-4 h-4 text-slate-400" /> {adminDetail.email}</div>
                      <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4 text-slate-400" /> {adminDetail.phone || '—'}</div>
                      <div className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4 text-slate-400" /> Joined {new Date(adminDetail.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}