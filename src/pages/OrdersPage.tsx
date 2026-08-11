import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Badge from '../components/ui/Badge';

interface RealOrder {
  id: number;
  order_code: string;
  company: string;
  product: string;
  quantity: number;
  price: number;
  gst: number;
  total: number;
  payment_method: string | null;
  payment_status: string;
  transaction_id: string;
  status: string;
  order_date: string;
  delivery_date: string | null;
  address: string | null;
}

type StatusKey = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

const statusConfig: Record<string, { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error'; icon: React.ReactNode }> = {
  Pending: { label: 'Pending', color: 'warning', icon: <Clock className="w-3.5 h-3.5" /> },
  pending: { label: 'Pending', color: 'warning', icon: <Clock className="w-3.5 h-3.5" /> },
  Processing: { label: 'Processing', color: 'info', icon: <Package className="w-3.5 h-3.5" /> },
  processing: { label: 'Processing', color: 'info', icon: <Package className="w-3.5 h-3.5" /> },
  Packed: { label: 'Packed', color: 'info', icon: <Package className="w-3.5 h-3.5" /> },
  packed: { label: 'Packed', color: 'info', icon: <Package className="w-3.5 h-3.5" /> },
  Shipped: { label: 'Shipped', color: 'default', icon: <Truck className="w-3.5 h-3.5" /> },
  shipped: { label: 'Shipped', color: 'default', icon: <Truck className="w-3.5 h-3.5" /> },
  Delivered: { label: 'Delivered', color: 'success', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  delivered: { label: 'Delivered', color: 'success', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  Cancelled: { label: 'Cancelled', color: 'error', icon: <XCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'error', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const steps: StatusKey[] = ['pending', 'processing', 'packed', 'shipped', 'delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<RealOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await fetch('/api/user/my-orders', { credentials: 'include' });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to load orders.');
        if (!cancelled) {
          setOrders(json.orders);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load orders.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === activeTab);

  if (loading) {
    return (
      <DashboardLayout role="consumer" title="My Orders">
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading your orders…</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="consumer" title="My Orders">
        <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="consumer" title="My Orders">
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'processing', 'shipped', 'delivered'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab === 'all' ? `All Orders (${orders.length})` : tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((order, i) => {
          const statusKey = order.status.toLowerCase();
          const conf = statusConfig[order.status] || statusConfig[statusKey] || statusConfig.pending;
          const expanded = expandedId === order.id;
          const stepIdx = steps.indexOf(statusKey as StatusKey);

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
            >
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{order.order_code}</span>
                      <Badge variant={conf.color} className="flex items-center gap-1">
                        {conf.icon}
                        {conf.label}
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {order.product} · Qty {order.quantity} · {new Date(order.order_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-slate-900 text-lg">₹{Number(order.total).toFixed(2)}</p>
                  <p className="text-slate-500 text-xs">{order.payment_method || '—'}</p>
                </div>
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 flex-shrink-0"
                >
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-slate-100"
                >
                  {statusKey !== 'cancelled' && stepIdx !== -1 && (
                    <div className="px-5 py-4 bg-slate-50">
                      <div className="flex items-center gap-1">
                        {steps.map((s, si) => (
                          <React.Fragment key={s}>
                            <div className={`flex flex-col items-center ${si <= stepIdx ? 'text-blue-600' : 'text-slate-300'}`}>
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  si < stepIdx
                                    ? 'bg-blue-600 text-white'
                                    : si === stepIdx
                                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                                    : 'bg-slate-200 text-slate-400'
                                }`}
                              >
                                {si < stepIdx ? '✓' : si + 1}
                              </div>
                              <span className="text-xs mt-1 capitalize hidden sm:block">{s}</span>
                            </div>
                            {si < steps.length - 1 && (
                              <div className={`flex-1 h-0.5 ${si < stepIdx ? 'bg-blue-600' : 'bg-slate-200'}`} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{order.product}</p>
                        <p className="text-slate-500 text-xs">{order.company} · Qty: {order.quantity}</p>
                      </div>
                      <p className="font-bold text-slate-900">₹{(Number(order.price) * order.quantity).toFixed(2)}</p>
                    </div>
                    {Number(order.gst) > 0 && (
                      <p className="text-xs text-slate-500 text-right">+ ₹{Number(order.gst).toFixed(2)} GST</p>
                    )}
                  </div>

                  <div className="px-5 pb-5 grid sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-500 mb-1">DELIVERY ADDRESS</p>
                      <p className="text-sm text-slate-600">{order.address || 'No address on file'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-500 mb-1">DELIVERY DATE</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not scheduled yet'}
                      </p>
                      <p className="text-sm text-slate-600">Payment: {order.payment_status}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No orders found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}