import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Zap, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

const suggestions = [
  'Find the best electronics deals',
  'What are trending products?',
  'How do I track my order?',
  'Recommend products for me',
  'What businesses are near me?',
];

const mockResponses: Record<string, string> = {
  default: "I'm your AI assistant for AI Business OS! I can help you discover products, track orders, find businesses, and get personalized recommendations. What would you like to explore?",
  deals: "Great news! There are currently 47 flash deals active. Top picks: Ultra HD TV (20% off), Wireless Headphones (25% off), and Summer Dress (26% off). Want me to show you all deals?",
  trending: "Trending right now: 1) Smartphones - ZeroMax Pro 2) Protein Powder 3) Online Python Course 4) Vitamin C Serum. Electronics is the hottest category with 35% more views this week!",
  order: "To track your order, go to 'My Orders' in your dashboard. Your recent order ORD-002 is currently shipped and estimated to arrive by March 15th. Need more details?",
  recommend: "Based on your browsing history, I recommend: Wireless Gaming Mouse (you viewed similar items), Pro Yoga Mat (on your wishlist matches), and Smartphone ZeroMax Pro (top rated this week)!",
  business: "I found 12 top-rated businesses near you! TechZone Store, Glow Beauty Studio, and The Gourmet Kitchen are all within 5 miles and have 4.7+ ratings. Want to see their full profiles?",
};

function getResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('deal') || lower.includes('discount') || lower.includes('sale') || lower.includes('offer')) return mockResponses.deals;
  if (lower.includes('trend') || lower.includes('popular') || lower.includes('top')) return mockResponses.trending;
  if (lower.includes('order') || lower.includes('track') || lower.includes('delivery')) return mockResponses.order;
  if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('for me')) return mockResponses.recommend;
  if (lower.includes('business') || lower.includes('near') || lower.includes('find')) return mockResponses.business;
  return mockResponses.default;
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: "Hi! I'm your AI Business OS assistant. How can I help you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, time: now }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: getResponse(text), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1200 + Math.random() * 800);
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/40 flex items-center justify-center text-white"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">AI Assistant</p>
                <p className="text-blue-200 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Online
                </p>
              </div>
              <button onClick={() => setMessages([{ id: '0', role: 'assistant', text: "Hi! I'm your AI Business OS assistant. How can I help you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-700 rounded-tl-sm'}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>{msg.time}</p>
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                        className="w-2 h-2 bg-slate-400 rounded-full block" />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-slate-400 mb-2 font-medium">Suggested</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.slice(0, 3).map(s => (
                    <button key={s} onClick={() => send(s)} className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-full hover:bg-blue-100 transition-colors border border-blue-100">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-slate-100">
              <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Ask me anything..." disabled={typing}
                  className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-400 placeholder:text-slate-400" />
                <button type="submit" disabled={!input.trim() || typing}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
