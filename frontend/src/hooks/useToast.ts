import { useState, useCallback, useRef, useEffect } from "react";
import type { Toast, ToastType } from "../types/toast.types";

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, message: string, undoAction?: () => void, customDurationMs?: number) => {
      const id = ++idRef.current;
      const durationMs = customDurationMs ?? (undoAction ? 5000 : 3500);

      setToasts((prev) => [...prev, { id, type, message, undoAction, durationMs }]);

      const timer = setTimeout(() => {
        remove(id);
      }, durationMs);

      timersRef.current.set(id, timer);
      return id;
    },
    [remove]
  );

  useEffect(() => {
    const activeTimers = timersRef.current;
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  return { toasts, show, remove };
}
