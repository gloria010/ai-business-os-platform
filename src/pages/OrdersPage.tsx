import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Badge from '../components/ui/Badge';
import { mockOrders } from '../data/mockData';
import { Order } from '../types';

const statusConfig: Record<Order['status'], { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error'; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'warning', icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { label: 'Processing', color: 'info', icon: <Package className="w-3.5 h-3.5" /> },
  packed: { label: 'Packed', color: 'info', icon: <Package className="w-3.5 h-3.5" /> },
  shipped: { label: 'Shipped', color: 'default', icon: <Truck className="w-3.5 h-3.5" /> },
  delivered: { label: 'Delivered', color: 'success', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'error', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const steps = ['pending', 'processing', 'packed', 'shipped', 'delivered'];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'all' | Order['status']>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeTab === 'all' ? mockOrders : mockOrders.filter(o => o.status === activeTab);

  return (
    <DashboardLayout role="consumer" title="My Orders">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'processing', 'shipped', 'delivered'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {tab === 'all' ? `All Orders (${mockOrders.length})` : tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.map((order, i) => {
          const conf = statusConfig[order.status];
          const expanded = expandedId === order.id;
          const stepIdx = steps.indexOf(order.status);

          return (
            <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map(item => (
                      <img key={item.productId} src={item.productImage} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-white" />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{order.id}</span>
                      <Badge variant={conf.color} className="flex items-center gap-1">{conf.icon}{conf.label}</Badge>
                    </div>
                    <p className="text-slate-500 text-sm mt-0.5">{order.items.length} item{order.items.length > 1 ? 's' : ''} · {order.createdAt}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-slate-900 text-lg">${order.total.toFixed(2)}</p>
                  <p className="text-slate-500 text-xs">{order.paymentMethod}</p>
                </div>
                <button onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 flex-shrink-0">
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded Content */}
              {expanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-slate-100">
                  {/* Timeline */}
                  {order.status !== 'cancelled' && (
                    <div className="px-5 py-4 bg-slate-50">
                      <div className="flex items-center gap-1">
                        {steps.map((s, si) => (
                          <React.Fragment key={s}>
                            <div className={`flex flex-col items-center ${si <= stepIdx ? 'text-blue-600' : 'text-slate-300'}`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${si < stepIdx ? 'bg-blue-600 text-white' : si === stepIdx ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-400'}`}>
                                {si < stepIdx ? '✓' : si + 1}
                              </div>
                              <span className="text-xs mt-1 capitalize hidden sm:block">{s}</span>
                            </div>
                            {si < steps.length - 1 && <div className={`flex-1 h-0.5 ${si < stepIdx ? 'bg-blue-600' : 'bg-slate-200'}`} />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="p-5 space-y-3">
                    {order.items.map(item => (
                      <div key={item.productId} className="flex items-center gap-3">
                        <img src={item.productImage} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{item.productName}</p>
                          <p className="text-slate-500 text-xs">{item.businessName} · Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  <div className="px-5 pb-5 grid sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-500 mb-1">DELIVERY ADDRESS</p>
                      <p className="text-sm font-semibold text-slate-800">{order.address.name}</p>
                      <p className="text-sm text-slate-600">{order.address.line1}, {order.address.city}, {order.address.state}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-500 mb-1">DELIVERY ESTIMATE</p>
                      <p className="text-sm font-semibold text-slate-800">{order.estimatedDelivery}</p>
                      <p className="text-sm text-slate-600">{order.paymentMethod}</p>
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
