import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, MapPin, Clock, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
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

type StatusFilter = 'pending' | 'approved' | 'rejected';

export default function AdminApprovals() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<StatusFilter>('pending');
  const [pending, setPending] = useState<BusinessOwner[]>([]);
  const [approved, setApproved] = useState<BusinessOwner[]>([]);
  const [rejected, setRejected] = useState<BusinessOwner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchByStatus = (status: StatusFilter): Promise<BusinessOwner[]> =>
    fetch(`http://localhost:5000/api/admin/business-owners?status=${status}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => (data.success ? data.businessOwners : []));

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      fetchByStatus('pending'),
      fetchByStatus('approved'),
      fetchByStatus('rejected'),
    ])
      .then(([p, a, r]) => {
        setPending(p);
        setApproved(a);
        setRejected(r);
      })
      .catch(() => showToast('Could not load businesses', 'error', 'Error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
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
      loadAll();
    } catch {
      showToast('Unable to reach the server', 'error', 'Connection Error');
    }
  };

  const handleReject = async (id: number, company: string) => {
    console.log('[handleReject] called for id =', id, company);
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
      loadAll();
    } catch {
      showToast('Unable to reach the server', 'error', 'Connection Error');
    }
  };

  const handleDelete = async (id: number, company: string) => {
    console.log('[handleDelete] called for id =', id, company);
    if (!window.confirm(`Permanently remove "${company}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/business-owners/${id}`,
        { method: 'DELETE', credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Removal failed', 'error', 'Error');
        return;
      }
      showToast(`${company} removed`, 'success');
      loadAll();
    } catch {
      showToast('Unable to reach the server', 'error', 'Connection Error');
    }
  };

  const listForTab: Record<StatusFilter, BusinessOwner[]> = {
    pending,
    approved,
    rejected,
  };

  const filtered = listForTab[activeTab].filter(
    (b) => !search || b.company.toLowerCase().includes(search.toLowerCase())
  );

  const tabConfig: {
    key: StatusFilter;
    label: string;
    count: number;
    activeClasses: string;
    inactiveClasses: string;
  }[] = [
    {
      key: 'pending',
      label: 'Pending',
      count: pending.length,
      activeClasses: 'bg-amber-100 text-amber-700 ring-2 ring-amber-400',
      inactiveClasses: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    },
    {
      key: 'approved',
      label: 'Approved',
      count: approved.length,
      activeClasses: 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400',
      inactiveClasses: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    },
    {
      key: 'rejected',
      label: 'Rejected',
      count: rejected.length,
      activeClasses: 'bg-red-100 text-red-700 ring-2 ring-red-400',
      inactiveClasses: 'bg-red-50 text-red-600 hover:bg-red-100',
    },
  ];

  return (
    <DashboardLayout role="admin" title="Business Approvals">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search businesses..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
          />
        </div>
        <div className="flex gap-3 text-sm">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`font-semibold px-3 py-1.5 rounded-full transition-colors ${
                activeTab === tab.key ? tab.activeClasses : tab.inactiveClasses
              }`}
            >
              {tab.count} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading businesses...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((biz, i) => (
            <motion.div
              key={biz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${
                activeTab === 'pending'
                  ? 'border-amber-200'
                  : activeTab === 'approved'
                  ? 'border-emerald-200'
                  : 'border-red-200'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{biz.company}</h3>
                    <p className="text-xs text-slate-500">{biz.business_category}</p>
                  </div>
                  {activeTab === 'pending' && <Badge variant="warning">Pending Review</Badge>}
                  {activeTab === 'approved' && <Badge variant="success">Approved</Badge>}
                  {activeTab === 'rejected' && <Badge variant="error">Rejected</Badge>}
                </div>
                <p className="text-xs text-slate-500 mb-1">Owner: {biz.owner_name}</p>
                <p className="text-xs text-slate-500 mb-1">{biz.email} · {biz.phone}</p>
                {biz.pincode && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                    <MapPin className="w-3 h-3" /> {biz.pincode}
                  </div>
                )}

                {activeTab === 'pending' && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(biz.id, biz.company)}
                      className="flex items-center justify-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold text-xs py-2.5 rounded-xl transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(biz.id, biz.company)}
                      className="flex items-center justify-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs py-2.5 rounded-xl transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}

                {activeTab === 'approved' && (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold mt-3">
                    <CheckCircle className="w-4 h-4" /> Approved
                  </div>
                )}

                {activeTab === 'rejected' && (
                  <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold mt-3">
                    <XCircle className="w-4 h-4" /> Rejected
                  </div>
                )}

                <button
                  onClick={() => handleDelete(biz.id, biz.company)}
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs py-2.5 rounded-xl transition-colors mt-2"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-100">
              {activeTab === 'pending' ? (
                <>
                  <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold">No pending approvals!</p>
                  <p className="text-slate-400 text-sm">All businesses have been reviewed.</p>
                </>
              ) : (
                <>
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold">Nothing here yet</p>
                  <p className="text-slate-400 text-sm">No {activeTab} businesses found.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}