/**
 * Notification Toast Component
 */

'use client';

import { useVocabStore } from '@/lib/store';
import { Sparkles } from 'lucide-react';
import { useAutoNotification } from '@/hooks';

export function Notification() {
  const notification = useVocabStore((state) => state.notification);
  useAutoNotification();

  if (!notification) return null;

  const bgColor =
    notification.type === 'success'
      ? 'bg-emerald-600'
      : notification.type === 'error'
        ? 'bg-rose-600'
        : 'bg-slate-900';

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 ${bgColor} text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-fade-in transition-all`}
    >
      <Sparkles className="w-5 h-5" />
      <span className="text-sm font-medium">{notification.message}</span>
    </div>
  );
}
