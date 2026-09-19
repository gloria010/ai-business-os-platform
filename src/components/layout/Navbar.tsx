import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Bell, User, Menu, X, Zap, Heart, ChevronDown } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Badge from '../ui/Badge';

const BUSINESSES_ALLOWED = ['business_owner', 'employee', 'admin'];

export default function Navbar() {
  const { state, dispatch } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = state.cart.reduce((s, i) => s + i.quantity, 0);
  const unreadNotifs = state.notifications.filter(n => !n.read).length;
  const role = state.user?.role;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/categories', label: 'Categories' },
    ...(role && BUSINESSES_ALLOWED.includes(role) ? [{ href: '/businesses', label: 'Businesses' }] : []),
    ...(role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch({ type: 'ADD_RECENT_SEARCH', payload: searchQuery });
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${transparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className={`font-bold text-lg hidden sm:block transition-colors ${transparent ? 'text-white' : 'text-slate-800'}`}>
                AI<span className="text-blue-500">Biz</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.href} to={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.href ? (transparent ? 'text-white bg-white/20' : 'text-blue-600 bg-blue-50') : (transparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50')}`}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}>
                <Search className="w-4 h-4" />
              </button>

              {state.isAuthenticated ? (
                <>
                  <Link to="/wishlist" className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors relative ${transparent ? 'text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}>
                    <Heart className="w-4 h-4" />
                    {state.wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{state.wishlist.length}</span>}
                  </Link>
                  <Link to="/cart" className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors relative ${transparent ? 'text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}>
                    <ShoppingCart className="w-4 h-4" />
                    {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
                  </Link>
                  <Link to="/notifications" className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors relative ${transparent ? 'text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}>
                    <Bell className="w-4 h-4" />
                    {unreadNotifs > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadNotifs}</span>}
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors group">
                  <span className={`text-sm font-medium hidden xl:block transition-colors ${transparent ? 'text-white group-hover:text-slate-800' : 'text-slate-700'}`}>
                  {state.user?.name}
                 </span>
                  <ChevronDown className={`w-3 h-3 hidden xl:block transition-colors ${transparent ? 'text-white group-hover:text-slate-800' : 'text-slate-400'}`} />
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-800'}`}>Login</Link>
                  <Link to="/register" className="text-sm font-semibold px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/25">Register</Link>
                </div>
              )}

              <button onClick={() => setMenuOpen(!menuOpen)} className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-100 shadow-lg overflow-hidden">
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(link => (
                  <Link key={link.href} to={link.href} onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === link.href ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {link.label}
                  </Link>
                ))}
                {!state.isAuthenticated && (
                  <div className="pt-2 flex gap-2">
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium border border-slate-200 rounded-xl text-slate-600">Login</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl">Register</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <form onSubmit={handleSearch} className="flex items-center p-4 gap-3">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products, businesses, categories..."
                  className="flex-1 text-slate-800 placeholder:text-slate-400 outline-none text-lg" />
                <button type="button" onClick={() => setSearchOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </form>
              {state.recentSearches.length > 0 && (
                <div className="px-4 pb-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-3 mb-2">Recent Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {state.recentSearches.map(s => (
                      <button key={s} onClick={() => { navigate(`/search?q=${encodeURIComponent(s)}`); setSearchOpen(false); }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-sm text-slate-600 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}