import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  MessageCircle,
  Headphones,
  Send,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const update = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.name.trim())
      e.name = "Full name is required.";
    else if (form.name.trim().length < 3)
      e.name = "Please enter at least 3 characters.";

    if (!form.email.trim())
      e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Please enter a valid email address.";

    if (!form.phone.trim())
      e.phone = "Phone number is required.";
    else if (!/^[6-9]\d{9}$/.test(form.phone))
      e.phone = "Please enter a valid 10-digit phone number.";

    if (!form.subject.trim())
      e.subject = "Subject is required.";

    if (!form.message.trim())
      e.message = "Message is required.";
    else if (form.message.trim().length < 15)
      e.message =
        "Message should contain at least 15 characters.";

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSuccess(true);

    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });

    setErrors({});
  };

  const isFormValid =
    form.name.trim().length >= 3 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    /^[6-9]\d{9}$/.test(form.phone) &&
    form.subject.trim() &&
    form.message.trim().length >= 15;

  
    return (
  <>
    <Navbar />

    <div className="min-h-screen bg-slate-50">

      {/* Contact Form */}

      <section className="pt-28 pb-16">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-10 border border-slate-100"
          >

            <div className="text-center mb-10">

              <h1 className="text-4xl font-black text-slate-900">
                Send Us a Message
              </h1>

              <p className="text-slate-500 mt-3">
                We'd love to hear from you. Fill out the form below and our
                support team will get back to you as soon as possible.
              </p>

            </div>

            {success && (

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 rounded-2xl border border-green-300 bg-green-50 p-5"
              >

                <h3 className="text-lg font-bold text-green-700">
                  ✅ Message Sent Successfully!
                </h3>

                <p className="mt-2 text-green-600">
                  Thank you for contacting AI Business OS.
                  Our support team will contact you shortly.
                </p>

              </motion.div>

            )}

            <form
              onSubmit={handleSubmit}
              className="grid md:grid-cols-2 gap-6"
            >

              {/* Full Name */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>

                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="John Doe"
                  className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                />

                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name}
                  </p>
                )}

              </div>

              {/* Email */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email}
                  </p>
                )}

              </div>

              {/* Phone */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>

                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="9876543210"
                  className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                />

                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phone}
                  </p>
                )}

              </div>

              {/* Subject */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Subject
                </label>

                <input
                  value={form.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  placeholder="Enter subject"
                  className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.subject
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                />

                {errors.subject && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.subject}
                  </p>
                )}

              </div>

              {/* Message */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium mb-2">
                  Message
                </label>

                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Write your message..."
                  className={`w-full rounded-xl border px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.message
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                />

                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.message}
                  </p>
                )}

              </div>

              <div className="md:col-span-2">

                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full rounded-xl py-4 font-semibold transition-all ${
                    isFormValid
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Send Message
                </button>

              </div>

            </form>

          </motion.div>

        </div>

      </section>
                     {/* Frequently Asked Questions */}

      <section className="pb-20 bg-white">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">

            <span className="text-blue-600 font-semibold uppercase tracking-wider">
              FAQ
            </span>

            <h2 className="text-4xl font-black text-slate-900 mt-3">
              Frequently Asked Questions
            </h2>

            <p className="text-slate-500 mt-4">
              Find answers to some of the most common questions about
              AI Business OS.
            </p>

          </div>

          <div className="space-y-5">

            {[
              {
                question: "How do I register my business?",
                answer:
                  "Click Register, choose Business Owner, complete your business details, select a subscription plan, and finish the registration process.",
              },
              {
                question: "Can I upgrade my subscription later?",
                answer:
                  "Yes. You can upgrade your subscription at any time from your business workspace.",
              },
              {
                question: "Can employees access the platform?",
                answer:
                  "Yes. Employees can register and access the workspace according to the permissions assigned by the business owner.",
              },
              {
                question: "How do I contact support?",
                answer:
                  "Simply fill out the contact form above and our support team will respond as soon as possible.",
              },
            ].map((faq, index) => (

              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -3 }}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
              >

                <h3 className="text-lg font-bold text-slate-800 mb-3">
                  {faq.question}
                </h3>

                <p className="text-slate-600 leading-7">
                  {faq.answer}
                </p>

              </motion.div>

            ))}

          </div>

        </div>

      </section>

    </div>

    <Footer />

  </>
);
}