/**
 * Mobile Tab View Component
 */

'use client';

import { BoardColumn, VocabularyCard } from '@/types';
import { VocabCard } from './Card';
import { useInfiniteScroll } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { Lock } from 'lucide-react';

interface MobileTabViewProps {
  boardColumns: BoardColumn[];
  columns: Record<string, VocabularyCard[]>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEdit: (card: VocabularyCard) => void;
  onDelete: (id: string) => void;
  onMove: (cardId: string, newStatus: string) => void;
  onLoadMore: (columnId: string) => void;
  pagination: Record<string, { page: number, hasMore: boolean, isLoading: boolean, total: number }>;
}

export function MobileTabView({
  boardColumns,
  columns,
  activeTab,
  onTabChange,
  onEdit,
  onDelete,
  onMove,
  onLoadMore,
  pagination,
}: MobileTabViewProps) {
  const { user } = useAuth();
  const session = user ? { user } : null;
  const isGuest = !session;

  const currentPaging = pagination[activeTab];
  const hasMore = currentPaging?.hasMore || false;
  const isLoading = currentPaging?.isLoading || false;

  const { ref: loadMoreRef } = useInfiniteScroll(
    () => onLoadMore(activeTab),
    hasMore,
    isLoading
  );
  
  const activeColumnIndex = boardColumns.findIndex(c => c.id === activeTab);
  const isLockedTab = isGuest && activeColumnIndex > 0;

  return (
    <div className="space-y-4">
      {/* Segmented Control */}
      <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-full shadow-inner border border-slate-200/50 flex overflow-x-auto scrollbar-none snap-x relative">
        {boardColumns.map((col, index) => {
          const isActive = activeTab === col.id;
          const isLocked = isGuest && index > 0;
          const textColor = col.color.includes('text') ? col.color.split(' ').find(c => c.startsWith('text')) : 'text-primary-600';
          const activeColorClass = isActive ? `${textColor} bg-white shadow-sm ring-1 ring-slate-900/5 scale-[1.02]` : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50';

          return (
            <button
              key={col.id}
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
                onTabChange(col.id);
              }}
              className={`flex-1 text-center py-2 px-4 whitespace-nowrap flex items-center justify-center space-x-1.5 text-xs font-bold rounded-full transition-all duration-300 ease-spring snap-center ${activeColorClass}`}
            >
              {isLocked && <Lock className="w-3 h-3 opacity-60" />}
              <span>{col.name}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-slate-100' : 'bg-transparent'}`}>{pagination[col.id]?.total ?? columns[col.id]?.length ?? 0}</span>
            </button>
          );
        })}
      </div>

      {/* Card Stack */}
      <div className="space-y-3">
        {isLockedTab ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-200 flex flex-col items-center justify-center">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <Lock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-700 font-black text-lg mb-2">Column Locked</h3>
            <p className="text-slate-500 text-sm font-medium mb-4">
              You are exploring in Guest Mode. Login to track your progress across multiple columns!
            </p>
            <a href="/login" className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition-colors">
              Login to Unlock
            </a>
          </div>
        ) : columns[activeTab]?.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm font-semibold">No words in this category</p>
          </div>
        ) : (
          columns[activeTab]?.map((card, idx) => (
            <div
              key={card.id}
              className="animate-slide-in-from-bottom-4 animate-fade-in fill-mode-both"
              style={{ animationDelay: `${idx * 50}ms`, animationDuration: '300ms' }}
            >
              <VocabCard
                card={card}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={(newStatus) => onMove(card.id, newStatus)}
              />
            </div>
          ))
        )}

        {/* Intersection Observer Target */}
        {hasMore && (
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
            {isLoading && (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-400 font-semibold py-4">
        Powered by OrbitoX.io
      </p>
    </div>
  );
}
