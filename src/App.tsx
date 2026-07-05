import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './components/ui/Toast';
import AIChatWidget from './components/AIChatWidget';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ConsumerDashboard from './pages/ConsumerDashboard';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import BusinessesPage from './pages/BusinessesPage';
import BusinessProfilePage from './pages/BusinessProfilePage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

// Business Dashboard
import BusinessDashboard from './pages/business/BusinessDashboard';
import BusinessProducts from './pages/business/BusinessProducts';
import BusinessOrders from './pages/business/BusinessOrders';
import BusinessAnalytics from './pages/business/BusinessAnalytics';
import BusinessInsights from './pages/business/BusinessInsights';

// Admin Dashboard
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminAnalytics from './pages/admin/AdminAnalytics';

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:id" element={<CategoriesPage />} />
            <Route path="/businesses" element={<BusinessesPage />} />
            <Route path="/businesses/:id" element={<BusinessProfilePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Consumer Dashboard */}
            <Route path="/dashboard" element={<ConsumerDashboard />} />
            <Route path="/dashboard/orders" element={<OrdersPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/settings" element={<ProfilePage />} />

            {/* Business Dashboard */}
            <Route path="/business" element={<BusinessDashboard />} />
            <Route path="/business/products" element={<BusinessProducts />} />
            <Route path="/business/orders" element={<BusinessOrders />} />
            <Route path="/business/analytics" element={<BusinessAnalytics />} />
            <Route path="/business/insights" element={<BusinessInsights />} />
            <Route path="/business/inventory" element={<BusinessProducts />} />
            <Route path="/business/customers" element={<BusinessDashboard />} />
            <Route path="/business/notifications" element={<NotificationsPage />} />
            <Route path="/business/settings" element={<ProfilePage />} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/approvals" element={<AdminApprovals />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/businesses" element={<AdminDashboard />} />
            <Route path="/admin/consumers" element={<AdminDashboard />} />
            <Route path="/admin/categories" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminDashboard />} />
            <Route path="/admin/reports" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<ProfilePage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AIChatWidget />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}
