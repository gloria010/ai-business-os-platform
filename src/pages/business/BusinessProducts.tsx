import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Package, Eye } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import StarRating from '../../components/ui/StarRating';
import { products } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

export default function BusinessProducts() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', description: '' });
  const ITEMS = 8;

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paged = filtered.slice((page - 1) * ITEMS, page * ITEMS);

  return (
    <DashboardLayout role="business" title="Product Management">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
        </div>
        <Button onClick={() => setShowForm(!showForm)} icon={<Plus className="w-4 h-4" />}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
          Add Product
        </Button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">Add New Product</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name</label>
              <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="Enter product name"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price ($)</label>
              <input value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} type="number" placeholder="0.00"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Select category</option>
                <option>Electronics</option><option>Fashion</option><option>Beauty</option><option>Sports</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => { showToast('Product added!', 'success'); setShowForm(false); setNewProduct({ name: '', price: '', category: '', description: '' }); }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600">Save Product</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Status', 'Actions'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate max-w-[160px]">{p.name}</p>
                        <p className="text-slate-500 text-xs">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="info" size="sm">{p.category}</Badge></td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">${p.price}</p>
                      {p.originalPrice > p.price && <p className="text-slate-400 text-xs line-through">${p.originalPrice}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (p.stockCount / 500) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-slate-600">{p.stockCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StarRating rating={p.rating} size="sm" /></td>
                  <td className="px-4 py-3">
                    <Badge variant={p.inStock ? 'success' : 'error'} size="sm">{p.inStock ? 'Active' : 'Out of Stock'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/products/${p.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => showToast('Product deleted', 'error')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">{filtered.length} products</p>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
