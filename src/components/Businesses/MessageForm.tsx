import { useState } from "react";

interface MessageFormProps {
  sender?: string;
  businessId: string;
}

const API_BASE = "http://localhost:5000";

const RECIPIENT_OPTIONS = ["Sales", "HR", "Inventory", "Finance", "CEO", "Employees"];

export default function MessageForm({
  sender = "Department",
  businessId,
}: MessageFormProps) {
  const [toRecipient, setToRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!toRecipient.trim()) {
      alert("Please select a department.");
      return;
    }
    if (!subject.trim()) {
      alert("Please enter the subject.");
      return;
    }
    if (!message.trim()) {
      alert("Please enter the message.");
      return;
    }

    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          businessId,
          to: toRecipient.trim(),
          subject: subject.trim(),
          message: message.trim(),
          fromDepartment: sender,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to send message.");
        return;
      }

      alert(`Message sent successfully from ${sender}!`);

      setToRecipient("");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("Send message error:", err);
      alert("Network error while sending message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex justify-center">

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-3xl">

        <h2 className="text-3xl font-bold text-center mb-2">
          💬 Messages
        </h2>

        <p className="text-center text-slate-500 mb-8">
          Send a message to another department. Attachments are optional.
        </p>

        <div className="space-y-6">

          <div>
            <label className="block font-semibold mb-2">
              To
            </label>

            <select
              value={toRecipient}
              onChange={(e) => setToRecipient(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>
                Select a department
              </option>
              {RECIPIENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Subject
            </label>

            <input
              type="text"
              placeholder="Enter subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Message
            </label>

            <textarea
              rows={6}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>

        </div>

      </div>

    </div>
  );
}