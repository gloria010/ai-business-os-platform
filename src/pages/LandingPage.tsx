// LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Star, ChevronRight, Zap, Shield, TrendingUp, Users, Package, Award, Play } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { categories, businesses, testimonials, platformStats, revenueData } from '../data/mockData';
import { useApp } from '../contexts/AppContext';
import PublicLayout from '../components/layout/PublicLayout';
import Button from '../components/ui/Button';
import StarRating from '../components/ui/StarRating';
const UPLOADS_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } };
export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadCategoryCounts() {
      try {
        const res = await fetch('/api/user/categories/counts');
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const countMap = await res.json(); // { [business_category]: count }
        if (!cancelled) setCategoryCounts(countMap);
      } catch (err) {
        console.error('Failed to load category counts:', err);
      }
    }

    loadCategoryCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  const [liveProducts, setLiveProducts] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const res = await fetch('/api/user/products');
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        if (!cancelled && json.success) {
          // newest first, capped to 8 for the "trending" strip
          const sorted = [...json.products].sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setLiveProducts(sorted.slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch({ type: 'ADD_RECENT_SEARCH', payload: searchQuery });
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

    const featuredBusinesses = businesses.filter(b => b.featured).slice(0, 4);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
                  <Zap className="w-3 h-3" /> AI-Powered Business Platform
                </span>
              </motion.div>

              <motion.h1 {...fadeUp} transition={{ delay: 0.2 }} className="text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight mb-6">
                The Future of
                <span className="block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Business is Here</span>
              </motion.h1>

              <motion.p {...fadeUp} transition={{ delay: 0.3 }} className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg">
                Discover, connect, and grow with AI-powered insights. The all-in-one platform for businesses and consumers to thrive together.
              </motion.p>

              {/* Search Bar */}
              <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
                <form onSubmit={handleSearch} className="relative flex bg-white rounded-2xl shadow-2xl shadow-blue-500/20 overflow-hidden mb-4 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search products, businesses, categories..."
                    className="flex-1 pl-12 pr-4 py-4 text-slate-800 placeholder:text-slate-400 outline-none text-sm bg-transparent" />
                  <button type="submit" className="m-2 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0">
                    Search
                  </button>
                </form>
                <p className="text-slate-500 text-xs">Trending: <button onClick={() => navigate('/search?q=electronics')} className="text-blue-400 hover:underline mx-1">Electronics</button> <button onClick={() => navigate('/search?q=fashion')} className="text-blue-400 hover:underline mx-1">Fashion</button> <button onClick={() => navigate('/search?q=beauty')} className="text-blue-400 hover:underline mx-1">Beauty</button></p>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button size="lg" onClick={() => navigate('/register')} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  Get Started Free
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/businesses')}
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white" icon={<Play className="w-4 h-4" />}>
                  Watch Demo
                </Button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div {...fadeUp} transition={{ delay: 0.6 }} className="flex items-center gap-6 mt-10">
                <div className="flex -space-x-2">
                  {['220453', '415829', '614810', '774909'].map(id => (
                    <img key={id} src={`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=60`} alt=""
                      className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">{Array(5).fill(0).map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}</div>
                  <p className="text-slate-400 text-xs mt-0.5">2.4M+ happy users</p>
                </div>
                <div className="hidden sm:block h-8 w-px bg-slate-700" />
                <div className="hidden sm:block">
                  <p className="text-white font-bold text-sm">12,500+</p>
                  <p className="text-slate-400 text-xs">Active Businesses</p>
                </div>
              </motion.div>
            </div>

            {/* Hero Visual */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className="hidden lg:block">
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white/60 text-xs">Platform Revenue</p>
                      <p className="text-white text-2xl font-bold">₹93,13,131.10</p>
                      <p className="text-emerald-400 text-xs flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> +18% this month</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData.slice(-6)}>
                        <defs>
                          <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Tooltip formatter={(v: any) => [`$${(Number(v ?? 0)/1000).toFixed(0)}k`, '']} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />                        <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="url(#heroGrad)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Floating cards */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold text-sm">850K+</p>
                    <p className="text-slate-500 text-xs">Products</p>
                  </div>
                </motion.div>

                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3, delay: 1.5, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold text-sm">2.4M+</p>
                    <p className="text-slate-500 text-xs">Users</p>
                  </div>
                </motion.div>

                <motion.div animate={{ x: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-1/2 -left-8 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-slate-800 font-bold text-sm">4.9</span>
                  <span className="text-slate-500 text-xs">Rating</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {platformStats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <p className="text-4xl font-black text-white">{stat.value}</p>
                <p className="text-blue-200 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-blue-600 font-semibold text-sm mb-2">EXPLORE</p>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Business Categories</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Discover thousands of businesses across every industry, all in one place.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={`/categories/${cat.id}`}
                  className="group block relative overflow-hidden rounded-2xl aspect-square bg-slate-100 hover:shadow-xl transition-all duration-300">
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent`} />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm">{cat.name}</p>
                    <p className="text-white/70 text-xs">{categoryCounts[cat.name] || 0} businesses</p>
                  </div>
                   <div className="absolute top-3 right-3 text-xl">{cat.icon}</div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/categories" className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:gap-3 transition-all">
              View All Categories <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-12">
            <div>
              <p className="text-blue-600 font-semibold text-sm mb-2">FEATURED</p>
              <h2 className="text-4xl font-black text-slate-900">Top Businesses</h2>
            </div>
            <Link to="/businesses" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold text-sm hover:gap-3 transition-all">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBusinesses.map((biz, i) => (
              <motion.div key={biz.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`/businesses/${biz.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="relative h-36 overflow-hidden">
                    <img src={biz.coverImage} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {biz.verified && <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><Shield className="w-3 h-3" /> Verified</span>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <img src={biz.logo} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 text-sm truncate">{biz.name}</h3>
                        <p className="text-slate-500 text-xs">{biz.category}</p>
                      </div>
                    </div>
                    <StarRating rating={biz.rating} showValue reviewCount={biz.reviewCount} size="sm" />
                    <p className="text-slate-600 text-xs mt-2 line-clamp-2 leading-relaxed">{biz.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-12">
            <div>
              <p className="text-blue-600 font-semibold text-sm mb-2">TRENDING NOW</p>
              <h2 className="text-4xl font-black text-slate-900">Popular Products</h2>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold text-sm hover:gap-3 transition-all">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {liveProducts.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={`/products/${product.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300">
                  <div className="relative h-44 overflow-hidden bg-slate-50 flex items-center justify-center">
                    {product.image ? (
                      <img src={`${UPLOADS_BASE}${product.image}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Package className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-blue-600 font-medium mb-1">{product.category}</p>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1">{product.name}</h3>
                    <p className="text-slate-400 text-xs mb-2">{product.company}</p>
                    <span className="text-slate-900 font-black text-base">${product.price}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-blue-400 font-semibold text-sm mb-2">PLATFORM FEATURES</p>
            <h2 className="text-4xl font-black text-white mb-4">Everything You Need to Succeed</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Built with AI at the core, our platform gives businesses and consumers the tools to thrive in the modern economy.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'AI-Powered Insights', desc: 'Get real-time AI analytics and predictions to make smarter business decisions.', color: 'blue' },
              { icon: Shield, title: 'Verified Businesses', desc: 'All businesses go through a rigorous verification process for your trust and safety.', color: 'emerald' },
              { icon: TrendingUp, title: 'Revenue Growth', desc: 'Businesses on our platform see an average 34% increase in revenue within 6 months.', color: 'amber' },
              { icon: Users, title: 'Customer Management', desc: 'Comprehensive CRM tools to manage, engage, and retain your valuable customers.', color: 'violet' },
              { icon: Package, title: 'Inventory Control', desc: 'Smart inventory management with AI-predicted restock alerts and optimization.', color: 'rose' },
              { icon: Award, title: 'Premium Support', desc: '24/7 dedicated support team ready to help you succeed at every step of the journey.', color: 'teal' },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                <div className={`w-12 h-12 rounded-2xl bg-${f.color}-500/20 flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 text-${f.color}-400`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm mb-2">TESTIMONIALS</p>
            <h2 className="text-4xl font-black text-slate-900 mb-4">What Our Users Say</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-1 mb-4">
                  {Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-slate-800 font-bold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">Ready to Transform Your Business?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Join 12,500+ businesses already using AI Business OS Platform to grow faster and smarter.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-xl text-sm">
                Start Free Today
              </Link>
              <Link to="/businesses" className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-sm">
                Browse Businesses
              </Link>
            </div>
            <p className="text-blue-200 text-xs mt-6">No credit card required. Free forever for small businesses.</p>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
