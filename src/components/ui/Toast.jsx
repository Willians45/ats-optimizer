/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const ToastContext = createContext(null);

const STYLES = {
  success: {
    icon: CheckCircle2,
    className: 'border-[#BBF7D0] bg-white text-[#0E1318]',
    iconClass: 'text-[#16A34A]',
  },
  error: {
    icon: AlertCircle,
    className: 'border-[#FECACA] bg-white text-[#0E1318]',
    iconClass: 'text-[#DC2626]',
  },
  info: {
    icon: Info,
    className: 'border-[#E5E7EB] bg-white text-[#0E1318]',
    iconClass: 'text-[#7D2AE8]',
  },
};

let toastCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'info', options = {}) => {
      toastCounter += 1;
      const id = `toast_${toastCounter}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      const duration = options.duration ?? 5000;
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      toast,
      success: (message, options) => toast(message, 'success', options),
      error: (message, options) => toast(message, 'error', options),
      info: (message, options) => toast(message, 'info', options),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-20 right-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 lg:bottom-5 lg:right-5">
        <AnimatePresence initial={false}>
          {toasts.map((item) => {
            const style = STYLES[item.type] || STYLES.info;
            const Icon = style.icon;
            return (
              <Motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_18px_40px_-18px_rgba(14,19,24,0.35)]',
                  style.className,
                )}
              >
                <Icon size={18} className={cn('mt-0.5 shrink-0', style.iconClass)} />
                <p className="flex-1 text-[13px] leading-relaxed">{item.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  className="mt-0.5 text-[#9CA3AF] transition hover:text-[#0E1318]"
                  aria-label="Cerrar notificación"
                >
                  <X size={15} />
                </button>
              </Motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast debe usarse dentro de ToastProvider');
  return value;
}
