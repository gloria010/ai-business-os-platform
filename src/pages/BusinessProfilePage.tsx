import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, Shield, Calendar, Users, ExternalLink } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import StarRating from '../components/ui/StarRating';
import Badge from '../components/ui/Badge';
import { businesses, products, reviews } from '../data/mockData';

export default function BusinessProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'gallery'>('products');
  const biz = businesses.find(b => b.id === id);

  if (!biz) return (
    <PublicLayout>
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Business Not Found</h2>
          <Link to="/businesses" className="text-blue-600 hover:underline">Back to Businesses</Link>
        </div>
      </div>
    </PublicLayout>
  );

  const bizProducts = products.filter(p => p.businessId === biz.id);
  const bizReviews = reviews.slice(0, 3);
  const similar = businesses.filter(b => b.categoryId === biz.categoryId && b.id !== biz.id).slice(0, 3);

  return (
    <PublicLayout>
      <div className="pt-16 min-h-screen bg-slate-50">
        {/* Cover */}
        <div className="relative h-64 overflow-hidden">
          <img src={biz.coverImage} alt={biz.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>

        {/* Profile Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 flex flex-col sm:flex-row sm:items-end gap-4 pb-6">
            <img src={biz.logo} alt={biz.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl bg-white flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-white sm:text-slate-900">{biz.name}</h1>
                {biz.verified && (
                  <span className="flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm mt-0.5">{biz.category} · {biz.location}</p>
              <StarRating rating={biz.rating} showValue reviewCount={biz.reviewCount} size="sm" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <p className="text-slate-600 leading-relaxed mb-6">{biz.description}</p>

              {/* Tabs */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="flex border-b border-slate-100">
                  {(['products', 'reviews', 'gallery'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                      {tab === 'products' ? `Products (${bizProducts.length})` : tab === 'reviews' ? `Reviews (${biz.reviewCount})` : 'Gallery'}
                    </button>
                  ))}
                </div>
                <div className="p-6">
                  {activeTab === 'products' && (
                    bizProducts.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-8">No products listed yet</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {bizProducts.map(p => (
                          <Link key={p.id} to={`/products/${p.id}`} className="group bg-slate-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-32 overflow-hidden">
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="p-3">
                              <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{p.name}</h4>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-blue-600 font-bold">${p.price}</span>
                                <StarRating rating={p.rating} size="sm" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )
                  )}
                  {activeTab === 'reviews' && (
                    <div className="space-y-5">
                      {bizReviews.map(r => (
                        <div key={r.id} className="flex gap-4 pb-5 border-b border-slate-100 last:border-0">
                          <img src={r.userAvatar} alt={r.userName} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-800 text-sm">{r.userName}</span>
                              <span className="text-slate-400 text-xs">{r.date}</span>
                            </div>
                            <StarRating rating={r.rating} size="sm" />
                            <p className="text-slate-600 text-sm mt-2">{r.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'gallery' && (
                    <div className="grid grid-cols-3 gap-3">
                      {(biz.gallery.length > 0 ? biz.gallery : [biz.coverImage, biz.logo]).map((img, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden">
                          <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Contact Info */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-800 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {[
                    { icon: Phone, text: biz.phone },
                    { icon: Mail, text: biz.email },
                    { icon: Globe, text: biz.website },
                    { icon: MapPin, text: biz.location },
                    { icon: Calendar, text: `Founded ${biz.founded}` },
                    { icon: Users, text: `${biz.employees} employees` },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-slate-600 text-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-800 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {biz.tags.map(tag => <Badge key={tag} variant="info">{tag}</Badge>)}
                </div>
              </div>

              {/* Similar */}
              {similar.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h3 className="font-bold text-slate-800 mb-4">Similar Businesses</h3>
                  <div className="space-y-3">
                    {similar.map(b => (
                      <Link key={b.id} to={`/businesses/${b.id}`} className="flex items-center gap-3 hover:bg-slate-50 rounded-xl p-2 -mx-2 transition-colors">
                        <img src={b.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{b.name}</p>
                          <StarRating rating={b.rating} size="sm" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
