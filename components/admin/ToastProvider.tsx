import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  addToast: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case "success":
      return "border-green-200 bg-green-50 text-green-900 dark:border-green-700/60 dark:bg-green-900/30 dark:text-green-100";
    case "error":
      return "border-red-200 bg-red-50 text-red-900 dark:border-red-700/60 dark:bg-red-900/30 dark:text-red-100";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-100";
    case "info":
    default:
      return "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-700/60 dark:bg-blue-900/30 dark:text-blue-100";
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const toast: ToastItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message,
        type: options?.type ?? "info",
        duration: options?.duration ?? 3500,
      };

      setToasts((prev) => [...prev, toast]);

      if (toast.duration > 0) {
        window.setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
      }
    },
    [removeToast],
  );

  const contextValue = useMemo(
    () => ({
      addToast,
      success: (message: string, options?: ToastOptions) =>
        addToast(message, { ...options, type: "success" }),
      error: (message: string, options?: ToastOptions) =>
        addToast(message, { ...options, type: "error" }),
      info: (message: string, options?: ToastOptions) =>
        addToast(message, { ...options, type: "info" }),
      warning: (message: string, options?: ToastOptions) =>
        addToast(message, { ...options, type: "warning" }),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex w-[320px] max-w-[90vw] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-lg border px-3 py-2 shadow-lg backdrop-blur ${getToastStyles(
              toast.type,
            )}`}
          >
            <div className="flex-1 text-sm leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs font-medium uppercase tracking-wide opacity-70 hover:opacity-100"
              aria-label="Dismiss toast"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
