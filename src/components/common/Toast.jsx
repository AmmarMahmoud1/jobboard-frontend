import { useState, useCallback, useEffect } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  return { toast, showToast };
}

export default function Toast({ toast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [toast?.id]);

  if (!toast || !visible) return null;

  const styles = {
    success: "bg-green-600",
    error:   "bg-red-500",
    info:    "bg-[#0F4E7D]",
    warning: "bg-amber-500",
  };

  const icons = {
    success: "✓",
    error:   "✕",
    info:    "ℹ",
    warning: "⚠",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-2xl animate-fade-in-up ${styles[toast.type] || styles.success}`}
    >
      <span className="text-base">{icons[toast.type] || icons.success}</span>
      {toast.message}
    </div>
  );
}
