'use client';

import { X, LogOut, User, Mail, Shield, BookOpen, Star, Flame, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCardColumns } from '@/hooks';
import { useEffect, useState } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, logout } = useAuth();
  const session = user ? { user } : null;
  const { stats } = useCardColumns();
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

  const initials = session?.user?.email?.substring(0, 2).toUpperCase() || 'G';
  const role = (session?.user as any)?.role || 'USER';
  const isGuest = !session;

  return (
    <div
      className={`fixed inset-0 z-[100] flex justify-end transition-all duration-300 ${isOpen ? 'opacity-100 backdrop-blur-sm bg-slate-900/40' : 'opacity-0 bg-transparent pointer-events-none'
        }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover */}
        <div className="h-40 bg-gradient-to-br from-primary-600 via-primary-800 to-slate-900 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Avatar overlap */}
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-xl">
              <div className="w-full h-full bg-gradient-to-tr from-primary-500 to-fuchsia-500 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-inner">
                {initials}
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-8 mt-14 mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
            {isGuest ? 'Guest Explorer' : session?.user?.name || 'Vocab Learner'}
          </h2>
          <div className="flex items-center space-x-2 mt-1 text-slate-500">
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">{isGuest ? 'Not Logged In' : session?.user?.email || 'No email'}</span>
          </div>
          <div className="flex items-center space-x-2 mt-1 text-primary-600">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{isGuest ? 'GUEST' : role}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-6 flex-1 overflow-y-auto">
          {isGuest ? (
            <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100 flex flex-col items-center text-center space-y-4 mt-2">
              <div className="p-4 bg-primary-100 rounded-full text-primary-600">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Unlock Your Potential</h3>
              <p className="text-sm text-slate-600 font-medium">
                Create an account to track your progress, unlock advanced learning features, and build your own vocabulary library!
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Your Progress</h3>
              <div className="grid grid-cols-2 gap-4">

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-start">
                  <div className="p-2 bg-primary-100 text-primary-600 rounded-xl mb-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-800">{stats?.totalCards || 0}</span>
                  <span className="text-xs font-bold text-slate-500 mt-1">Total Words</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-start">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl mb-3">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-800">{stats?.masteryPercentage || 0}%</span>
                  <span className="text-xs font-bold text-slate-500 mt-1">Mastery Rate</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-start">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-xl mb-3">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-800">{stats?.learningCards || 0}</span>
                  <span className="text-xs font-bold text-slate-500 mt-1">Learning Now</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-start">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-xl mb-3">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-800">{stats?.toLearnCards || 0}</span>
                  <span className="text-xs font-bold text-slate-500 mt-1">In Backlog</span>
                </div>

              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 pb-safe pb-8">
          {isGuest ? (
            <a
              href="/login"
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-primary-600 text-white hover:bg-primary-700 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5 rotate-180" />
              <span>Log In / Sign Up</span>
            </a>
          ) : (
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out Safely</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
