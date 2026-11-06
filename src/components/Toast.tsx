import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed left-1/2 bottom-24 -translate-x-1/2 bg-[#14233a] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl border border-white/10 z-50 max-w-[90vw] text-center pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      {message}
    </div>
  );
};
