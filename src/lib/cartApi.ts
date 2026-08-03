const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function addCartItem(productId: string, quantity = 1) {
  const res = await fetch(`${API_BASE}/api/user/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ productId, quantity }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to add item to cart');
  }

  return data;
}
