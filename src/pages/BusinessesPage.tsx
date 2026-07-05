import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Shield, MapPin, Star, Filter } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import StarRating from '../components/ui/StarRating';
import Pagination from '../components/ui/Pagination';
import { businesses, categories } from '../data/mockData';

export default function BusinessesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [page, setPage] = useState(1);
  const ITEMS = 8;

  const filtered = businesses.filter(b => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !b.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory && b.categoryId !== selectedCategory) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paged = filtered.slice((page - 1) * ITEMS, page * ITEMS);

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen bg-slate-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-black text-white mb-3">Discover Amazing Businesses</h1>
            <p className="text-slate-400 text-lg mb-8">Find verified businesses across all categories</p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search businesses..."
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none shadow-xl text-sm" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                All
              </button>
              {categories.slice(0, 6).map(c => (
                <button key={c.id} onClick={() => { setSelectedCategory(c.id); setPage(1); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === c.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="sm:ml-auto border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 flex-shrink-0">
              <option value="featured">Featured</option>
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>

          <p className="text-slate-500 text-sm mb-6">{filtered.length} businesses found</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paged.map((biz, i) => (
              <motion.div key={biz.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link to={`/businesses/${biz.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-36 overflow-hidden">
                    <img src={biz.coverImage} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {biz.verified && (
                      <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex gap-3 mb-3">
                      <img src={biz.logo} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">{biz.name}</h3>
                        <span className="text-xs text-slate-500">{biz.category}</span>
                      </div>
                    </div>
                    <StarRating rating={biz.rating} showValue reviewCount={biz.reviewCount} size="sm" />
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">{biz.description}</p>
                    <div className="flex items-center gap-1 mt-3 text-slate-400 text-xs">
                      <MapPin className="w-3 h-3" /> {biz.location}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-600 font-semibold">No businesses found</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
