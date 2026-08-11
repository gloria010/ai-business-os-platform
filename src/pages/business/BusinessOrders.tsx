import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, ChevronUp, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';

interface SalesOrder {
  id: number;
  order_code: string;
  customer_name: string;
  email: string;
  phone: string;
  product: string;
  quantity: number;
  price: number;
  gst: number;
  total: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  status: string;
  order_date: string;
  delivery_date: string | null;
  address: string;
  created_at: string;
}

const statusColors: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  Pending: 'warning',
  Processing: 'info',
  Shipped: 'default',
  Delivered: 'success',
  Cancelled: 'error',
};

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function BusinessOrders() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const ITEMS = 8;

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/sales/orders', { credentials: 'include' });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to load orders');
        if (!cancelled) {
          setOrders(data.orders);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = orders.filter(
    (o) =>
      !search ||
      o.order_code?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paged = filtered.slice((page - 1) * ITEMS, page * ITEMS);

  const updateStatus = async (orderId: number, status: string) => {
    const prevOrders = orders;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

    try {
      const res = await fetch(`/api/sales/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update status');
    } catch (err: any) {
      setOrders(prevOrders); // revert on failure
      alert(err.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="business" title="Order Management">
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading orders...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="business" title="Order Management">
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="business" title="Order Management">
      <div className="flex items-center justify-between mb-6">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search orders..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
        <p className="text-slate-500 text-sm">{filtered.length} orders</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Order ID', 'Customer', 'Product', 'Amount', 'Status', 'Date', 'Actions'].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map((order, i) => (
                <React.Fragment key={order.id}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-800 text-sm">{order.order_code}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{order.customer_name}</p>
                        <p className="text-slate-500 text-xs truncate max-w-[180px]">{order.address}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{order.product}</p>
                        <p className="text-slate-500 text-xs">Qty: {order.quantity}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-black text-slate-900">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[order.status] || 'default'}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm">
                      {order.order_date ? new Date(order.order_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
                      >
                        {expandedId === order.id ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </td>
                  </motion.tr>
                  {expandedId === order.id && (
                    <tr>
                      <td colSpan={7} className="px-4 pb-4 bg-slate-50/50">
                        <div className="pt-3 grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-slate-400 text-xs mb-1">Email</p>
                            <p className="font-semibold text-slate-800">{order.email}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-slate-400 text-xs mb-1">Phone</p>
                            <p className="font-semibold text-slate-800">{order.phone}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-slate-400 text-xs mb-1">Payment</p>
                            <p className="font-semibold text-slate-800">
                              {order.payment_method} · {order.payment_status}
                            </p>
                          </div>
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-slate-400 text-xs mb-1">GST</p>
                            <p className="font-semibold text-slate-800">${order.gst.toFixed(2)}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 col-span-2">
                            <p className="text-slate-400 text-xs mb-2">Update Status</p>
                            <div className="flex gap-2 flex-wrap">
                              {STATUS_OPTIONS.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(order.id, s)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                                    order.status === s
                                      ? 'bg-emerald-500 text-white border-emerald-500'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
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