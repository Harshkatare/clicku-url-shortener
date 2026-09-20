import { createContext, useContext, type ReactNode } from "react";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/common/ToastContainer";
import type { ToastType } from "../types/toast.types";

export interface ToastContextValue {
  showToast: (
    type: ToastType,
    message: string,
    undoAction?: () => void,
    customDurationMs?: number
  ) => number;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, show, remove } = useToast();

  return (
    <ToastContext.Provider value={{ showToast: show, removeToast: remove }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
