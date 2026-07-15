import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        dispatch({ type: 'LOGIN', payload: data.user });
        showToast(`Welcome back, ${data.user.name}!`, 'success', 'Login Successful');
        navigate('/dashboard');
      } else {
        setErrors({ password: data.message || 'Invalid email or password' });
        showToast(data.message || 'Invalid email or password', 'error', 'Login Failed');
      }
    } catch (err) {
      console.error(err);
      showToast('Something went wrong. Try again.', 'error', 'Server Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex flex-col bg-gradient-to-br from-blue-600 to-indigo-700 p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/3 translate-y-1/3" />
          </div>
          <div className="relative">
            <Link to="/" className="flex items-center gap-2 mb-12">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl">AIBizOS</span>
            </Link>
            <h2 className="text-3xl font-black text-white mb-4">Welcome Back!</h2>
            <p className="text-blue-200 text-base mb-10">Sign in to access your AI-powered business dashboard and explore thousands of businesses.</p>
            <div className="space-y-4">
              {['AI-powered insights', 'Verified businesses', '2.4M+ happy users', '24/7 support'].map(f => (
                <div key={f} className="flex items-center gap-3 text-blue-100">
                  <div className="w-5 h-5 rounded-full bg-blue-400/30 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">AI<span className="text-blue-600">Biz</span>OS</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Sign in</h1>
          <p className="text-slate-500 text-sm mb-8">Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create one</Link></p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-400' : 'border-slate-200 hover:border-slate-300'}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Your password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.password ? 'border-red-400' : 'border-slate-200 hover:border-slate-300'}`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
              {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" /><span className="text-slate-400 text-xs">OR CONTINUE WITH</span><div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Google', 'Apple'].map(provider => (
                <button key={provider} className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  {provider}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => navigate('/business')} className="text-xs text-slate-500 hover:text-blue-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-blue-200 transition-colors">Business Dashboard</button>
            <button onClick={() => navigate('/admin')} className="text-xs text-slate-500 hover:text-blue-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-blue-200 transition-colors">Admin Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}