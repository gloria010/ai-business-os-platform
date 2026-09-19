import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetLink, setDevResetLink] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error', 'Password Error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.message || 'Something went wrong. Please try again.', 'error', 'Request Failed');
        setLoading(false);
        return;
      }

      setSent(true);
      showToast('Reset link sent!', 'success', 'Check Your Email');
    } catch (err) {
      console.error('Forgot password error:', err);
      showToast('Could not reach the server. Please try again.', 'error', 'Request Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg">AI<span className="text-blue-600">Biz</span>OS</span>
        </Link>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Check Your Email</h2>
            <p className="text-slate-500 text-sm mb-6">
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <Link
              to="/login"
              className="text-blue-600 font-semibold text-sm hover:underline flex items-center gap-2 justify-center"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </motion.div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Forgot Password?</h1>
            <p className="text-slate-500 text-sm mb-8">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Enter Password - ADDED */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Enter Password
                </label>
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Confirm Password - ADDED */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-blue-600 font-semibold text-sm hover:underline flex items-center gap-2 justify-center"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}