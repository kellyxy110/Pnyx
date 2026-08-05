"use client";
import { useEffect, useRef } from "react";

/**
 * Shared bottom-sheet drawer built on the native <dialog> element, which
 * gives a focus trap, Escape-to-close, and a backdrop for free instead of
 * hand-rolling that accessibility surface per feature.
 */
export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="app-drawer" aria-label={title} onClose={onClose} onCancel={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div className="app-drawer-header">
        <h2>{title}</h2>
        <button type="button" className="app-drawer-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="app-drawer-body">{children}</div>
    </dialog>
  );
}
