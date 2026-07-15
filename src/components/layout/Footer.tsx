import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, ArrowRight, CreditCard } from 'lucide-react';

export default function Footer() {


  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl">AI<span className="text-blue-400">Biz</span>OS</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              The all-in-one AI-powered business operating system. Connect, manage, and grow your business with intelligent insights.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Mail className="w-4 h-4 text-blue-400" /> support@aibizos.com</div>
              <div className="flex items-center gap-2 text-sm text-slate-400"><Phone className="w-4 h-4 text-blue-400" /> +91 9380178776</div>
              <div className="flex items-center gap-2 text-sm text-slate-400"><MapPin className="w-4 h-4 text-blue-400" /> MOUNT CARMEL UNIVERSITY</div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2.5">
              {['About Us', 'Careers', 'Blog', 'Press', 'Partners', 'Investors'].map(item => (
                <li key={item}><Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm hover:text-blue-400 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          

          {/* Resources */}
          <ul className="space-y-2.5">
  {[
    'Documentation',
    'API Reference',
    'Tutorials',
    'Help Center',
    'Community',
    'Status',
  ].map(item => (
    <li key={item}>
      <Link
        to="#"
        className="text-sm hover:text-blue-400 transition-colors"
      >
        {item}
      </Link>
    </li>
  ))}

  <li>
    <Link
  to="/feedback"
  className="
    inline-flex
    items-center
    gap-2
    px-5
    py-3
    mt-2
    rounded-xl
    bg-gradient-to-r
    from-blue-600
    to-indigo-600
    text-white
    font-semibold
    shadow-lg
    hover:from-blue-700
    hover:to-indigo-700
    hover:scale-105
    transition-all
    duration-300
  "
>
  💬 Give Feedback
</Link>
  </li>
</ul>

          {/* Newsletter */}
          {/* Subscription */}
<div>
  <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
    Subscription Plans
  </h3>

  <p className="text-sm text-slate-400 mb-5">
    Choose the perfect plan for your business and unlock AI Business OS features.
  </p>

  <Link
    to="/subscription"
    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
  >
    View Plans
    <ArrowRight className="w-4 h-4" />
  </Link>

  <p className="text-xs text-slate-500 mt-4">
    Starter • Professional • Enterprise
  </p>

  <div className="flex gap-3 mt-6">
    {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
      <a
        key={i}
        href="#"
        className="w-8 h-8 bg-slate-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
      >
        <Icon className="w-3.5 h-3.5" />
      </a>
    ))}
  </div>
</div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; 2026 AI Business OS Platform. All rights reserved.</p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'].map(item => (
              <Link key={item} to="#" className="hover:text-slate-300 transition-colors">{item}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
