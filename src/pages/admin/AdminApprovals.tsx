import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Shield, MapPin, Star } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';
import { useToast } from '../../components/ui/Toast';
import { businesses } from '../../data/mockData';

export default function AdminApprovals() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [approved, setApproved] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);

  const pending = businesses.filter(b =>
    !approved.includes(b.id) && !rejected.includes(b.id) &&
    (!search || b.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout role="admin" title="Business Approvals">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search businesses..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
        </div>
        <div className="flex gap-3 text-sm">
          <span className="text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-full">{pending.length} Pending</span>
          <span className="text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full">{approved.length} Approved</span>
          <span className="text-red-600 font-semibold bg-red-50 px-3 py-1.5 rounded-full">{rejected.length} Rejected</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pending.map((biz, i) => (
          <motion.div key={biz.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm">
            <div className="relative h-32 overflow-hidden">
              <img src={biz.coverImage} alt={biz.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <Badge variant="warning" className="absolute top-3 right-3">Pending Review</Badge>
            </div>
            <div className="p-4">
              <div className="flex gap-3 mb-3">
                <img src={biz.logo} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{biz.name}</h3>
                  <p className="text-xs text-slate-500">{biz.category}</p>
                </div>
              </div>
              <p className="text-slate-500 text-xs line-clamp-2 mb-3">{biz.description}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                <MapPin className="w-3 h-3" /> {biz.location}
                <span className="ml-1 flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {biz.reviewCount} reviews</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setApproved(prev => [...prev, biz.id]); showToast(`${biz.name} approved!`, 'success'); }}
                  className="flex items-center justify-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold text-xs py-2.5 rounded-xl transition-colors">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => { setRejected(prev => [...prev, biz.id]); showToast(`${biz.name} rejected`, 'error'); }}
                  className="flex items-center justify-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs py-2.5 rounded-xl transition-colors">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {pending.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-100">
            <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No pending approvals!</p>
            <p className="text-slate-400 text-sm">All businesses have been reviewed.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
