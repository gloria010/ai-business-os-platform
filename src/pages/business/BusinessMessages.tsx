import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { MessageSquare, Send } from "lucide-react";

interface Message {
  id: number;
  to: string;
  subject: string;
  content: string;
  time: string;
}

const API_BASE = "http://localhost:5000";

export default function BusinessMessages() {
  const location = useLocation();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [businessId, setBusinessId] = useState("BIZ-FUR-HOME");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBusinessContext = async () => {
      const storedBusinessId = localStorage.getItem("businessId") || "";
      const routeBusinessId = (location.state as any)?.businessId || "";
      let resolvedBusinessId = storedBusinessId || routeBusinessId || "BIZ-FUR-HOME";

      try {
        const sessionRes = await fetch(`${API_BASE}/api/login/session`, {
          credentials: "include",
        });
        const sessionData = await sessionRes.json();
        if (sessionData?.success && sessionData?.user?.company) {
          resolvedBusinessId = sessionData.user.company;
        }
      } catch {
        // Ignore and use the stored/route fallback.
      }

      setBusinessId(resolvedBusinessId);
      if (!resolvedBusinessId) return;

      localStorage.setItem("businessId", resolvedBusinessId);

      fetch(`${API_BASE}/api/messages?businessId=${encodeURIComponent(resolvedBusinessId)}&to=Sales`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMessages(
              data.messages.map((msg: any) => ({
                id: msg.id,
                to: msg.to_recipient,
                subject: msg.subject,
                content: msg.message,
                time: new Date(msg.created_at).toLocaleString(),
              }))
            );
          }
        })
        .catch(() => setError("Unable to load messages."));
    };

    loadBusinessContext();
  }, [location.state]);

  const handleSend = async () => {
    let resolvedBusinessId = businessId || localStorage.getItem("businessId") || (location.state as any)?.businessId || "BIZ-FUR-HOME";

    try {
      const sessionRes = await fetch(`${API_BASE}/api/login/session`, {
        credentials: "include",
      });
      const sessionData = await sessionRes.json();
      if (sessionData?.success && sessionData?.user?.company) {
        resolvedBusinessId = sessionData.user.company;
      }
    } catch {
      // Ignore and keep the fallback.
    }

    console.log("[BusinessMessages] submit values", { resolvedBusinessId, to, subject, content });

    if (!to || !subject || !content) {
      alert("Please fill in all fields.");
      return;
    }


    setBusinessId(resolvedBusinessId);
    localStorage.setItem("businessId", resolvedBusinessId);
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          businessId: resolvedBusinessId,
          to,
          subject,
          message: content,
          fromDepartment: "CEO",
        }),
      });

      const data = await res.json();
      console.log("[BusinessMessages] send response", {
        status: res.status,
        ok: res.ok,
        body: data,
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      setMessages((prev) => [
        {
          id: data.id,
          to,
          subject,
          content,
          time: "Just now",
        },
        ...prev,
      ]);

      setTo("");
      setSubject("");
      setContent("");
      alert("Message sent successfully.");
    } catch (err: any) {
      setError(err.message || "Unable to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      role="business"
      title="Business Messages"
    >
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">

          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <MessageSquare className="w-10 h-10 text-indigo-600" />
            </div>

            <h2 className="text-4xl font-bold text-slate-900">
              Messages
            </h2>

            <p className="text-slate-500 mt-2">
              Send a message to another department. Attachments are optional.
            </p>
          </div>

          {/* To */}

          <div className="mb-5">
            <label className="block font-semibold mb-2">
              To
            </label>

            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Department</option>
              <option>CEO</option>
              <option>HR</option>
              <option>Sales</option>
              <option>Inventory</option>
              <option>Finance</option>
              <option>Employees</option>
            </select>
          </div>

          {/* Subject */}

          <div className="mb-5">
            <label className="block font-semibold mb-2">
              Subject
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Message */}

          <div className="mb-5">
            <label className="block font-semibold mb-2">
              Message
            </label>

            <textarea
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

        

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
          >
            <Send className="w-5 h-5" />
            {loading ? "Sending..." : "Send Message"}
          </button>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Recent Messages</h3>
            <div className="space-y-3">
              {messages.length === 0 && <p className="text-slate-500">No messages yet.</p>}
              {messages.map((msg) => (
                <div key={msg.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">{msg.subject}</p>
                    <p className="text-xs text-slate-500">{msg.time}</p>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{msg.content}</p>
                  <p className="text-xs text-slate-500 mt-2">To: {msg.to}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
}
        
        