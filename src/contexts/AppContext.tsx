import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, Product, User, Notification } from '../types';
import { mockUser, notifications as mockNotifications } from '../data/mockData';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
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
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity?: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_WISHLIST'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  cart: [],
  wishlist: [],
  notifications: mockNotifications,
  searchQuery: '',
  recentSearches: [],
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, cart: [], wishlist: [] };
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
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
