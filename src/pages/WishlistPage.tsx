import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import Button from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../components/ui/Toast';
import { addCartItem } from '../lib/cartApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const UPLOADS_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

export default function WishlistPage() {
  const { dispatch } = useApp();
  const { showToast } = useToast();

  const [wishlistProducts, setWishlistProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWishlist() {
      setLoading(true);
      setErrorMsg(null);
      try {
        // 1. Get the list of saved product IDs for this user
        const wlRes = await fetch(`${API_BASE}/api/user/wishlist`, { credentials: 'include' });
        const wlData = await wlRes.json();

        if (!wlData.success) {
          if (!cancelled) setErrorMsg(wlData.message || 'Please log in to view your wishlist');
          return;
        }

        const savedIds: string[] = wlData.productIds;

        if (savedIds.length === 0) {
          if (!cancelled) setWishlistProducts([]);
          return;
        }

        // 2. Get the full product listing and filter down to saved ones
        const prodRes = await fetch(`${API_BASE}/api/user/products`, { credentials: 'include' });
        const prodData = await prodRes.json();

        if (!cancelled && prodData.success) {
          const matched = prodData.products.filter((p: ApiProduct) => savedIds.includes(p.id));
          setWishlistProducts(matched);
        }
      } catch (err: any) {
        if (!cancelled) setErrorMsg('Failed to load wishlist: ' + err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWishlist();
    return () => { cancelled = true; };
  }, []);

  const removeFromWishlist = async (id: string) => {
    setWishlistProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`${API_BASE}/api/user/wishlist/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      showToast('Removed from wishlist', 'info');
    } catch (err: any) {
      showToast('Failed to remove: ' + err.message, 'error');
    }
  };

  const imgSrc = (image: string | null) => image ? `${UPLOADS_BASE}${image}` : null;

  const addToCart = async (p: ApiProduct) => {
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

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900">My Wishlist</h1>
              <p className="text-slate-500 mt-1">{wishlistProducts.length} saved items</p>
            </div>
            {wishlistProducts.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => { wishlistProducts.forEach(addToCart); }}>
                Add All to Cart
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-500">Loading wishlist...</div>
          ) : errorMsg ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">{errorMsg}</h3>
              {errorMsg.toLowerCase().includes('log in') && (
                <Link to="/login"><Button>Log In</Button></Link>
              )}
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Your wishlist is empty</h3>
              <p className="text-slate-500 mb-6">Save items you love for later</p>
              <Link to="/products"><Button>Browse Products</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistProducts.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-shadow group">
                  <div className="relative h-48 overflow-hidden bg-slate-50 flex items-center justify-center">
                    <Link to={`/products/${p.id}`}>
                      {imgSrc(p.image) ? (
                        <img src={imgSrc(p.image)!} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <Package className="w-10 h-10 text-slate-300" />
                      )}
                    </Link>
                    <button onClick={() => removeFromWishlist(p.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-blue-600 font-medium mb-1">{p.category}</p>
                    <Link to={`/products/${p.id}`}>
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1 hover:text-blue-600">{p.name}</h3>
                    </Link>
                    <p className="text-xs text-slate-400 mb-2">{p.company}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-slate-900 font-black text-lg">₹{p.price.toLocaleString('en-IN')}</span>
                      <button onClick={() => addToCart(p)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" /> Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}