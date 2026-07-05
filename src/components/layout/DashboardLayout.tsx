import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: 'consumer' | 'business' | 'admin';
  title?: string;
}

export default function DashboardLayout({ children, role = 'consumer', title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex pt-16">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0" />
        <Sidebar role={role} isOpen={sidebarOpen || true} onClose={() => setSidebarOpen(false)} />
        
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          {title && (
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                <Menu className="w-4 h-4 text-slate-600" />
              </button>
              <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            </div>
          )}
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
