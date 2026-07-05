import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Shield, Truck, RotateCcw, ChevronRight, Minus, Plus, Share2 } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import StarRating from '../components/ui/StarRating';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../components/ui/Toast';
import { products, reviews } from '../data/mockData';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  if (!product) return (
    <PublicLayout>
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
          <Link to="/products" className="text-blue-600 hover:underline">Back to Products</Link>
        </div>
      </div>
    </PublicLayout>
  );

  const inWishlist = state.wishlist.includes(product.id);
  const productReviews = reviews.filter(r => r.productId === product.id);
  const similar = products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleBuyNow = () => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
    navigate('/checkout');
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
            <Link to={`/categories/${product.categoryId}`} className="hover:text-blue-600">{product.category}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-medium truncate max-w-xs">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 mb-12">
            {/* Images */}
            <div>
              <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-slate-100 mb-4 shadow-sm">
                <motion.img key={selectedImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={product.images[selectedImage]} alt={product.name}
                  className="w-full h-full object-cover" />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-blue-600' : 'border-transparent hover:border-slate-300'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge variant="info" className="mb-2">{product.category}</Badge>
                  <h1 className="text-2xl lg:text-3xl font-black text-slate-900">{product.name}</h1>
                </div>
                <button onClick={() => dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id })}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all flex-shrink-0 ml-4 ${inWishlist ? 'border-red-500 bg-red-50 text-red-500' : 'border-slate-200 hover:border-red-300 text-slate-400'}`}>
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <StarRating rating={product.rating} showValue reviewCount={product.reviewCount} size="md" />
                <span className="text-sm text-slate-500">by <Link to={`/businesses/${product.businessId}`} className="text-blue-600 hover:underline font-medium">{product.businessName}</Link></span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-black text-slate-900">${product.price}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-slate-400 line-through">${product.originalPrice}</span>
                    <Badge variant="error">Save {product.discount}%</Badge>
                  </>
                )}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">{product.description}</p>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-semibold text-slate-700">Quantity:</span>
                <div className="flex items-center gap-1 border border-slate-200 rounded-xl">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-l-xl transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="w-12 text-center font-bold text-slate-800">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stockCount, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-r-xl transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <span className="text-sm text-slate-500">{product.stockCount} available</span>
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
              {(['description', 'specs', 'reviews'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  {tab === 'reviews' ? `Reviews (${productReviews.length || 5})` : tab}
                </button>
              ))}
            </div>
            <div className="p-6">
              {activeTab === 'description' && <p className="text-slate-600 leading-relaxed">{product.description}</p>}
              {activeTab === 'specs' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-500 text-sm font-medium min-w-28">{k}</span>
                      <span className="text-slate-800 text-sm font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-5">
                  {(productReviews.length > 0 ? productReviews : reviews.slice(0, 3)).map(r => (
                    <div key={r.id} className="flex gap-4 pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                      <img src={r.userAvatar} alt={r.userName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800 text-sm">{r.userName}</span>
                          <span className="text-slate-400 text-xs">{r.date}</span>
                        </div>
                        <StarRating rating={r.rating} size="sm" />
                        <p className="text-slate-600 text-sm mt-2 leading-relaxed">{r.comment}</p>
                        <button className="text-xs text-slate-400 mt-2 hover:text-blue-600">{r.helpful} found this helpful</button>
                      </div>
                    </div>
                  ))}
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
                    <div className="h-40 overflow-hidden">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1">{p.name}</h3>
                      <StarRating rating={p.rating} size="sm" />
                      <p className="text-blue-600 font-bold mt-1">${p.price}</p>
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
