import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { mockOrders } from '../../data/mockData';
import { Order } from '../../types';

const statusColors: Record<Order['status'], 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning', processing: 'info', packed: 'info', shipped: 'default', delivered: 'success', cancelled: 'error',
};

export default function BusinessOrders() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const ITEMS = 8;

  const filtered = mockOrders.filter(o => !search || o.id.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paged = filtered.slice((page - 1) * ITEMS, page * ITEMS);

  return (
    <DashboardLayout role="business" title="Order Management">
      <div className="flex items-center justify-between mb-6">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search orders..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
        </div>
        <p className="text-slate-500 text-sm">{filtered.length} orders</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date', 'Actions'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map((order, i) => (
                <React.Fragment key={order.id}>
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800 text-sm">{order.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{order.address.name}</p>
                        <p className="text-slate-500 text-xs">{order.address.city}, {order.address.state}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-1">
                        {order.items.slice(0, 3).map(item => (
                          <img key={item.productId} src={item.productImage} alt="" className="w-8 h-8 rounded-lg object-cover border-2 border-white" />
                        ))}
                        {order.items.length > 3 && <div className="w-8 h-8 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">+{order.items.length - 3}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-black text-slate-900">${order.total}</td>
                    <td className="px-4 py-3"><Badge variant={statusColors[order.status]} className="capitalize">{order.status}</Badge></td>
                    <td className="px-4 py-3 text-slate-500 text-sm">{order.createdAt}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
                        {expandedId === order.id ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </td>
                  </motion.tr>
                  {expandedId === order.id && (
                    <tr>
                      <td colSpan={7} className="px-4 pb-4 bg-slate-50/50">
                        <div className="pt-3 space-y-2">
                          {order.items.map(item => (
                            <div key={item.productId} className="flex items-center gap-3 bg-white rounded-xl p-3">
                              <img src={item.productImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 text-sm truncate">{item.productName}</p>
                                <p className="text-slate-500 text-xs">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-bold text-slate-900 text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-slate-100 flex justify-end">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
