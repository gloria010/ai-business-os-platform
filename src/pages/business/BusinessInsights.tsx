import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Package, Users, ShoppingCart, Award, AlertTriangle, Zap } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { aiInsights } from '../../data/mockData';

const iconMap: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Package: <Package className="w-5 h-5" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  ShoppingCart: <ShoppingCart className="w-5 h-5" />,
};

export default function BusinessInsights() {
  return (
    <DashboardLayout role="business" title="AI Business Insights">
      <div className="mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Powered by AI Analytics</h2>
          <p className="text-emerald-100 text-sm">Real-time insights and predictions for your business</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {aiInsights.map((insight, i) => (
          <motion.div key={insight.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`bg-white rounded-2xl border p-5 hover:shadow-lg transition-shadow ${insight.trend === 'up' ? 'border-emerald-100' : 'border-red-100'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${insight.trend === 'up' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {iconMap[insight.icon] || <Zap className="w-5 h-5" />}
              </div>
              <div className={`flex items-center gap-1 text-sm font-black px-3 py-1 rounded-full ${insight.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {insight.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {insight.change > 0 ? '+' : ''}{insight.change}%
              </div>
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{insight.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{insight.description}</p>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{insight.category}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Recommendation */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 text-lg mb-5">AI Recommendations</h3>
        <div className="space-y-4">
          {[
            { title: 'Restock Wireless Headphones', desc: 'Based on current sales velocity, you will run out in 3 days. Consider ordering 200 units.', priority: 'high' },
            { title: 'Run a Flash Sale on Electronics', desc: 'Electronics engagement is 35% higher this week. A 15-20% discount could boost revenue significantly.', priority: 'medium' },
            { title: 'Expand Beauty Category', desc: 'Customer demand for beauty products is rising. Consider adding 10-15 new SKUs to capture the market.', priority: 'low' },
          ].map(rec => (
            <div key={rec.title} className={`flex items-start gap-4 p-4 rounded-xl border-l-4 ${rec.priority === 'high' ? 'border-red-500 bg-red-50' : rec.priority === 'medium' ? 'border-amber-500 bg-amber-50' : 'border-blue-500 bg-blue-50'}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-800 text-sm">{rec.title}</h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${rec.priority === 'high' ? 'bg-red-100 text-red-700' : rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{rec.priority}</span>
                </div>
                <p className="text-slate-600 text-sm">{rec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
