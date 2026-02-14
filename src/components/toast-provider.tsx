"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "error" | "success" | "info";

type ToastInput = {
  kind: ToastKind;
  title: string;
  code?: string;
  description: string;
};

type ToastItem = ToastInput & {
  id: string;
};

type ToastContextValue = {
  pushToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const next: ToastItem = { id, ...input };
      setToasts((current) => [next, ...current].slice(0, 5));
      setTimeout(() => removeToast(id), 4500);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-md border border-zinc-200 bg-white p-3 shadow-lg"
          >
            <p className="text-sm font-semibold text-zinc-900">{toast.title}</p>
            {toast.code && (
              <p className="text-xs font-medium tracking-wide text-rose-700">
                {toast.code}
              </p>
            )}
            <p className="mt-1 text-sm text-zinc-700">{toast.description}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="mt-2 text-xs font-medium text-zinc-500 hover:text-zinc-800"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
