import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Zap,
  Building2,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    businessCategory: '',
    employeeRole: '',
    password: '',
    confirm: '',
    role: 'consumer',
    agree: false,
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();
  const navigate = useNavigate();

  const update = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.name.trim())
      e.name = 'Name is required';

    if (!form.email)
      e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Invalid email';

    if (!form.phone.trim()) {
  e.phone = 'Phone number is required';
} else if (!/^[6-9]\d{9}$/.test(form.phone)) {
  e.phone = 'Enter a valid 10-digit phone number';
}

    if (form.role === 'business_owner' && !form.company.trim())
      e.company = 'Company name is required';

    if (form.role === 'business_owner' && !form.businessCategory)
      e.businessCategory = 'Business category is required';

    if (form.role === 'employee' && !form.company)
  e.company = 'Please select a company';

if (form.role === 'employee' && !form.employeeRole)
  e.employeeRole = 'Please select a role';

    if (!form.password || form.password.length < 8)
      e.password = 'Minimum 8 characters';

    if (form.password !== form.confirm)
      e.confirm = 'Passwords do not match';

    if (!form.agree)
      e.agree = 'You must accept the terms';

    return e;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        'http://localhost:5000/api/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
  name: form.name,
  email: form.email,
  phone: form.phone,
  company: form.company,
  businessCategory: form.businessCategory,
  employeeRole: form.employeeRole,
  password: form.password,
  role: form.role
})
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showToast(
          data.message || 'Registration failed',
          'error',
          'Error'
        );
        return;
      }

      showToast(
        'Account created! Welcome to AIBizOS!',
        'success',
        'Registration Successful'
      );

      navigate('/login');
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Unable to reach the server',
        'error',
        'Connection Error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>

            <span className="font-bold text-slate-800 text-lg">
              AI<span className="text-blue-600">Biz</span>OS
            </span>
          </Link>

          <Link
            to="/login"
            className="text-sm text-blue-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-1">
          Create Account
        </h1>

        <p className="text-slate-500 text-sm mb-6">
          Join 2.4M+ users on the AI Business Platform
        </p>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            {
              value: 'consumer',
              label: 'Consumer',
              icon: User,
              desc: 'Shop & discover',
            },
            {
              value: 'business_owner',
              label: 'Business Owner',
              icon: Building2,
              desc: 'Grow your business',
            },
            {
    value: 'employee',
    label: 'Employee',
    icon: User,
    desc: 'Join a company'
  }
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => update('role', r.value)}
              type="button"
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                form.role === r.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  form.role === r.value
                    ? 'bg-blue-600'
                    : 'bg-slate-100'
                }`}
              >
                <r.icon
                  className={`w-4 h-4 ${
                    form.role === r.value
                      ? 'text-white'
                      : 'text-slate-500'
                  }`}
                />
              </div>

              <div>
                <p
                  className={`text-xs font-semibold ${
                    form.role === r.value
                      ? 'text-blue-700'
                      : 'text-slate-700'
                  }`}
                >
                  {r.label}
                </p>

                <p className="text-xs text-slate-400">
                  {r.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* Full Name */}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name
                    ? 'border-red-400'
                    : 'border-slate-200'
                }`}
              />
            </div>

            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                type="email"
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email
                    ? 'border-red-400'
                    : 'border-slate-200'
                }`}
              />
            </div>

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Phone Number
            </label>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
  value={form.phone}
  onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
  placeholder="+91 9876543210"
  maxLength={10}
  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    errors.phone ? 'border-red-400' : 'border-slate-200'
  }`}
/>
            </div>
            {errors.phone && (
  <p className="text-red-500 text-xs mt-1">
    {errors.phone}
  </p>
)}
          </div>
                    {/* Business Owner Fields */}
          {form.role === 'business_owner' && (
            <>
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company Name
                </label>

                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    value={form.company}
                    onChange={(e) => update('company', e.target.value)}
                    placeholder="Enter your company name"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.company
                        ? 'border-red-400'
                        : 'border-slate-200'
                    }`}
                  />
                </div>

                {errors.company && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.company}
                  </p>
                )}
              </div>

              {/* Business Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Business Category
                </label>

                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <select
                    value={form.businessCategory}
                    onChange={(e) =>
                      update('businessCategory', e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.businessCategory
                        ? 'border-red-400'
                        : 'border-slate-200'
                    }`}
                  >
                    <option value="">Select Business Category</option>

                    <option value="Electronics">
                      Electronics
                    </option>

                    <option value="Fashion">
                      Fashion
                    </option>

                    <option value="Furniture">
                      Furniture
                    </option>

                    <option value="Sports">
                      Sports
                    </option>

                    <option value="Beauty & Wellness">
                      Beauty & Wellness
                    </option>

                    <option value="Agriculture">
                      Agriculture
                    </option>

                    <option value="Healthcare">
                      Healthcare
                    </option>

                    <option value="Education">
                      Education
                    </option>

                    <option value="Grocery">
                      Grocery
                    </option>

                    <option value="Restaurant">
                      Restaurant
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {errors.businessCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.businessCategory}
                  </p>
                )}
              </div>
            </>
          )}

          {form.role === 'employee' && (
  <>
    {/* Company */}
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Company
      </label>

      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        <select
          value={form.company}
          onChange={(e) => update('company', e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.company
              ? 'border-red-400'
              : 'border-slate-200'
          }`}
        >
          <option value="">Select Company</option>

          <option>TechZone Store</option>
          <option>Urban Fashion Hub</option>
          <option>Luxe Living Furniture</option>
          <option>ProSports Gear</option>
          <option>Glow Beauty Studio</option>
          <option>Green Harvest Farm</option>
          <option>Medicare Plus</option>
          <option>EduLearn Academy</option>
          <option>FreshMart Grocery</option>
          <option>NexGen Mobiles</option>
          <option>Bella Boutique</option>
          <option>The Gourmet Kitchen</option>
          <option>Others</option>
        </select>
      </div>

      {errors.company && (
        <p className="text-red-500 text-xs mt-1">
          {errors.company}
        </p>
      )}
    </div>

    {/* Employee Role */}
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Role
      </label>

      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        <select
          value={form.employeeRole}
          onChange={(e) => update('employeeRole', e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.employeeRole
              ? 'border-red-400'
              : 'border-slate-200'
          }`}
        >
          <option value="">Select Role</option>

          <option>HR Manager</option>
          <option>HR Executive</option>
          <option>Recruiter</option>
          <option>Sales Manager</option>
          <option>Sales Executive</option>
          <option>Sales Associate</option>
          <option>Inventory Manager</option>
          <option>Inventory Executive</option>
          <option>Store Manager</option>
          <option>Marketing Executive</option>
          <option>Customer Support Executive</option>
          <option>Accountant</option>
          <option>Operations Executive</option>
          <option>Software Engineer</option>
        </select>
      </div>

      {errors.employeeRole && (
        <p className="text-red-500 text-xs mt-1">
          {errors.employeeRole}
        </p>
      )}
    </div>
  </>
)}
                    <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 chars"
                  className={`w-full pl-10 pr-8 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password
                      ? 'border-red-400'
                      : 'border-slate-200'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPass ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  value={form.confirm}
                  onChange={(e) => update('confirm', e.target.value)}
                  type="password"
                  placeholder="Repeat password"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirm
                      ? 'border-red-400'
                      : 'border-slate-200'
                  }`}
                />
              </div>

              {errors.confirm && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirm}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => update('agree', e.target.checked)}
                className="mt-0.5 rounded text-blue-600"
              />

              <span className="text-sm text-slate-600">
                I agree to the{' '}
                <Link
                  to="#"
                  className="text-blue-600 hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="#"
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

            {errors.agree && (
              <p className="text-red-500 text-xs mt-1">
                {errors.agree}
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}