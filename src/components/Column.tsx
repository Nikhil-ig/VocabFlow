/**
 * Droppable Column Component
 */

'use client';

import { useDroppable } from '@dnd-kit/core';
import { BoardColumn, VocabularyCard } from '@/types';
import { HelpCircle, Lock } from 'lucide-react';
import { VocabCard } from './Card';
import { useVocabStore } from '@/lib/store';
import { useInfiniteScroll } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';

interface ColumnProps {
  column: BoardColumn;
  cards: VocabularyCard[];
  onEdit: (card: VocabularyCard) => void;
  onDelete: (id: string) => void;
  onMove: (cardId: string, newStatus: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  totalCount: number;
}

export function DroppableColumn({
  column,
  cards,
  onEdit,
  onDelete,
  onMove,
  onLoadMore,
  hasMore,
  isLoading,
  totalCount,
}: ColumnProps) {
  const systemSettings = useVocabStore((state) => state.systemSettings);
  const boardColumns = useVocabStore((state) => state.boardColumns);
  const uiStyle = systemSettings?.uiStyle || 'glassmorphism';
  
  const { user } = useAuth();
  const session = user ? { user } : null;
  const isGuest = !session;
  const isLockedTab = isGuest && boardColumns.length > 0 && column.id !== boardColumns[0].id;

  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
    disabled: isLockedTab
  });

  const { ref: loadMoreRef } = useInfiniteScroll(onLoadMore, hasMore, isLoading);

  // Extract base color from tailwind classes (e.g. text-indigo-600 bg-indigo-500)
  const borderColor = column.color.includes('border') ? column.color.split(' ').find(c => c.startsWith('border')) : 'border-slate-200';
  const bgColor = column.color.includes('bg') ? column.color.split(' ').find(c => c.startsWith('bg')) : 'bg-slate-500';

  const columnStyleClass =
    uiStyle === 'playful' ? 'border-4 border-slate-900 bg-slate-50 border-b-[12px] shadow-sm' :
      uiStyle === 'minimal' ? 'border-2 border-slate-200 bg-white' :
        'border-2 bg-slate-100/40 shadow-inner';

  return (
    <div
      ref={setNodeRef}
      className={`relative flex-1 flex flex-col rounded-2xl p-4 min-h-[500px] transition-all duration-300 overflow-hidden ${columnStyleClass} ${isOver ? 'border-dashed border-primary bg-primary/10 scale-[1.01]' : `${uiStyle === 'glassmorphism' ? borderColor : ''}`
        }`}
    >
      {isLockedTab && (
        <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/60 flex flex-col items-center justify-center rounded-2xl p-6 text-center">
          <div className="bg-slate-100 p-4 rounded-full mb-4 shadow-sm">
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
      )}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/50">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${bgColor}`} />
          <h3 className="font-bold text-slate-700 text-base">{column.name}</h3>
        </div>
        <span className="px-2 py-0.5 text-xs font-bold bg-slate-200 text-slate-600 rounded-full">
          {totalCount}
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1 scrollbar-thin">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className="animate-slide-in-from-bottom-4 animate-fade-in fill-mode-both"
            style={{ animationDelay: `${idx * 50}ms`, animationDuration: '300ms', marginBottom: '0.75rem' }}
          >
            <VocabCard
              card={card}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={(newStatus) => onMove(card.id, newStatus)}
            />
          </div>
        ))}

        {cards.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-200 rounded-xl bg-white/40">
            <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 font-bold">Column is empty</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Drag cards here</p>
          </div>
        )}

        {/* Intersection Observer Target */}
        {hasMore && (
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
            {isLoading && (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
