import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/user/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: feedback }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to submit feedback");
        return;
      }

      setSubmitted(true);
      setFeedback("");
      setError("");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Feedback] Submit failed:", message);
      setError("Could not submit feedback. Please try again.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50 pt-28 pb-20">

        <div className="max-w-3xl mx-auto px-4">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-10 border border-slate-100"
          >

            <div className="text-center mb-8">

              <h1 className="text-4xl font-black text-slate-900">
                Feedback
              </h1>

              <p className="text-slate-500 mt-3">
                We'd love to hear your thoughts. Your feedback helps us improve AI Business OS.
              </p>

            </div>

            {submitted && (

              <div className="mb-6 rounded-xl bg-green-100 border border-green-300 text-green-700 p-4">

                ✅ Thank you for your feedback!

              </div>

            )}

            {error && (

              <div className="mb-6 rounded-xl bg-red-100 border border-red-300 text-red-700 p-4">

                {error}

              </div>

            )}

            <form onSubmit={handleSubmit}>

              <label className="block font-medium text-slate-700 mb-2">
                Your Feedback
              </label>

              <textarea
                rows={8}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your feedback here..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <button
                type="submit"
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Submit Feedback
              </button>

            </form>

          </motion.div>

        </div>

      </div>

      <Footer />
    </>
  );
}