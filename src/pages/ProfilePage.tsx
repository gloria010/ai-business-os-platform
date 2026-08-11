import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Lock, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../components/ui/Toast';

export default function ProfilePage() {
  const { state } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const updatePassword = async () => {
    if (!currentPassword || !newPassword) {
      showToast('Enter both current and new password.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();

      if (!json.success) {
        showToast(json.message || 'Failed to update password.', 'error');
        return;
      }

      showToast('Password updated!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="consumer" title="My Profile">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Avatar Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
            <img src={state.user?.avatar} alt="" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4" />
            <h3 className="font-bold text-slate-800">{state.user?.name}</h3>
            <p className="text-slate-500 text-sm">{state.user?.email}</p>
            <div className="mt-3 inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
              {state.user?.role.replace('_', ' ')}
            </div>
            <p className="text-slate-400 text-xs mt-3">Member since {state.user?.joinedAt}</p>
          </div>

          {/* Tab Nav */}
          <div className="bg-white rounded-2xl border border-slate-100 mt-4 overflow-hidden">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 p-6"
          >
            {activeTab === 'personal' && (
              <>
                <h2 className="font-bold text-slate-800 text-lg mb-6">Personal Information</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <div className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700">
                        {state.user?.name || '—'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <div className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700">
                        {state.user?.email || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h2 className="font-bold text-slate-800 text-lg mb-6">Security Settings</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={updatePassword}
                    disabled={saving}
                    icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}