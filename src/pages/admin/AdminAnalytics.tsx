import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { revenueData, ordersData, userGrowthData, categoryDistribution } from '../../data/mockData';

export default function AdminAnalytics() {
  return (
    <DashboardLayout role="admin" title="Platform Analytics">
      <div className="grid lg:grid-cols-2 gap-6">
        {[
          { title: 'Revenue', subtitle: 'Platform revenue trend', data: revenueData, key: 'value', color: '#7C3AED', formatter: (v: number) => `$${(v/1000).toFixed(1)}K` },
          { title: 'Order Volume', subtitle: 'Monthly order count', data: ordersData, key: 'value', color: '#3B82F6', type: 'bar' },
        ].map(({ title, subtitle, data, key, color, type, formatter }) => (
          <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
            <p className="text-slate-500 text-sm mb-4">{subtitle}</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                {type === 'bar' ? (
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
                    <Bar dataKey={key} fill={color} radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id={`grad_${title}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => formatter ? formatter(v) : v} />
                    <Tooltip formatter={formatter ? (v: number) => [formatter(v)] : undefined} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
                    <Area type="monotone" dataKey={key} stroke={color} fill={`url(#grad_${title})`} strokeWidth={2} dot={false} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}

        {/* User Growth */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">User Growth</h3>
          <p className="text-slate-500 text-sm mb-4">Total users vs businesses monthly</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="value" name="Total Users" stroke="#7C3AED" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="value2" name="Business Owners" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Top Categories</h3>
          <p className="text-slate-500 text-sm mb-4">Revenue distribution by category</p>
          <div className="h-56 flex items-center gap-4">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie data={categoryDistribution} cx="50%" cy="50%" outerRadius={85} dataKey="value" paddingAngle={3}>
                  {categoryDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryDistribution.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-slate-600 flex-1">{d.name}</span>
                  <span className="text-xs font-bold text-slate-800">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
