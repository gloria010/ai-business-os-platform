import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import StarRating from '../components/ui/StarRating';
import Button from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../components/ui/Toast';
import { products } from '../data/mockData';

export default function WishlistPage() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const wishlistProducts = products.filter(p => state.wishlist.includes(p.id));

  const removeFromWishlist = (id: string) => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: id });
    showToast('Removed from wishlist', 'info');
  };

  const addToCart = (id: string) => {
    const p = products.find(pr => pr.id === id);
    if (p) {
      dispatch({ type: 'ADD_TO_CART', payload: { product: p } });
      showToast(`${p.name} added to cart!`, 'success');
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
              <Button variant="outline" size="sm" onClick={() => { wishlistProducts.forEach(p => addToCart(p.id)); }}>
                Add All to Cart
              </Button>
            )}
          </div>

          {wishlistProducts.length === 0 ? (
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
                  <div className="relative h-48 overflow-hidden">
                    <Link to={`/products/${p.id}`}>
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </Link>
                    {p.discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{p.discount}%</span>}
                    <button onClick={() => removeFromWishlist(p.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-blue-600 font-medium mb-1">{p.category}</p>
                    <Link to={`/products/${p.id}`}>
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 hover:text-blue-600">{p.name}</h3>
                    </Link>
                    <StarRating rating={p.rating} size="sm" />
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-slate-900 font-black text-lg">${p.price}</span>
                        {p.originalPrice > p.price && <span className="text-slate-400 text-xs line-through ml-1">${p.originalPrice}</span>}
                      </div>
                      <button onClick={() => addToCart(p.id)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
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
