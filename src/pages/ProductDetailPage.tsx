//ProductDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Shield, Truck, RotateCcw, ChevronRight, Minus, Plus } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import Badge from '../components/ui/Badge';
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
  company: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [similar, setSimilar] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('description');

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`${API_BASE}/api/user/products/${id}`, { credentials: 'include' });
        const data = await res.json();
        if (cancelled) return;

        if (!data.success) {
          setNotFound(true);
          return;
        }
        setProduct(data.product);

        // Pull similar products from the same category via the full listing
        const listRes = await fetch(`${API_BASE}/api/user/products`, { credentials: 'include' });
        const listData = await listRes.json();
        if (!cancelled && listData.success) {
          const sameCategory = listData.products
            .filter((p: any) => p.category === data.product.category && p.id !== data.product.id)
            .slice(0, 4);
          setSimilar(sameCategory);
        }
      } catch (err) {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) loadProduct();
    return () => { cancelled = true; };
  }, [id]);

  const imgSrc = (image: string | null) => image ? `${UPLOADS_BASE}${image}` : null;

  if (loading) {
    return (
      <PublicLayout>
        <div className="pt-24 min-h-screen flex items-center justify-center text-slate-500">
          Loading product...
        </div>
      </PublicLayout>
    );
  }

  if (notFound || !product) {
    return (
      <PublicLayout>
        <div className="pt-24 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
            <Link to="/products" className="text-blue-600 hover:underline">Back to Products</Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const inWishlist = state.wishlist.includes(product.id);
  const image = imgSrc(product.image);

  const handleAddToCart = async () => {
    try {
      await addCartItem(product.id, quantity);
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          product: {
            ...product,
            description: '',
            originalPrice: product.price,
            discount: 0,
            rating: 0,
            reviewCount: 0,
            images: image ? [image] : [],
            categoryId: product.category,
            trending: false,
            featured: false,
            tags: [],
            specifications: {},
          } as any,
          quantity,
        },
      });
      showToast(`${product.name} added to cart!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add item to cart', 'error');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleToggleWishlist = async () => {
    const isSaved = state.wishlist.includes(product.id);
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id }); // optimistic local update

    try {
      if (isSaved) {
        await fetch(`${API_BASE}/api/user/wishlist/${product.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        showToast('Removed from wishlist', 'info');
      } else {
        const res = await fetch(`${API_BASE}/api/user/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId: product.id }),
        });
        const data = await res.json();
        if (!data.success) {
          dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id }); // revert
          showToast(data.message || 'Please log in to save items', 'error');
          return;
        }
        showToast('Added to wishlist', 'info');
      }
    } catch (err: any) {
      dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id }); // revert on failure
      showToast('Failed to update wishlist: ' + err.message, 'error');
    }
  };

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/products" className="hover:text-blue-600">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="hover:text-blue-600">{product.category}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-medium truncate max-w-xs">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 mb-12">
            {/* Image */}
            <div>
              <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-slate-100 mb-4 shadow-sm flex items-center justify-center">
                {image ? (
                  <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={image} alt={product.name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-300 text-sm">No image available</div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge variant="info" className="mb-2">{product.category}</Badge>
                  <h1 className="text-2xl lg:text-3xl font-black text-slate-900">{product.name}</h1>
                </div>
                <button onClick={handleToggleWishlist}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all flex-shrink-0 ml-4 ${inWishlist ? 'border-red-500 bg-red-50 text-red-500' : 'border-slate-200 hover:border-red-300 text-slate-400'}`}>
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-slate-500">by <span className="text-blue-600 font-medium">{product.company}</span></span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-black text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-semibold text-slate-700">Quantity:</span>
                <div className="flex items-center gap-1 border border-slate-200 rounded-xl">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-l-xl transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="w-12 text-center font-bold text-slate-800">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-r-xl transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <span className="text-sm text-slate-500">{product.stock} available</span>
              </div>

              {/* CTA */}
              <div className="flex gap-3 mb-6">
                <Button onClick={handleAddToCart} size="lg" className="flex-1" icon={<ShoppingCart className="w-4 h-4" />}>Add to Cart</Button>
                <Button onClick={handleBuyNow} variant="secondary" size="lg" className="flex-1">Buy Now</Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Shield, text: 'Secure Payment' },
                  { icon: Truck, text: 'Fast Delivery' },
                  { icon: RotateCcw, text: 'Easy Returns' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-xl">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="text-xs text-slate-600 font-medium text-center">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 mb-8">
            <div className="flex border-b border-slate-100">
              {(['description', 'details'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-6">
              {activeTab === 'description' && (
                <p className="text-slate-600 leading-relaxed">
                  {product.name} available from {product.company}.
                </p>
              )}
              {activeTab === 'details' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 text-sm font-medium min-w-28">SKU</span>
                    <span className="text-slate-800 text-sm font-semibold">{product.sku}</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 text-sm font-medium min-w-28">Category</span>
                    <span className="text-slate-800 text-sm font-semibold">{product.category}</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 text-sm font-medium min-w-28">Availability</span>
                    <span className="text-slate-800 text-sm font-semibold">{product.status}</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 text-sm font-medium min-w-28">Sold by</span>
                    <span className="text-slate-800 text-sm font-semibold">{product.company}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Similar Products */}
          {similar.length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6">Similar Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {similar.map(p => (
                  <Link key={p.id} to={`/products/${p.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow">
                    <div className="h-40 overflow-hidden bg-slate-50 flex items-center justify-center">
                      {imgSrc(p.image) ? (
                        <img src={imgSrc(p.image)!} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="text-slate-300 text-xs">No image</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1">{p.name}</h3>
                      <p className="text-blue-600 font-bold mt-1">₹{p.price.toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}