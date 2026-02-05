import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  isExiting?: boolean;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
}

interface ToastContextValue {
  addToast: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const getToastIcon = (type: ToastType, className: string) => {
  const iconProps = { className };
  switch (type) {
    case "success":
      return <CheckCircle {...iconProps} />;
    case "error":
      return <AlertCircle {...iconProps} />;
    case "warning":
      return <AlertTriangle {...iconProps} />;
    case "info":
    default:
      return <Info {...iconProps} />;
  }
};

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case "success":
      return {
        container:
          "border-green-200/50 bg-green-50/90 dark:border-green-500/30 dark:bg-green-900/40",
        icon: "text-green-500 dark:text-green-400",
        text: "text-green-900 dark:text-green-100",
        progress: "bg-green-500",
      };
    case "error":
      return {
        container:
          "border-red-200/50 bg-red-50/90 dark:border-red-500/30 dark:bg-red-900/40",
        icon: "text-red-500 dark:text-red-400",
        text: "text-red-900 dark:text-red-100",
        progress: "bg-red-500",
      };
    case "warning":
      return {
        container:
          "border-amber-200/50 bg-amber-50/90 dark:border-amber-500/30 dark:bg-amber-900/40",
        icon: "text-amber-500 dark:text-amber-400",
        text: "text-amber-900 dark:text-amber-100",
        progress: "bg-amber-500",
      };
    case "info":
    default:
      return {
        container:
          "border-blue-200/50 bg-blue-50/90 dark:border-blue-500/30 dark:bg-blue-900/40",
        icon: "text-blue-500 dark:text-blue-400",
        text: "text-blue-900 dark:text-blue-100",
        progress: "bg-blue-500",
      };
  }
};

const getConfirmStyles = (type: ConfirmOptions["type"]) => {
  switch (type) {
    case "danger":
      return {
        icon: <AlertTriangle className="w-8 h-8" />,
        iconColor: "text-red-500",
        iconBg: "bg-red-100 dark:bg-red-900/50",
        confirmBtn:
          "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/30",
      };
    case "warning":
      return {
        icon: <HelpCircle className="w-8 h-8" />,
        iconColor: "text-amber-500",
        iconBg: "bg-amber-100 dark:bg-amber-900/50",
        confirmBtn:
          "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30",
      };
    case "info":
    default:
      return {
        icon: <HelpCircle className="w-8 h-8" />,
        iconColor: "text-blue-500",
        iconBg: "bg-blue-100 dark:bg-blue-900/50",
        confirmBtn:
          "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30",
      };
  }
};

// Toast Item Component with animations
const ToastItemComponent: React.FC<{
  toast: ToastItem;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const styles = getToastStyles(toast.type);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    if (toast.duration <= 0) return;

    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      }
    };
    const rafId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(rafId);
  }, [toast.duration]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-xl shadow-lg
        transition-all duration-300 ease-out
        ${styles.container}
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {getToastIcon(toast.type, `w-5 h-5 ${styles.icon}`)}
        <div
          className={`flex-1 text-sm leading-snug font-medium ${styles.text}`}
        >
          {toast.message}
        </div>
        <button
          onClick={handleRemove}
          className={`
            p-0.5 rounded-lg transition-all duration-200
            hover:bg-black/10 dark:hover:bg-white/10
            ${styles.text} opacity-60 hover:opacity-100
          `}
          aria-label="Dismiss toast"
        >
          <X className="w-[18px] h-[18px]" />
        </button>
      </div>
      {/* Progress bar */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
          <div
            className={`h-full transition-none ${styles.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Confirm Dialog Component
const ConfirmDialog: React.FC<{
  isOpen: boolean;
  options: ConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, options, onConfirm, onCancel }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen || !options) return null;

  const styles = getConfirmStyles(options.type);

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(onConfirm, 150);
  };

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(onCancel, 150);
  };

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center p-4
        transition-all duration-200
        ${isVisible ? "bg-black/50 backdrop-blur-sm" : "bg-transparent"}
      `}
      onClick={handleCancel}
    >
      <div
        className={`
          w-full max-w-sm rounded-2xl border border-white/20 dark:border-gray-700/50
          bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
          shadow-2xl shadow-black/20
          transition-all duration-200 ease-out
          ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center pt-6">
          <div className={`p-3 rounded-full ${styles.iconBg}`}>
            <div className={styles.iconColor}>{styles.icon}</div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 text-center">
          {options.title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {options.title}
            </h3>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {options.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleCancel}
            className="
              flex-1 px-4 py-2.5 text-sm font-medium rounded-xl
              bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200
              hover:bg-gray-200 dark:hover:bg-gray-600
              transition-all duration-200
            "
          >
            {options.cancelText || "Cancel"}
          </button>
          <button
            onClick={handleConfirm}
            className={`
              flex-1 px-4 py-2.5 text-sm font-medium rounded-xl text-white
              transition-all duration-200
              ${styles.confirmBtn}
            `}
          >
            {options.confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const toast: ToastItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message,
        type: options?.type ?? "info",
        duration: options?.duration ?? 4000,
      };

      setToasts((prev) => [...prev, toast]);

      if (toast.duration > 0) {
        window.setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration + 200); // Extra time for exit animation
      }
    },
    [removeToast],
  );

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    confirmState.resolve?.(true);
    setConfirmState({ isOpen: false, options: null, resolve: null });
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    confirmState.resolve?.(false);
    setConfirmState({ isOpen: false, options: null, resolve: null });
  }, [confirmState]);

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
      confirm,
    }),
    [addToast, confirm],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex w-[360px] max-w-[90vw] flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItemComponent
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        options={confirmState.options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
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
