import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Package, ShoppingBag, Heart, Bell, User, Settings, LayoutDashboard,
  BarChart2, Users, Tag, FileText, Shield, Star, Truck,
  ClipboardList, TrendingUp, Lightbulb, LogOut, X, LucideIcon, MessageSquare
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface SidebarProps {
  role?: 'consumer' | 'business' | 'admin';
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavLink {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: boolean;
}

const consumerLinks: NavLink[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'My Orders' },
  { href: '/wishlist', icon: Heart, label: 'Wishlist' },
  { href: '/notifications', icon: Bell, label: 'Notifications', badge: true },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

const businessLinks: NavLink[] = [
  { href: '/business', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/businesses', icon: Shield, label: 'Businesses' },
  { href: '/business/products', icon: Package, label: 'Products' },
  { href: '/business/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/business/inventory', icon: ClipboardList, label: 'Employees' },  
  //{ href: '/business/customers', icon: Users, label: 'Customers' },
  { href: '/business/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/business/notifications', icon: Bell, label: 'Notifications', badge: false },
  { href: '/business/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/business/insights', icon: Lightbulb, label: 'AI Insights' },
];

const adminLinks: NavLink[] = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: "/businesses", icon: Shield, label: "Businesses" },
  { href: "/products", icon: Package, label: "Products" },
  { href: "/categories", icon: Tag, label: "Categories" },
  { href: '/admin/consumers', icon: Users, label: 'Consumers' },
  { href: '/admin/orders', icon: Truck, label: 'Orders' },
  { href: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
  { href: '/admin/reports', icon: FileText, label: 'Reports' },
  { href: '/admin/approvals', icon: Star, label: 'Approvals' },
];

// Roles allowed to see specific hrefs, regardless of which link-set is passed in.
// Anything not listed here is shown to everyone the base link-set already includes.
const BUSINESSES_ALLOWED = ['business_owner', 'employee', 'admin'];
const ADMIN_ONLY_PREFIXES = ['/admin'];

export default function Sidebar({ role = 'consumer', isOpen = true, onClose }: SidebarProps) {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const actualRole = state.user?.role; // the REAL logged-in role, from session/login
//db part
  console.log('SIDEBAR DEBUG — actualRole:', actualRole, 'full user:', state.user);
  const baseLinks = role === 'business' ? businessLinks : role === 'admin' ? adminLinks : consumerLinks;

  // Safety filter: even if a page passes the wrong `role` prop, links are
  // still gated by the actual logged-in user's role.
  const links = baseLinks.filter(link => {
    if (link.href === '/businesses') {
      return actualRole ? BUSINESSES_ALLOWED.includes(actualRole) : false;
    }
    if (ADMIN_ONLY_PREFIXES.some(prefix => link.href.startsWith(prefix))) {
      return actualRole === 'admin';
    }
    return true;
  });

  const unreadNotifs = state.notifications.filter(n => !n.read).length;

  const roleColors = {
    consumer: 'from-blue-600 to-indigo-600',
    business: 'from-emerald-600 to-teal-600',
    admin: 'from-violet-600 to-purple-600',
  };
  const roleLabels = { consumer: 'Consumer', business: 'Business Owner', admin: 'Admin' };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 z-30 flex flex-col shadow-xl lg:shadow-none transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className={`p-5 bg-gradient-to-r ${roleColors[role]} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={state.user?.avatar || ''} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-white/30" />
              <div>
                <p className="text-white font-semibold text-sm">{state.user?.name || 'Guest'}</p>
                <p className="text-white/70 text-xs">{roleLabels[role]}</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white lg:hidden">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {links.map(link => {
            const active = location.pathname === link.href;
            const Icon = link.icon;
            const showBadge = link.badge && unreadNotifs > 0;
            return (
              <Link key={link.href} to={link.href} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${active ? `bg-gradient-to-r ${roleColors[role]} text-white shadow-md` : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="flex-1">{link.label}</span>
                {showBadge && (
                  <span className={`w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center ${active ? 'bg-white/30 text-white' : 'bg-red-500 text-white'}`}>{unreadNotifs}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 flex-shrink-0">
          {role !== 'consumer' && (
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 mb-0.5">
              <Home className="w-4 h-4 text-slate-400" />
              Consumer View
            </Link>
          )}
          <button onClick={() => dispatch({ type: 'LOGOUT' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
}