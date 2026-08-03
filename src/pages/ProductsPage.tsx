import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Grid, List, SlidersHorizontal, Package } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import Pagination from '../components/ui/Pagination';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../components/ui/Toast';
import { addCartItem } from '../lib/cartApi';

const ITEMS_PER_PAGE = 12;
const UPLOADS_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  image: string | null;
  category: string;
  categoryId: number;
  company: string;
  businessId: string;
}

export default function ProductsPage() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [priceRange, setPriceRange] = useState([0, 200000]);  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

const maxPrice = React.useMemo(
  () => (products.length > 0 ? Math.max(...products.map(p => p.price)) : 200000),
  [products]
);
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setErrorMsg(null);
      try {
        console.log('[ProductsPage] Fetching from:', `${API_BASE}/api/user/products`);
        const res = await fetch(`${API_BASE}/api/user/products`, { credentials: 'include' });
        console.log('[ProductsPage] Response status:', res.status);
        const data = await res.json();
        console.log('[ProductsPage] Response data:', data);
        if (!cancelled) {
          if (data.success) {
            setProducts(data.products);
            console.log('[ProductsPage] Products set:', data.products.length);

            // Build a unique category list straight from the returned products
            const seen = new Map<number, string>();
            for (const p of data.products as ApiProduct[]) {
              if (!seen.has(p.categoryId)) seen.set(p.categoryId, p.category);
            }
            setCategories(Array.from(seen, ([id, name]) => ({ id, name })));
          } else {
            setErrorMsg(data.message || 'Failed to load products');
          }
        }
      } catch (err: any) {
        if (!cancelled) setErrorMsg('Failed to load products: ' + err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

   loadProducts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setPriceRange([0, maxPrice]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'newest') return b.id.localeCompare(a.id);
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const addToCart = async (p: ApiProduct, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await addCartItem(p.id, 1);
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          product: {
            ...p,
            description: '',
            originalPrice: p.price,
            discount: 0,
            rating: 0,
            reviewCount: 0,
            images: p.image ? [`${UPLOADS_BASE}${p.image}`] : [],
            categoryId: String(p.categoryId),
            trending: false,
            featured: false,
            tags: [],
            specifications: {},
          } as any,
        },
      });
      showToast(`${p.name} added to cart!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add item to cart', 'error');
    }
};

  const toggleWishlist = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const isSaved = state.wishlist.includes(id);
    dispatch({ type: 'TOGGLE_WISHLIST', payload: id }); // optimistic local update

    try {
      if (isSaved) {
        await fetch(`${API_BASE}/api/user/wishlist/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        showToast('Removed from wishlist', 'info');
      } else {
        const res = await fetch(`${API_BASE}/api/user/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId: id }),
        });
        const data = await res.json();
        if (!data.success) {
          // revert local change if the backend rejected it (e.g. not logged in)
          dispatch({ type: 'TOGGLE_WISHLIST', payload: id });
          showToast(data.message || 'Please log in to save items', 'error');
          return;
        }
        showToast('Added to wishlist', 'info');
      }
    } catch (err: any) {
      dispatch({ type: 'TOGGLE_WISHLIST', payload: id }); // revert on network failure
      showToast('Failed to update wishlist: ' + err.message, 'error');
    }
  };

  const imgSrc = (image: string | null) => image ? `${UPLOADS_BASE}${image}` : null;

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
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low-High</option>
                  <option value="price_desc">Price: High-Low</option>
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
                     <button onClick={() => { setSelectedCategory(''); setPriceRange([0, 200000]); }} className="text-xs text-blue-600 hover:underline">Reset All</button>                  </div>
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Category</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="cat" checked={!selectedCategory} onChange={() => setSelectedCategory('')} className="text-blue-600" />
                          <span className="text-sm text-slate-600">All Categories</span>
                        </label>
                        {categories.map(c => (
                          <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="cat" checked={selectedCategory === c.id} onChange={() => setSelectedCategory(c.id)} className="text-blue-600" />
                            <span className="text-sm text-slate-600">{c.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Price Range</h4>
                      <div className="space-y-2">
                        <input type="range" min={0} max={200000} step={1000} value={priceRange[1]} onChange={e => setPriceRange([0, +e.target.value])} className="w-full accent-blue-600" />                        <div className="flex justify-between text-xs text-slate-500"><span>₹0</span><span>₹{priceRange[1]}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Product Grid / List */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="text-center py-20 text-slate-500">Loading products...</div>
              ) : errorMsg ? (
                <div className="text-center py-20 text-red-500">{errorMsg}</div>
              ) : paged.length === 0 ? (
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
                        <div className="relative h-44 overflow-hidden bg-slate-50 flex items-center justify-center">
                          {imgSrc(p.image) ? (
                            <img src={imgSrc(p.image)!} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <Package className="w-10 h-10 text-slate-300" />
                          )}
                          <button onClick={e => toggleWishlist(p.id, e)}
                            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all ${state.wishlist.includes(p.id) ? 'bg-red-500 text-white' : 'bg-white text-slate-400 hover:text-red-500'}`}>
                            ♥
                          </button>
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-blue-600 font-medium mb-1">{p.category}</p>
                          <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1">{p.name}</h3>
                          <p className="text-xs text-slate-400 mb-2">{p.company}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-slate-900 font-black text-base">₹{p.price.toLocaleString('en-IN')}</span>
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
                        <div className="w-32 h-32 flex-shrink-0 overflow-hidden bg-slate-50 flex items-center justify-center">
                          {imgSrc(p.image) ? (
                            <img src={imgSrc(p.image)!} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <Package className="w-8 h-8 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 p-4 flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-blue-600 font-medium">{p.category}</p>
                            <h3 className="font-bold text-slate-800 line-clamp-1">{p.name}</h3>
                            <p className="text-slate-400 text-xs mt-1">{p.company}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="font-black text-slate-900 text-lg">₹{p.price.toLocaleString('en-IN')}</p>
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