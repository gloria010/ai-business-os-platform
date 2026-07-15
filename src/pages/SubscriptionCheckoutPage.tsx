import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  Smartphone,
  Landmark,
  CheckCircle,
  Tag,
  Building2,
  Mail,
  Phone,
  User,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function SubscriptionCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const plan = location.state?.plan || "Professional";
  const price = location.state?.price || 999;

const expiryDate = new Date();
expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [business, setBusiness] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    gst: "",
    promo: "",
  });

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

const [discount, setDiscount] = useState(0);
 const gst = Math.round(price * 0.18);

const subtotal = price - discount;

const total = subtotal + gst;

const [promoApplied, setPromoApplied] = useState(false);

const subscriptionId =
  "SUB-" +
  new Date().getFullYear() +
  "-" +
  Math.floor(10000 + Math.random() * 90000);

  const update = (key: string, value: string) => {
    setBusiness((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validate = () => {

  const e: Record<string, string> = {};

  if (!business.businessName.trim())
    e.businessName = "Business name is required";

  if (!business.ownerName.trim())
    e.ownerName = "Owner name is required";

  if (!business.email.trim())
    e.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(business.email))
    e.email = "Invalid email";

  if (!business.phone.trim())
    e.phone = "Phone number is required";
  else if (!/^[6-9]\d{9}$/.test(business.phone))
    e.phone = "Enter a valid 10-digit phone number";

  setErrors(e);

  return Object.keys(e).length === 0;
};

const payNow = () => {

  if (!validate()) return;

  setPaymentSuccess(true);

};
const isFormValid =
  business.businessName.trim() &&
  business.ownerName.trim() &&
  /\S+@\S+\.\S+/.test(business.email) &&
  /^[6-9]\d{9}$/.test(business.phone);

const applyPromo = () => {

  const code = business.promo.toUpperCase();

  if (code === "WELCOME10") {

    setDiscount(Math.round(price * 0.10));

    setPromoApplied(true);

  }

  else if (code === "AIBIZ20") {

    setDiscount(Math.round(price * 0.20));

    setPromoApplied(true);

  }

  else if (code === "STARTUP50") {

    setDiscount(50);

    setPromoApplied(true);

  }

  else {

    setDiscount(0);

    setPromoApplied(false);

    alert("Invalid Promo Code");

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

                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  Business Details
                </h2>

                <div className="grid md:grid-cols-2 gap-5">

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Business Name
                    </label>

                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        value={business.businessName}
                        onChange={(e) =>
                          update("businessName", e.target.value)
                        }
                        placeholder="Enter business name"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {errors.email && (
  <p className="text-red-500 text-xs mt-1">
    {errors.email}
  </p>
)}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Owner Name
                    </label>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        value={business.ownerName}
                        onChange={(e) =>
                          update("ownerName", e.target.value)
                        }
                        placeholder="Enter owner name"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        type="email"
                        value={business.email}
                        onChange={(e) =>
                          update("email", e.target.value)
                        }
                        placeholder="business@email.com"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        value={business.phone}
                        onChange={(e) =>
                          update("phone", e.target.value)
                        }
                        placeholder="9876543210"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {errors.phone && (
  <p className="text-red-500 text-xs mt-1">
    {errors.phone}
  </p>
)}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      GST Number (Optional)
                    </label>

                    <input
                      value={business.gst}
                      onChange={(e) =>
                        update("gst", e.target.value)
                      }
                      placeholder="22AAAAA0000A1Z5"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                </div>

                {/* Payment Method */}

                <div className="mt-10">

                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    Payment Method
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">

                    {[
                      {
                        name: "UPI",
                        icon: Smartphone,
                      },
                      {
                        name: "Credit Card",
                        icon: CreditCard,
                      },
                      {
                        name: "Debit Card",
                        icon: CreditCard,
                      },
                      {
                        name: "Net Banking",
                        icon: Landmark,
                      },
                    ].map((item) => (

                      <button
                        key={item.name}
                        onClick={() =>
                          setPaymentMethod(item.name)
                        }
                        className={`border rounded-2xl p-5 flex items-center gap-4 transition-all ${
                          paymentMethod === item.name
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 hover:border-blue-400"
                        }`}
                      >

                        <item.icon className="w-6 h-6 text-blue-600" />

                        <span className="font-medium">
                          {item.name}
                        </span>

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
                        value={business.promo}
                        onChange={(e) =>
                          update("promo", e.target.value)
                        }
                        placeholder="Enter promo code"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                    </div>
                    <button
  onClick={applyPromo}
  type="button"
  className="bg-blue-600 text-white px-6 rounded-xl hover:bg-blue-700">
  Apply
</button>

                  </div>
                  {promoApplied && (
  <p className="text-green-600 text-sm mt-3 font-medium">
    ✅ Promo code applied successfully!
  </p>
)}

                </div>

              </div>              {/* Order Summary */}
              <div className="bg-white rounded-3xl shadow-lg p-8 h-fit sticky top-24">

                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Selected Plan
                    </span>

                    <span className="font-semibold">
                      {plan}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Subscription
                    </span>

                    <span className="font-semibold">
                      ₹{price}
                    </span>
                  </div>
                  {discount > 0 && (
  <div className="flex justify-between text-green-600">
    <span>Discount</span>
    <span>-₹{discount}</span>
  </div>
)}

                  <div className="flex justify-between">
  <span className="text-slate-500">
    GST (18%)
  </span>

  <span className="font-semibold">
    ₹{Math.round((price - discount) * 0.18)}
  </span>
</div>

                  <hr />

                  <div className="flex justify-between text-xl font-bold">

                    <span>Total</span>

                   <span className="text-blue-600">
  ₹{price - discount + Math.round((price - discount) * 0.18)}
</span>

                  </div>

                </div>

                <button
  onClick={payNow}
  disabled={!isFormValid}
  className={`w-full mt-8 py-3 rounded-xl font-semibold transition-all ${
    isFormValid
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-slate-300 text-slate-500 cursor-not-allowed"
  }`}
>
  Pay ₹{total}
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
                  <span className="text-slate-500">
                    Subscription ID
                  </span>

                  <span className="font-semibold">
                    {subscriptionId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Valid Until
                  </span>

                  <span className="font-semibold">
                    {expiryDate.toLocaleDateString()}
                  </span>
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
            