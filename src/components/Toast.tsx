'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast container on top right */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let borderLeftClass = 'border-l-4 border-l-[#00C851]';
          let icon = <CheckCircle2 className="w-5 h-5 text-[#00C851]" />;

          if (t.type === 'error') {
            borderLeftClass = 'border-l-4 border-l-[#ff4444]';
            icon = <AlertCircle className="w-5 h-5 text-[#ff4444]" />;
          } else if (t.type === 'info') {
            borderLeftClass = 'border-l-4 border-l-[#0099CC]';
            icon = <Info className="w-5 h-5 text-[#0099CC]" />;
          }

          return (
            <div
              key={t.id}
              className={`flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white pointer-events-auto shadow-2xl transition-all duration-300 animate-slide-in ${borderLeftClass}`}
              style={{
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01)'
              }}
            >
              <div className="flex-shrink-0">{icon}</div>
              <div className="flex-1 text-sm font-semibold tracking-wide text-gray-900 leading-snug">
                {t.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Dynamic inline styles for premium toast animations */}
      <style jsx global>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-1rem) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}
