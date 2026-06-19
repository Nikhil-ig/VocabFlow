/**
 * Header Component
 */

'use client';

import { GraduationCap, TrendingUp, User } from 'lucide-react';
import { useVocabStore } from '@/lib/store';
import { useCardColumns } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onProfileClick: () => void;
}

export function Header({ onProfileClick }: HeaderProps) {
  const { columns, stats } = useCardColumns();
  const { user, organization } = useAuth();
  const systemSettings = useVocabStore(state => state.systemSettings);
  const initials = user?.email?.substring(0, 2).toUpperCase() || 'U';

  const uiStyle = systemSettings?.uiStyle || 'glassmorphism';

  const headerStyle =
    uiStyle === 'playful' ? 'bg-primary-500 text-white border-b-[8px] border-primary-700' :
      uiStyle === 'minimal' ? 'bg-white text-slate-800 border-b-2 border-slate-200' :
        'bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white shadow-md border-b border-primary-900/30';

  return (
    <header className={headerStyle}>
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-primary-600/30 p-2.5 rounded-2xl border border-primary-500/20 shadow-inner overflow-hidden flex items-center justify-center w-12 h-12">
            {organization?.logoUrl ? (
              <img src={organization.logoUrl} alt="Organization Logo" className="w-full h-full object-cover" />
            ) : (
              <GraduationCap className="w-8 h-8 text-primary-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-primary-200 bg-clip-text text-transparent">
              {organization?.name || systemSettings?.applicationName || 'VocabFlow'}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-medium mt-0.5">
              AI-Powered Vocabulary Mastery System
            </p>
          </div>
        </div>

        {/* Right Section: Stats & Profile */}
        <div className="flex items-center space-x-4 self-stretch md:self-auto w-full md:w-auto">
          {/* Quick Stats */}
          <div className="flex-1 md:flex-none flex items-center justify-around space-x-4 bg-slate-800/40 p-1.5 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
            <div className="px-4 py-2 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Mastery
              </p>
              <p className="text-xl font-black text-emerald-400">{stats?.masteryPercentage || 0}%</p>
            </div>
            <div className="w-px h-8 bg-slate-700/50" />
            <div className="px-4 py-2 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Mastered
              </p>
              <p className="text-xl font-bold text-white">
                {stats?.masteredCards || 0}/{stats?.totalCards || 0}
              </p>
            </div>
            <div className="w-px h-8 bg-slate-700/50" />
            <div className="px-4 py-2 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Active
              </p>
              <p className="text-xl font-bold text-primary-300">{(stats?.learningCards || 0) + (stats?.toLearnCards || 0)}</p>
            </div>
          </div>

          {/* Admin Button */}
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => window.location.href = '/admin'}
              className="hidden md:flex items-center justify-center w-12 h-12 bg-rose-500/10 hover:bg-rose-500 rounded-full border border-rose-500/50 shadow-lg hover:scale-105 transition-all text-rose-400 hover:text-white mr-3"
              title="Admin Dashboard"
            >
              <User className="w-5 h-5" />
            </button>
          )}

          {/* Analytics Button */}
          {user && (
            <button
              onClick={() => window.location.href = '/analytics'}
              className="hidden md:flex items-center justify-center w-12 h-12 bg-slate-800/80 hover:bg-primary-600 rounded-full border border-slate-700/50 shadow-lg hover:scale-105 transition-all text-primary-300 hover:text-white mr-3"
              title="Analytics Dashboard"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
          )}

          {/* Avatar / Login Button */}
          {user ? (
            <button
              onClick={onProfileClick}
              className="hidden md:flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-primary-500 to-fuchsia-500 rounded-full border-2 border-slate-800 shadow-lg hover:shadow-primary-500/30 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary-500"
              title="Open Profile"
            >
              <span className="text-sm font-black text-white">{initials}</span>
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/login'}
              className="hidden md:flex items-center justify-center px-5 h-12 bg-gradient-to-tr from-primary-600 to-fuchsia-600 rounded-2xl border border-primary-500/30 shadow-lg hover:shadow-primary-500/30 hover:scale-105 transition-all"
            >
              <span className="text-sm font-black text-white">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Guest Mode Banner */}
      {!user && (
        <div className="w-full max-w-7xl mx-auto px-4 pb-3 md:pb-5 animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-50/80 via-white/60 to-purple-50/80 backdrop-blur-xl border border-indigo-100/50 rounded-2xl p-3 md:px-5 flex flex-col sm:flex-row items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3 mb-3 sm:mb-0 text-center sm:text-left">
              <span className="hidden sm:flex text-indigo-500 bg-white p-1.5 rounded-full shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </span>
              <p className="text-xs md:text-sm font-semibold text-slate-700">
                You're exploring in <span className="font-black text-indigo-600">Guest Mode</span>.
                <span className="hidden md:inline text-slate-500 ml-1 font-medium">Your progress is only saved to this device.</span>
              </p>
            </div>
            <a 
              href="/login" 
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] md:text-xs font-black rounded-xl shadow-[0_4px_12px_-2px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(99,102,241,0.5)] transition-all hover:-translate-y-0.5 w-full sm:w-auto text-center"
            >
              Sign In to Cloud
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * Progress Bar Component
 */
export function ProgressBar() {
  const { stats } = useCardColumns();

  if (!stats || stats.totalCards === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
        <p className="text-center text-slate-500 font-medium">Add words to get started</p>
      </div>
    );
  }

  const toLearnPercent = (stats.toLearnCards / stats.totalCards) * 100;
  const learningPercent = (stats.learningCards / stats.totalCards) * 100;
  const masteredPercent = (stats.masteredCards / stats.totalCards) * 100;

  return (
    <section className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2 text-slate-800">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-base md:text-lg">Learning Progress</h2>
        </div>

        {/* Multi-Segment Progress Bar */}
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${toLearnPercent}%` }}
            className="bg-primary-400 transition-all duration-500"
            title={`To Learn: ${stats.toLearnCards}`}
          />
          <div
            style={{ width: `${learningPercent}%` }}
            className="bg-amber-400 transition-all duration-500"
            title={`Learning: ${stats.learningCards}`}
          />
          <div
            style={{ width: `${masteredPercent}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Mastered: ${stats.masteredCards}`}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 font-semibold px-1 pt-1">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-400 mr-1.5" />
            To Learn ({stats.toLearnCards})
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-1.5" />
            Learning ({stats.learningCards})
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />
            Mastered ({stats.masteredCards})
          </span>
        </div>
      </div>
    </section>
  );
}
