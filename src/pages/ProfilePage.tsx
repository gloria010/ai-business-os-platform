import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Settings, Bell, Shield, Lock, Save, Camera } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../components/ui/Toast';

export default function ProfilePage() {
  const { state } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'personal' | 'addresses' | 'security' >('personal');
  const [form, setForm] = useState({ name: state.user?.name || '', email: state.user?.email || '', phone: state.user?.phone || '' });

  const saveProfile = () => showToast('Profile updated successfully!', 'success');

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Security', icon: Shield },

  ];

  return (
    <DashboardLayout role="consumer" title="My Profile">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Avatar Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
            <div className="relative inline-block mb-4">
              <img src={state.user?.avatar} alt="" className="w-24 h-24 rounded-2xl object-cover mx-auto" />
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700">
                <Camera className="w-4 h-4" />
              </button>
            </div>
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
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 p-6">
            {activeTab === 'personal' && (
              <>
                <h2 className="font-bold text-slate-800 text-lg mb-6">Personal Information</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
                <Button onClick={saveProfile} className="mt-6" icon={<Save className="w-4 h-4" />}>Save Changes</Button>
              </>
            )}

            {activeTab === 'addresses' && (
              <>
                <h2 className="font-bold text-slate-800 text-lg mb-6">Address Book</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {state.user?.addresses.map(addr => (
                    <div key={addr.id} className={`p-4 border-2 rounded-xl ${addr.isDefault ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800 text-sm">{addr.label}</span>
                        {addr.isDefault && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Default</span>}
                      </div>
                      <p className="text-slate-600 text-sm">{addr.name}</p>
                      <p className="text-slate-500 text-sm">{addr.line1}</p>
                      <p className="text-slate-500 text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                      <p className="text-slate-500 text-sm">{addr.phone}</p>
                    </div>
                  ))}
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 transition-colors min-h-[140px]">
                    <MapPin className="w-6 h-6 text-slate-300" />
                    <span className="text-sm text-slate-400 font-medium">Add New Address</span>
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
                      <input type="password" placeholder="Enter current password"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" placeholder="Enter new password"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <Button onClick={() => showToast('Password updated!', 'success')} icon={<Lock className="w-4 h-4" />}>Update Password</Button>
                </div>
              </>
            )}

            
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}