import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, ShieldCheck, Zap } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApp } from '../../contexts/AppContext';

const API_BASE = 'http://localhost:5000';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  salary: string;
  status: string;
  created_at: string;
}

const defaultInsights = {
  employees: { total: 0, active: 0 },
  hr: { pendingCandidates: 0, acceptedCandidates: 0, recentApplications: [], recentEmployees: [] },
  orders: { totalOrders: 0, currentMonthOrders: 0, previousMonthOrders: 0 },
  sales: { currentMonthSales: 0, previousMonthSales: 0, salesGrowth: 0 },
};

export default function BusinessEmployee() {
  const { state } = useApp();
  const businessId = state.user?.businessId || state.user?.company;
  const [insights, setInsights] = useState(defaultInsights);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    if (!businessId) {
      console.warn('[BusinessInsights] no businessId on state.user, skipping employees fetch');
      setLoading(false);
      return;
    }

    const loadInsights = async () => {
      try {
        console.log('[BusinessInsights] fetching /api/ceo/insights and /api/hr/' + businessId + '/employees...');

        const [insightsRes, employeesRes] = await Promise.all([
          fetch(`${API_BASE}/api/ceo/insights`, { credentials: 'include' }),
          fetch(`${API_BASE}/api/hr/${businessId}/employees`, { credentials: 'include' }),
        ]);

        console.log('[BusinessInsights] /insights status:', insightsRes.status);
        console.log('[BusinessInsights] /employees status:', employeesRes.status);

        const insightsData = await insightsRes.json();
        const employeesData = await employeesRes.json();

        console.log('[BusinessInsights] insightsData:', insightsData);
        console.log('[BusinessInsights] employeesData:', employeesData);

        if (insightsData.success) {
          setInsights(insightsData.insights);
        } else {
          console.warn('[BusinessInsights] insights fetch returned success:false ->', insightsData.message);
        }

        if (employeesData.success) {
          setEmployees(employeesData.employees);
          console.log('[BusinessInsights] employees set, count:', employeesData.employees?.length);
        } else {
          console.warn('[BusinessInsights] employees fetch returned success:false ->', employeesData.message);
        }
      } catch (error) {
        console.error('[BusinessInsights] Failed to load CEO insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [businessId]);


  const overviewCards = [
    {
      title: 'Employees',
      value: `${insights.employees.active}/${insights.employees.total}`,
      description: 'Active team members on record',
      icon: Users,
      accent: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'HR Alerts',
      value: `${insights.hr.pendingCandidates}`,
      description: 'Pending hiring updates',
      icon: ShieldCheck,
      accent: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <DashboardLayout role="business" title="Employee Overview">
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Employee and HR Overview</h2>
            <p className="text-sm text-emerald-100">A read-only snapshot of staff, hiring, and team activity.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-500">{card.title}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="mt-1 text-sm text-slate-500">{card.description}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">HR and employee updates</h3>
              <p className="text-sm text-slate-500">A live read-only summary of people and hiring activity.</p>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              {insights.hr.pendingCandidates} pending
            </div>
          </div>

          <div className="space-y-3">
            {insights.hr.recentApplications.slice(0, 4).map((item: any) => (
              <div key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="mt-1 rounded-lg bg-white p-2 text-emerald-600">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{item.name || 'Application update'}</p>
                  <p className="text-sm text-slate-500">{item.position || 'Pending review'} • {item.status}</p>
                </div>
              </div>
            ))}
            {insights.hr.recentEmployees.slice(0, 2).map((item: any) => (
              <div key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="mt-1 rounded-lg bg-white p-2 text-blue-600">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.department || 'Team member'} • {item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

</div>

      <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Company employees</h3>
            <p className="text-sm text-slate-500">Full read-only roster for this company.</p>
          </div>
          <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            {employees.length} total
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-100">
              <tr>
                {['Name', 'Email', 'Department', 'Designation', 'Status'].map((col) => (
                  <th key={col} className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="px-3 py-2 font-semibold text-slate-800 text-sm">{emp.name}</td>
                  <td className="px-3 py-2 text-slate-500 text-sm">{emp.email}</td>
                  <td className="px-3 py-2 text-slate-500 text-sm">{emp.department}</td>
                  <td className="px-3 py-2 text-slate-500 text-sm">{emp.designation}</td>
                  <td className="px-3 py-2 text-sm">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        emp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="mt-6 text-sm text-slate-500">Loading insights from the CEO backend…</div>
      )}
    </DashboardLayout>
  );
}
