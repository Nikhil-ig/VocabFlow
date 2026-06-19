'use client';

import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const confirmColors = isDestructive
    ? 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500'
    : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500';

  const iconColors = isDestructive
    ? 'bg-rose-100 text-rose-600'
    : 'bg-primary-100 text-primary-600';

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 backdrop-blur-md bg-slate-900/40' : 'opacity-0 bg-transparent pointer-events-none'
      }`}
    >
      <div
        className={`bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transition-all duration-300 transform ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'
        }`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-2xl ${iconColors}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100/50 hover:bg-slate-200/50 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="mt-5 text-xl font-extrabold text-slate-800 tracking-tight">
            {title}
          </h3>
          <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">
            {message}
          </p>

          <div className="mt-8 flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 shadow-lg ${confirmColors}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Please wait...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
