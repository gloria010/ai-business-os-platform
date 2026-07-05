import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Grid, List, SlidersHorizontal, Package } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import StarRating from '../components/ui/StarRating';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../components/ui/Toast';
import { products, categories } from '../data/mockData';
import { Product } from '../types';

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('trending');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    if (p.rating < minRating) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return b.id.localeCompare(a.id);
    return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const addToCart = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({ type: 'ADD_TO_CART', payload: { product: p } });
    showToast(`${p.name} added to cart!`, 'success');
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({ type: 'TOGGLE_WISHLIST', payload: id });
    showToast(state.wishlist.includes(id) ? 'Removed from wishlist' : 'Added to wishlist', 'info');
  };

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">All Products</h1>
                <p className="text-slate-500 text-sm mt-1">{filtered.length} products found</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700">
                  <option value="trending">Trending</option>
                  <option value="rating">Top Rated</option>
                  <option value="price_asc">Price: Low-High</option>
                  <option value="price_desc">Price: High-Low</option>
                  <option value="newest">Newest</option>
                </select>
                <button onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
                <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-xl p-1">
                  <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg ${view === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}><Grid className="w-4 h-4" /></button>
                  <button onClick={() => setView('list')} className={`p-1.5 rounded-lg ${view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Filter Panel */}
            {showFilters && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">Filters</h3>
                    <button onClick={() => { setSelectedCategory(''); setPriceRange([0, 1500]); setMinRating(0); }} className="text-xs text-blue-600 hover:underline">Reset All</button>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Category</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="cat" value="" checked={!selectedCategory} onChange={() => setSelectedCategory('')} className="text-blue-600" />
                          <span className="text-sm text-slate-600">All Categories</span>
                        </label>
                        {categories.slice(0, 6).map(c => (
                          <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="cat" value={c.id} checked={selectedCategory === c.id} onChange={() => setSelectedCategory(c.id)} className="text-blue-600" />
                            <span className="text-sm text-slate-600">{c.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Price Range</h4>
                      <div className="space-y-2">
                        <input type="range" min={0} max={1500} step={50} value={priceRange[1]} onChange={e => setPriceRange([0, +e.target.value])} className="w-full accent-blue-600" />
                        <div className="flex justify-between text-xs text-slate-500"><span>$0</span><span>${priceRange[1]}</span></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Minimum Rating</h4>
                      <div className="space-y-1.5">
                        {[4.5, 4, 3.5, 0].map(r => (
                          <label key={r} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} className="text-blue-600" />
                            <span className="text-sm text-slate-600">{r > 0 ? `${r}+ stars` : 'All Ratings'}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Product Grid / List */}
            <div className="flex-1 min-w-0">
              {paged.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-slate-700 font-bold">No products found</h3>
                  <p className="text-slate-500 text-sm">Try adjusting your filters</p>
                </div>
              ) : view === 'grid' ? (
                <div className={`grid gap-5 ${showFilters ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
                  {paged.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Link to={`/products/${p.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300">
                        <div className="relative h-44 overflow-hidden bg-slate-50">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          {p.discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{p.discount}%</span>}
                          <button onClick={e => toggleWishlist(p.id, e)}
                            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all ${state.wishlist.includes(p.id) ? 'bg-red-500 text-white' : 'bg-white text-slate-400 hover:text-red-500'}`}>
                            ♥
                          </button>
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-blue-600 font-medium mb-1">{p.category}</p>
                          <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2">{p.name}</h3>
                          <StarRating rating={p.rating} reviewCount={p.reviewCount} size="sm" />
                          <div className="flex items-center justify-between mt-3">
                            <div>
                              <span className="text-slate-900 font-black text-base">${p.price}</span>
                              {p.originalPrice > p.price && <span className="text-slate-400 text-xs line-through ml-1">${p.originalPrice}</span>}
                            </div>
                            <button onClick={e => addToCart(p, e)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                              Add
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {paged.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <Link to={`/products/${p.id}`} className="group flex bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-32 h-32 flex-shrink-0 overflow-hidden">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 p-4 flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-blue-600 font-medium">{p.category}</p>
                            <h3 className="font-bold text-slate-800 line-clamp-1">{p.name}</h3>
                            <p className="text-slate-500 text-xs line-clamp-2 mt-1">{p.description}</p>
                            <StarRating rating={p.rating} reviewCount={p.reviewCount} size="sm" />
                          </div>
                          <div className="flex-shrink-0 text-right">
                            {p.discount > 0 && <Badge variant="error" className="mb-1">-{p.discount}%</Badge>}
                            <p className="font-black text-slate-900 text-lg">${p.price}</p>
                            {p.originalPrice > p.price && <p className="text-slate-400 text-xs line-through">${p.originalPrice}</p>}
                            <button onClick={e => addToCart(p, e)} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}


