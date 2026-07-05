import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { revenueData, ordersData, userGrowthData, categoryDistribution } from '../../data/mockData';

export default function BusinessAnalytics() {
  return (
    <DashboardLayout role="business" title="Analytics">
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Revenue Trend</h3>
          <p className="text-slate-500 text-sm mb-4">Monthly revenue vs previous year</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="aRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aRevPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B7280" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                <Tooltip formatter={(v: number) => [`$${(v/1000).toFixed(1)}K`]} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="value2" name="Last Year" stroke="#94a3b8" fill="url(#aRevPrev)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                <Area type="monotone" dataKey="value" name="This Year" stroke="#10B981" fill="url(#aRev)" strokeWidth={2} dot={false} />
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
          <p className="text-slate-500 text-sm mb-4">Revenue by category</p>
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
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
