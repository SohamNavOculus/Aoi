import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ClearChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearChatModal: React.FC<ClearChatModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 flex flex-col items-center text-center animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
          Clear Chat History?
        </h3>

        <p className="text-xs text-stone-500 dark:text-stone-400 mb-5 leading-relaxed">
          This will wipe your saved messages with Aoi in this browser. Aoi will start fresh with a new welcome message. Your settings and profile will be kept.
        </p>

        <div className="flex items-center gap-2.5 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Keep Chatting
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors shadow-sm"
          >
            Yes, Clear
          </button>
        </div>
      </div>
    </div>
  );
};
