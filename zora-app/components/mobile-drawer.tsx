'use client';

// A simple left-side slide-in drawer used by chat / account sidebars and the landing nav
// menu on mobile. Fixed full-screen backdrop + a panel that slides in from the left.
// Click on the backdrop closes it; Esc also closes it. Consistent across the app.

import React from 'react';

export function MobileDrawer({
  open,
  onClose,
  children,
  width = 280,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  // Close on Esc while open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll while open so the drawer doesn't scroll the page beneath it.
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .2s ease',
          zIndex: 90,
        }}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: `min(${width}px, 84vw)`,
          background: 'var(--bg-1)',
          borderRight: '1px solid var(--bd-2)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .22s ease',
          zIndex: 91,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </>
  );
}
