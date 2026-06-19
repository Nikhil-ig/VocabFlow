'use client';

import { BookOpen, PlusCircle, Lightbulb, User, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BottomNavProps {
  onAddClick: () => void;
  onFlashcardClick: () => void;
  onProfileClick: () => void;
}

export function BottomNav({ onAddClick, onFlashcardClick, onProfileClick }: BottomNavProps) {
  const { user } = useAuth();
  const session = user ? { user } : null;
  const isAdmin = session?.user?.role === 'ADMIN';

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
      <div className="bg-white/80 backdrop-blur-2xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl flex justify-around items-center h-16 px-2">
        {/* Home */}
        <button
          onClick={() => {
            triggerHaptic();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center w-full h-full text-primary-600 space-y-1 transition-transform active:scale-95"
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-bold">Board</span>
        </button>

        {/* Add Word */}
        {isAdmin && (
          <button
            onClick={() => {
              triggerHaptic();
              onAddClick();
            }}
            className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-primary-600 space-y-1 transition-transform active:scale-95"
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-[10px] font-bold">Add</span>
          </button>
        )}

        {/* Practice */}
        <button
          onClick={() => {
            triggerHaptic();
            onFlashcardClick();
          }}
          className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-amber-500 space-y-1 transition-transform active:scale-95 group"
        >
          <div className="relative">
            <Lightbulb className="w-6 h-6 group-active:text-amber-500" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <span className="text-[10px] font-bold">Practice</span>
        </button>

        {/* Analytics */}
        {/* <button
          onClick={() => {
            triggerHaptic();
            window.location.href = '/analytics';
          }}
          className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-primary-600 space-y-1 transition-transform active:scale-95"
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px] font-bold">Stats</span>
        </button> */}

        {/* Profile */}
        <button
          onClick={() => {
            triggerHaptic();
            onProfileClick();
          }}
          className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-primary-600 space-y-1 transition-transform active:scale-95"
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </div>
  );
}
