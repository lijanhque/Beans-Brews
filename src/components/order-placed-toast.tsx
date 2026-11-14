"use client";

import { useEffect, useState } from "react";

export function OrderPlacedToast({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show);
  useEffect(() => {
    if (!show) return;
    const timer = window.setTimeout(() => setVisible(false), 3500);
    return () => window.clearTimeout(timer);
  }, [show]);

  if (!visible) return null;
  return (
    <div className="order-toast" role="status" aria-live="polite">
      Your order is in! You can follow its status below.
      <button aria-label="Dismiss notification" onClick={() => setVisible(false)} type="button">×</button>
    </div>
  );
}
