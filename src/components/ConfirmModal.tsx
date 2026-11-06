import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  confirmLabel: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  message,
  confirmLabel,
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#0e1624]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-opacity"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-[#e3e0d8] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[15px] text-[#14233a] leading-relaxed mb-6 font-medium">
          {message}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm border border-[#e3e0d8] text-[#5b6676] hover:bg-[#eeece6] transition-colors"
          >
            Thôi
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-colors ${
              isDanger
                ? 'bg-[#c2453b] hover:bg-[#a73930]'
                : 'bg-[#14233a] hover:bg-[#1f3a5f]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
