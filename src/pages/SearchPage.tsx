import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, TrendingUp, Clock, Filter } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import StarRating from '../components/ui/StarRating';
import { useApp } from '../contexts/AppContext';
import { products, businesses } from '../data/mockData';

const trending = ['iPhone 15', 'Nike Air Max', 'MacBook Pro', 'Yoga Mat', 'Protein Powder', 'Smart TV', 'Vitamin C Serum'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<'products' | 'businesses'>('products');

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q) dispatch({ type: 'ADD_RECENT_SEARCH', payload: q });
  }, [searchParams]);

  const productResults = products.filter(p => query && (p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())));
  const businessResults = businesses.filter(b => query && (b.name.toLowerCase().includes(query.toLowerCase()) || b.category.toLowerCase().includes(query.toLowerCase())));

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen bg-slate-50">
        {/* Search Header */}
        <div className="bg-white border-b border-slate-100 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-4 flex-shrink-0" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && query) dispatch({ type: 'ADD_RECENT_SEARCH', payload: query }); }}
                placeholder="Search products, businesses, categories..."
                className="flex-1 px-4 py-4 bg-transparent text-slate-800 placeholder:text-slate-400 outline-none text-lg" />
              {query && (
                <button onClick={() => setQuery('')} className="p-3 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!query ? (
            /* Empty State */
            <div className="grid md:grid-cols-2 gap-8">
              {state.recentSearches.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" /> Recent Searches</h3>
                  <div className="space-y-2">
                    {state.recentSearches.map(s => (
                      <button key={s} onClick={() => setQuery(s)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-left text-sm text-slate-600 hover:text-blue-600 transition-colors">
                        <Clock className="w-4 h-4 text-slate-300 flex-shrink-0" /> {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600" /> Trending Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {trending.map((t, i) => (
                    <button key={t} onClick={() => setQuery(t)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-sm text-slate-700 transition-colors">
                      <span className="text-xs text-slate-400 font-bold">{i + 1}</span> {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Results */
            <div>
              <div className="flex items-center gap-4 mb-6">
                <p className="text-slate-500 text-sm"><strong className="text-slate-800">{productResults.length + businessResults.length}</strong> results for "{query}"</p>
                <div className="flex gap-2 ml-auto">
                  {(['products', 'businesses'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                      {tab} ({tab === 'products' ? productResults.length : businessResults.length})
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'products' && (
                productResults.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-600 font-semibold">No products found for "{query}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {productResults.map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <Link to={`/products/${p.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300">
                          <div className="h-44 overflow-hidden bg-slate-50">
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {p.discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{p.discount}%</span>}
                          </div>
                          <div className="p-4">
                            <p className="text-xs text-blue-600 font-medium mb-1">{p.category}</p>
                            <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2">{p.name}</h3>
                            <StarRating rating={p.rating} size="sm" />
                            <p className="font-black text-slate-900 mt-2">${p.price}</p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'businesses' && (
                businessResults.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-600 font-semibold">No businesses found for "{query}"</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {businessResults.map((b, i) => (
                      <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <Link to={`/businesses/${b.id}`} className="group flex gap-3 bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
                          <img src={b.logo} alt={b.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 truncate group-hover:text-blue-600">{b.name}</h3>
                            <p className="text-slate-500 text-xs">{b.category}</p>
                            <StarRating rating={b.rating} showValue reviewCount={b.reviewCount} size="sm" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
