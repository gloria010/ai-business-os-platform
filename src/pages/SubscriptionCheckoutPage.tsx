import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  Smartphone,
  Landmark,
  CheckCircle,
  Tag,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function SubscriptionCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const plan = location.state?.plan || "Professional";
  const price = location.state?.price || 999;

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [subscriptionDate, setSubscriptionDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Preview-only math for display — server recalculates everything for real
  const gst = Math.round((price - discount) * 0.18);
  const total = price - discount + gst;

  const [promoLoading, setPromoLoading] = useState(false);

  const applyPromo = async () => {
    const code = promo.trim();

    if (!code) {
      alert("Enter a promo code first");
      return;
    }

    setPromoLoading(true);

    try {
      const res = await fetch("/api/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan, promo: code }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        alert("Could not validate code right now. Please try again.");
        setPromoLoading(false);
        return;
      }

      const data = await res.json();

      if (!data.success) {
        setDiscount(0);
        setPromoApplied(false);
        alert(data.message || "Invalid promo code");
        setPromoLoading(false);
        return;
      }

      setDiscount(data.discount);
      setPromoApplied(true);
    } catch (err) {
      console.error("Promo validation error:", err);
      alert("Could not validate code right now. Please try again.");
    } finally {
      setPromoLoading(false);
    }
  };

  const payNow = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          plan,
          promo,
          paymentMethod,
        }),
      });

      // Guard against non-JSON responses (e.g. 404 HTML page from a
      // misconfigured proxy) so we don't crash on res.json()
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", res.status, text);
        setErrorMsg(
          `Unexpected server response (${res.status}). Check that the backend is running and the API proxy is configured.`
        );
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Payment failed. Please try again.");
        setLoading(false);
        return;
      }

      setSubscriptionId(data.subscriptionId);
      setSubscriptionDate(data.subscriptionDate);
      setPaymentSuccess(true);
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-black text-slate-900 mb-3">
              Subscription Checkout
            </h1>

            <p className="text-slate-500 mb-12">
              Complete your subscription and unlock premium business features.
            </p>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Side */}
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-8">
                {/* Payment Method */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    Payment Method
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { name: "UPI", icon: Smartphone },
                      { name: "Credit Card", icon: CreditCard },
                      { name: "Debit Card", icon: CreditCard },
                      { name: "Net Banking", icon: Landmark },
                    ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => setPaymentMethod(item.name)}
                        className={`border rounded-2xl p-5 flex items-center gap-4 transition-all ${
                          paymentMethod === item.name
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 hover:border-blue-400"
                        }`}
                      >
                        <item.icon className="w-6 h-6 text-blue-600" />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mt-10">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    Promo Code
                  </h2>

                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={promo}
                        onChange={(e) => {
                          setPromo(e.target.value);
                          setPromoApplied(false);
                          setDiscount(0);
                        }}
                        placeholder="Enter promo code"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={applyPromo}
                      type="button"
                      disabled={promoLoading}
                      className="bg-blue-600 text-white px-6 rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {promoLoading ? "Checking..." : "Apply"}
                    </button>
                  </div>

                  {promoApplied && (
                    <p className="text-green-600 text-sm mt-3 font-medium">
                      ✅ Promo code applied — ₹{discount} off!
                    </p>
                  )}
                </div>

                {errorMsg && (
                  <p className="text-red-600 text-sm mt-6 font-medium">
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-3xl shadow-lg p-8 h-fit sticky top-24">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Plan</span>
                    <span className="font-semibold">{plan}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Subscription</span>
                    <span className="font-semibold">₹{price}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-500">GST (18%)</span>
                    <span className="font-semibold">₹{gst}</span>
                  </div>

                  <hr />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={payNow}
                  disabled={loading}
                  className={`w-full mt-8 py-3 rounded-xl font-semibold transition-all ${
                    loading
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {loading ? "Processing..." : `Pay ₹${total}`}
                </button>

                <p className="text-xs text-slate-500 text-center mt-4">
                  Secure payment powered by AI Business OS
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Success Modal */}
        {paymentSuccess && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-10 max-w-md w-full mx-4 text-center shadow-2xl"
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-5" />

              <h2 className="text-3xl font-black text-slate-800 mb-3">
                {plan === "Starter"
                  ? "🎉 Starter Activated!"
                  : plan === "Professional"
                  ? "⭐ Professional Activated!"
                  : "👑 Enterprise Activated!"}
              </h2>

              <p className="text-slate-500 mb-6">
                {plan === "Starter" &&
                  "Welcome! Your Starter plan is now active."}
                {plan === "Professional" &&
                  "Congratulations! Your Professional plan has been activated successfully."}
                {plan === "Enterprise" &&
                  "Welcome to Enterprise! You now have unlimited access to AI Business OS."}
              </p>

              <div className="bg-slate-100 rounded-xl p-4 text-left mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">Subscription ID</span>
                  <span className="font-semibold">{subscriptionId}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Subscribed On</span>
                  <span className="font-semibold">{subscriptionDate}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/business")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
              >
                Go to Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}