// changed user added admin 
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, Product, User, Notification } from '../types';
import { notifications as mockNotifications } from '../data/mockData';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  cart: CartItem[];
  wishlist: string[];
  notifications: Notification[];
  searchQuery: string;
  recentSearches: string[];
}

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity?: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_WISHLIST'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  authLoading: true, // true until we've checked /session once
  cart: [],
  wishlist: [],
  notifications: mockNotifications,
  searchQuery: '',
  recentSearches: [],
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, cart: [], wishlist: [] };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };
    case 'ADD_TO_CART': {
      const existing = state.cart.find(i => i.productId === action.payload.product.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(i =>
            i.productId === action.payload.product.id
              ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { productId: action.payload.product.id, product: action.payload.product, quantity: action.payload.quantity || 1 }],
      };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => i.productId !== action.payload) };
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(i =>
          i.productId === action.payload.productId ? { ...i, quantity: action.payload.quantity } : i
        ).filter(i => i.quantity > 0),
      };
    case 'LOAD_CART':
      return { ...state, cart: action.payload };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist.filter(id => id !== action.payload)
          : [...state.wishlist, action.payload],
      };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'ADD_RECENT_SEARCH':
      return {
        ...state,
        recentSearches: [action.payload, ...state.recentSearches.filter(s => s !== action.payload)].slice(0, 8),
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // On first load, check if a session already exists on the backend
  // (e.g. user refreshed the page after logging in)
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const res = await fetch('http://localhost:5000/api/session', {
          credentials: 'include',
        });

        if (!res.ok) {
          if (!cancelled) dispatch({ type: 'SET_USER', payload: null });
          return;
        }

        const data = await res.json();
        if (!cancelled && data.success && data.user) {
          dispatch({ type: 'SET_USER', payload: data.user });
        } else if (!cancelled) {
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (err) {
        if (!cancelled) dispatch({ type: 'SET_USER', payload: null });
      } finally {
        if (!cancelled) dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      }
    }

    checkSession();
    return () => { cancelled = true; };
  }, []);

  // Once we know the user is authenticated, load their saved cart from the
  // server and rehydrate each row with full product details (name, price,
  // images, businessName) since cart_items only stores productId + quantity.
  useEffect(() => {
    if (!state.isAuthenticated) return;
    let cancelled = false;

    async function loadCart() {
      try {
        const res = await fetch('http://localhost:5000/api/user/cart', {
          credentials: 'include',
        });
        if (!res.ok) return;

        const data = await res.json();
        if (!data.success || !Array.isArray(data.items)) return;

        const resolved = await Promise.all(
          data.items.map(async ({ productId, quantity }: { productId: string; quantity: number }) => {
            try {
              const pRes = await fetch(`http://localhost:5000/api/user/products/${productId}`, {
                credentials: 'include',
              });
              const pData = await pRes.json();
              if (!pData.success || !pData.product) return null;

              const p = pData.product;
              const product: Product = {
                ...p,
                images: p.image ? [p.image] : [],
                businessName: p.company,
              };

              return { productId, product, quantity } as CartItem;
            } catch (err) {
              console.error(`[Cart] Failed to resolve product ${productId}:`, err);
              return null;
            }
          })
        );

        if (!cancelled) {
          const validItems = resolved.filter((i): i is CartItem => i !== null);
          dispatch({ type: 'LOAD_CART', payload: validItems });
        }
      } catch (err) {
        console.error('[Cart] Failed to load cart:', err);
      }
    }

    loadCart();
    return () => { cancelled = true; };
  }, [state.isAuthenticated]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}