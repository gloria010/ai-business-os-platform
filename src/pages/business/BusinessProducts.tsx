import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import StarRating from '../../components/ui/StarRating';
import { useToast } from '../../components/ui/Toast';

const API_BASE = 'http://localhost:5000';

const getImageUrl = (path?: string | null): string => {
  if (!path) return '/placeholder-product.png';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
};

interface InventoryProduct {
  id: number;
  name: string;
  category?: string;
  price?: number | string;
  stock?: number | string;
  image_path?: string | null;
  sku?: string;
  warehouseName?: string;
}

interface DisplayProduct extends InventoryProduct {
  images: string[];
  brand: string;
  originalPrice: number;
  rating: number;
  inStock: boolean;
  stockCount: number;
}

export default function BusinessProducts() {
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS = 8;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/ceo/products`, {
          credentials: 'include',
        });
        const data = await res.json();

        if (data?.success) {
          const mappedProducts = (Array.isArray(data.products) ? data.products : []).map((item: InventoryProduct) => ({
            ...item,
images:     [getImageUrl(item.image_path)],            brand: item.sku || item.warehouseName || 'Business Product',
            originalPrice: Number(item.price) || 0,
            rating: 4.5,
            inStock: Number(item.stock) > 0,
            stockCount: Number(item.stock) || 0,
          }));

          setProducts(mappedProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filtered = products.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paged = filtered.slice((page - 1) * ITEMS, page * ITEMS);

  return (
    <DashboardLayout role="business" title="Product Management">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
{['Product', 'Category', 'Price', 'Stock', 'Rating', 'Status'].map((col) => (                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    Loading products...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                paged.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate max-w-[160px]">{p.name}</p>
                          <p className="text-slate-500 text-xs">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info" size="sm">
                        {p.category || 'Uncategorized'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">${Number(p.price || 0).toFixed(2)}</p>
                        {p.originalPrice > Number(p.price || 0) && (
                          <p className="text-slate-400 text-xs line-through">${p.originalPrice.toFixed(2)}</p>
                        )}
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
                    <td className="px-4 py-3">
                      <StarRating rating={p.rating} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.inStock ? 'success' : 'error'} size="sm">
                        {p.inStock ? 'Active' : 'Out of Stock'}
                      </Badge>
                    </td>
                  </motion.tr>
                ))
              )}
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
