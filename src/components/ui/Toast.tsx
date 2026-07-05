import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type'], title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', title?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  const iconColors = { success: 'text-emerald-500', error: 'text-red-500', warning: 'text-amber-500', info: 'text-blue-500' };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(toast => {
            const Icon = icons[toast.type];
            return (
              <motion.div key={toast.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm ${colors[toast.type]}`}>
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
                <div className="flex-1 min-w-0">
                  {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
                  <p className="text-sm">{toast.message}</p>
                </div>
                <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="flex-shrink-0 opacity-60 hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
