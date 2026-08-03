import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import Button from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../components/ui/Toast';

export default function CartPage() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = state.cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 200 ? 0 : 15;
  const tax = Math.round((subtotal - discount) * 0.08);
  const total = subtotal - discount + shipping + tax;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'SAVE10') {
      setCouponApplied(true);
      showToast('10% discount applied!', 'success', 'Coupon Applied');
    } else {
      showToast('Invalid coupon code', 'error');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    // Update local state immediately for snappy UI
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity } });

    try {
      const res = await fetch(`http://localhost:5000/api/user/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.message || 'Failed to update cart', 'error');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Cart] Update quantity failed:', message);
      showToast('Could not sync cart with server', 'error');
    }
  };

  const removeItem = async (productId: string) => {
    // Update local state immediately
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });

    try {
      const res = await fetch(`http://localhost:5000/api/user/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.message || 'Failed to remove item', 'error');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Cart] Remove item failed:', message);
      showToast('Could not sync cart with server', 'error');
    }
  };

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-slate-900 mb-8">Shopping Cart</h1>
          {state.cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Your cart is empty</h3>
              <p className="text-slate-500 mb-6">Add some products to get started</p>
              <Link to="/products"><Button>Browse Products</Button></Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-3">
                {state.cart.map(item => (
                  <motion.div key={item.productId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl p-4 border border-slate-100 flex gap-4 items-center">
                    <Link to={`/products/${item.productId}`} className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.productId}`} className="font-bold text-slate-800 hover:text-blue-600 text-sm line-clamp-2">{item.product.name}</Link>
                      <p className="text-xs text-slate-500 mt-0.5">{item.product.businessName}</p>
                      <p className="text-blue-600 font-bold mt-1">${item.product.price}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 border border-slate-200 rounded-xl">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-l-xl"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-r-xl"><Plus className="w-3 h-3" /></button>
                      </div>
                      <p className="font-black text-slate-900 w-16 text-right">${(item.product.price * item.quantity).toFixed(0)}</p>
                      <button onClick={() => removeItem(item.productId)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-4">
                {/* Coupon */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-blue-600" /> Coupon Code</h3>
                  {couponApplied ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-700 text-sm font-medium">
                      SAVE10 applied — 10% off!
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter code (SAVE10)"
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button onClick={applyCoupon} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">Apply</button>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h3 className="font-bold text-slate-800 mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600"><span>Subtotal ({state.cart.reduce((s, i) => s + i.quantity, 0)} items)</span><span>${subtotal.toFixed(2)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount (SAVE10)</span><span>-${discount.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-slate-600"><span>Shipping</span><span className={shipping === 0 ? 'text-emerald-600 font-semibold' : ''}>{shipping === 0 ? 'FREE' : `$${shipping}`}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                    <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-slate-900 text-base">
                      <span>Total</span><span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button fullWidth size="lg" onClick={() => navigate('/checkout')} className="mt-5" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                    Proceed to Checkout
                  </Button>
                  {subtotal < 200 && <p className="text-xs text-slate-500 mt-2 text-center">Add ${(200 - subtotal).toFixed(0)} more for free shipping</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}