/**
 * Search and Filter Toolbar Component
 */

'use client';

import { useState } from 'react';
import { Search, X, Filter, Plus, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useVocabStore } from '@/lib/store';
import { useDebouncedSearch } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';

interface ToolbarProps {
  onAddClick: () => void;
  onFlashcardClick: () => void;
}

export function SearchToolbar({ onAddClick, onFlashcardClick }: ToolbarProps) {
  const { user } = useAuth();
  const session = user ? { user } : null;
  const isAdmin = session?.user?.role === 'ADMIN';
  const filters = useVocabStore((state) => state.filters);
  const setFilters = useVocabStore((state) => state.setFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useDebouncedSearch(
    (query) => setFilters({ searchQuery: query }),
    300
  );

  const activeFilterCount =
    (filters.sortBy && filters.sortBy !== 'default' ? 1 : 0) +
    (filters.pos ? 1 : 0) +
    (filters.mood ? 1 : 0) +
    (filters.connotation ? 1 : 0) +
    (filters.difficulty ? 1 : 0);

  const clearFilters = () => {
    setFilters({
      sortBy: 'default',
      pos: undefined,
      mood: undefined,
      connotation: undefined,
      difficulty: undefined
    });
  };

  return (
    <section className="flex flex-col gap-3 relative z-30">
      {/* Top Row: Search & Actions */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">

        {/* Search Box & Filter Toggle */}
        <div className="flex w-full md:max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
            <input
              type="text"
              placeholder="Search words, meanings..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-md pl-10 pr-9 py-2.5 rounded-2xl text-slate-800 border border-slate-200/60 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] relative z-0"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-2xl border transition-all flex items-center justify-center relative shadow-sm hover:shadow-md ${showFilters || activeFilterCount > 0
              ? 'bg-primary-50 border-primary-200 text-primary-600'
              : 'bg-white/80 backdrop-blur-md border-slate-200/60 text-slate-600 hover:bg-white'
              }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={onFlashcardClick}
            className="px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-2xl font-black text-sm shadow-[0_8px_20px_-6px_rgba(var(--color-primary-500),0.5)] hover:shadow-[0_12px_25px_-6px_rgba(var(--color-primary-500),0.6)] hover:-translate-y-0.5 transition-all flex items-center space-x-2 shrink-0 group active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Daily Practice</span>
          </button>

          {isAdmin && (
            <button
              onClick={onAddClick}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_25px_-6px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all flex items-center space-x-2 shrink-0 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Add Word</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="bg-white/95 backdrop-blur-xl p-4 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col gap-4 animate-scale-up absolute top-[110%] left-0 right-0 md:right-auto md:w-[400px]">
          {/* Sort */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
              <Filter className="w-3 h-3 mr-1" /> Sort Order
            </h4>
            <select
              value={filters.sortBy || 'default'}
              onChange={(e) => setFilters({ sortBy: e.target.value as any })}
              className="w-full bg-slate-50 px-4 py-2.5 rounded-2xl text-slate-700 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary-500/20 text-xs font-bold shadow-sm cursor-pointer hover:bg-white transition-colors"
            >
              <option value="default">Spreadsheet Sequence</option>
              <option value="alphabetical">Word (A to Z)</option>
              <option value="meaningLength">Definition Length</option>
              <option value="recentlyAdded">Recently Added</option>
            </select>
          </div>

          {/* Attributes */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Attributes
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Parts of Speech', value: filters.pos, key: 'pos', options: ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Preposition', 'Conjunction', 'Interjection'] },
                { label: 'Moods', value: filters.mood, key: 'mood', options: ['Positive', 'Negative', 'Neutral', 'Determined', 'Excited', 'Anxious'] },
                { label: 'Connotations', value: filters.connotation, key: 'connotation', options: ['Positive', 'Negative', 'Neutral'] },
                { label: 'Difficulties', value: filters.difficulty, key: 'difficulty', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
              ].map((filter) => (
                <select
                  key={filter.key}
                  value={filter.value || ''}
                  onChange={(e) => setFilters({ [filter.key]: e.target.value || undefined })}
                  className="bg-slate-50 px-3 py-2 rounded-xl text-slate-700 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary-500/10 text-[11px] font-bold shadow-sm cursor-pointer hover:bg-white transition-colors"
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors px-2 py-1 rounded-md hover:bg-rose-50"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
