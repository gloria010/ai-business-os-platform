import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicLayout from '../components/layout/PublicLayout';
import { categories } from '../data/mockData';

export default function CategoriesPage() {
  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen bg-slate-50">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16 text-center">
          <h1 className="text-4xl font-black text-white mb-3">Browse by Category</h1>
          <p className="text-blue-200 text-lg">Discover businesses across every industry</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {categories.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/categories/${cat.id}`}
                  className="group block relative overflow-hidden rounded-2xl bg-white border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-36 overflow-hidden">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className="text-white font-bold text-sm">{cat.name}</p>
                        <p className="text-white/70 text-xs">{cat.businessCount} businesses</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
