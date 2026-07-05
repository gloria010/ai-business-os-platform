import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, CreditCard, MapPin, Package, ChevronRight, ChevronDown } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import Button from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';

const steps = ['Address', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [ordered, setOrdered] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);

  const subtotal = state.cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const placeOrder = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    dispatch({ type: 'CLEAR_CART' });
    setOrdered(true);
    setLoading(false);
  };

  if (ordered) return (
    <PublicLayout>
      <div className="pt-20 min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md bg-white rounded-3xl p-12 shadow-xl border border-slate-100">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Order Placed!</h2>
            <p className="text-slate-500 mb-2">Thank you for your order. We've received it and will start processing shortly.</p>
            <div className="bg-slate-50 rounded-xl p-4 my-6">
              <p className="text-slate-500 text-sm">Order ID</p>
              <p className="text-slate-900 font-black text-lg">ORD-{Date.now().toString().slice(-6)}</p>
              <p className="text-slate-500 text-sm mt-1">Estimated delivery: 3-5 business days</p>
            </div>
            <div className="flex gap-3">
              <Link to="/dashboard/orders" className="flex-1"><Button fullWidth variant="outline">Track Order</Button></Link>
              <Link to="/products" className="flex-1"><Button fullWidth>Shop More</Button></Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-slate-900 mb-8">Checkout</h1>

          {/* Steps */}
          <div className="flex items-center mb-8">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${i <= step ? 'text-blue-600' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i < step ? 'bg-blue-600 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="font-semibold text-sm hidden sm:block">{s}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2">
              {/* Step 0: Address */}
              {step === 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Delivery Address</h2>
                  <div className="space-y-3">
                    {state.user?.addresses.map((addr, i) => (
                      <label key={addr.id} className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedAddress === i ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="radio" checked={selectedAddress === i} onChange={() => setSelectedAddress(i)} className="mt-1" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-800 text-sm">{addr.label}</span>
                            {addr.isDefault && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">Default</span>}
                          </div>
                          <p className="text-slate-600 text-sm">{addr.name} · {addr.phone}</p>
                          <p className="text-slate-500 text-sm">{addr.line1}, {addr.city}, {addr.state} {addr.zip}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <Button onClick={() => setStep(1)} className="mt-5" icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">Continue to Payment</Button>
                </motion.div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-600" /> Payment Method</h2>
                  <div className="space-y-3 mb-5">
                    {[{ value: 'credit_card', label: 'Credit / Debit Card' }, { value: 'paypal', label: 'PayPal' }, { value: 'apple_pay', label: 'Apple Pay' }, { value: 'cod', label: 'Cash on Delivery' }].map(m => (
                      <label key={m.value} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === m.value ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="radio" checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} />
                        <span className="font-medium text-sm text-slate-800">{m.label}</span>
                      </label>
                    ))}
                  </div>
                  {paymentMethod === 'credit_card' && (
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Card Number</label>
                        <input value={cardForm.number} onChange={e => setCardForm(f => ({ ...f, number: e.target.value }))} placeholder="1234 5678 9012 3456"
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Cardholder Name</label>
                        <input value={cardForm.name} onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe"
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry Date</label>
                        <input value={cardForm.expiry} onChange={e => setCardForm(f => ({ ...f, expiry: e.target.value }))} placeholder="MM/YY"
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">CVV</label>
                        <input value={cardForm.cvv} onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value }))} placeholder="123"
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                    <Button onClick={() => setStep(2)} icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">Review Order</Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /> Order Review</h2>
                  <div className="space-y-3 mb-5">
                    {state.cart.map(item => (
                      <div key={item.productId} className="flex gap-3 items-center">
                        <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{item.product.name}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-slate-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={placeOrder} loading={loading} className="flex-1">Place Order — ${total.toFixed(2)}</Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 h-fit">
              <h3 className="font-bold text-slate-800 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                {state.cart.map(item => (
                  <div key={item.productId} className="flex justify-between text-slate-600">
                    <span className="truncate pr-2">{item.product.name} x{item.quantity}</span>
                    <span className="flex-shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping}`}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                  <div className="flex justify-between font-black text-slate-900 text-base border-t border-slate-100 pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
