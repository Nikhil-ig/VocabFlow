/**
 * Vocabulary Card Component
 */

'use client';

import { useState, useRef } from 'react';
import { LearningStatus, VocabularyCard } from '@/types';
import { Edit2, Trash2, Volume2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { DropdownMenu } from './DropdownMenu';
import { useVocabStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { SpeakerButton } from './SpeakerButton';

interface CardProps {
  card: VocabularyCard;
  onEdit: (card: VocabularyCard) => void;
  onDelete: (id: string) => void;
  onMove: (newStatus: string) => void;
}

export function VocabCard({
  card,
  onEdit,
  onDelete,
  onMove,
}: CardProps) {
  const boardColumns = useVocabStore((state) => state.boardColumns);
  const systemSettings = useVocabStore((state) => state.systemSettings);
  const { user } = useAuth();
  const session = user ? { user } : null;
  const isAdmin = session?.user?.role === 'ADMIN';
  const isGuest = !session;
  const cardStyle = systemSettings?.cardStyle || 'modern';
  const [isExpanded, setIsExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });

  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: isDragging ? 50 : undefined,
    }
    : undefined;

  const statusColor: Record<string, string> = {
    [LearningStatus.TO_LEARN]: 'border-primary-200',
    [LearningStatus.LEARNING]: 'border-amber-200',
    [LearningStatus.MASTERED]: 'border-emerald-200',
  };

  const cardStyleClass =
    cardStyle === '3d' ? `border-4 border-b-8 ${statusColor[card.status] || 'border-slate-900'} rounded-2xl hover:-translate-y-1 hover:border-b-4` :
      cardStyle === 'classic' ? `border ${statusColor[card.status] || 'border-slate-300'} rounded-md` :
        `border ${statusColor[card.status] || 'border-slate-100'} border-l-4 rounded-2xl shadow-sm hover:shadow-md`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 transition-all duration-200 group relative ${cardStyleClass} ${isDragging ? 'opacity-50 ring-2 ring-primary-500 shadow-xl scale-95' : ''
        }`}
    >
      {/* Top Bar */}
      <div className="flex justify-between items-start mb-2 gap-1">
        <div
          {...attributes}
          {...listeners}
          className="flex-1 cursor-grab active:cursor-grabbing min-w-0 pr-1 flex items-center space-x-1.5"
          title="Drag to move"
        >
          <h4 className="font-extrabold text-slate-800 text-base leading-tight group-hover:text-primary-600 transition-colors select-none truncate">
            {card.word}
          </h4>
        </div>

        {/* Actions */}
        <div className="flex items-center shrink-0">
          <SpeakerButton word={card.word} className="p-1.5 mr-1 rounded-lg" />

          {isAdmin && (
            <DropdownMenu
              items={[
                {
                  icon: <Edit2 className="w-4 h-4" />,
                  label: 'Edit Word',
                  onClick: () => onEdit(card)
                },
                {
                  icon: <Trash2 className="w-4 h-4" />,
                  label: 'Delete',
                  onClick: () => onDelete(card.id),
                  destructive: true
                }
              ]}
            />
          )}
        </div>
      </div>

      {/* Meaning */}
      <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-3 pr-1">
        {card.meaning}
      </p>

      {/* Example */}
      {card.example && (
        <div className="mt-3 relative group/example">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-300/60 rounded-l-2xl group-hover/example:bg-primary-300 transition-colors z-10"></div>
          <div className="bg-primary-50/30 pl-5 py-2.5 pr-4 rounded-2xl border border-primary-100/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <span className="text-[9px] font-bold text-primary-400 uppercase tracking-widest block mb-1">
              Example Usage
            </span>
            <p className="text-[13px] italic text-slate-500 font-medium leading-relaxed">
              "{card.example}"
            </p>
          </div>
        </div>
      )}

      {/* Expandable Metadata Section */}
      {(card.pos || card.synonyms || card.antonyms || card.pronunciation || card.rootWords || card.mood || card.difficulty || card.connotation) && (
        <div className="mt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors w-full justify-center py-1 border-t border-slate-100"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" /> Less details
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" /> More details
              </>
            )}
          </button>

          {isExpanded && (
            <div className="pt-2 pb-1 space-y-2 text-xs border-t border-slate-100/50 mt-1">
              <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                {card.pos && (
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Part of Speech</span>
                    <span className="text-slate-700 font-medium">{card.pos}</span>
                  </div>
                )}
                {card.pronunciation && (
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Pronunciation</span>
                    <span className="text-slate-700 font-medium">{card.pronunciation}</span>
                  </div>
                )}
                {card.synonyms && (
                  <div className="col-span-2">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Synonyms</span>
                    <span className="text-slate-700 font-medium">{card.synonyms}</span>
                  </div>
                )}
                {card.antonyms && (
                  <div className="col-span-2">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Antonyms</span>
                    <span className="text-slate-700 font-medium">{card.antonyms}</span>
                  </div>
                )}
                {card.rootWords && (
                  <div className="col-span-2">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Root Words</span>
                    <span className="text-slate-700 font-medium">{card.rootWords}</span>
                  </div>
                )}
                {card.mood && (
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Mood</span>
                    <span className="text-slate-700 font-medium">{card.mood}</span>
                  </div>
                )}
                {card.difficulty && (
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Difficulty</span>
                    <span className="inline-block px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">{card.difficulty}</span>
                  </div>
                )}
                {card.connotation && (
                  <div className="col-span-2">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Connotation</span>
                    <span className="text-slate-700 font-medium">{card.connotation}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Move Buttons */}
      {!isGuest && (
        <div className="opacity-70 group-hover:opacity-100 transition-opacity flex items-center justify-end space-x-1.5 mt-3 pt-2 border-t border-slate-100/50 text-[10px] font-bold text-slate-400">
          <span>Move:</span>
          {boardColumns.filter(c => c.id !== card.columnId).slice(0, 3).map(col => (
            <button
              key={col.id}
              onClick={() => onMove(col.id)}
              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
            >
              {col.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Mobile Card Component
 */

export function MobileCard({
  card,
  onEdit,
  onDelete,
  onMove,
}: CardProps) {
  const boardColumns = useVocabStore((state) => state.boardColumns);
  const systemSettings = useVocabStore((state) => state.systemSettings);
  const { user } = useAuth();
  const session = user ? { user } : null;
  const isAdmin = session?.user?.role === 'ADMIN';
  const isGuest = !session;
  const cardStyle = systemSettings?.cardStyle || 'modern';
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;

    // Dampen the swipe (limit max swipe distance)
    const dampened = Math.max(-120, Math.min(120, diff * 0.8));
    setSwipeOffset(dampened);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (touchStartX.current === null) return;

    if (swipeOffset > 70 && !isGuest) {
      // Swipe Right -> Last Column (Mastered usually)
      triggerHaptic(50);
      if (boardColumns.length > 0) {
        onMove(boardColumns[boardColumns.length - 1].id);
      }
    } else if (swipeOffset < -70 && !isGuest) {
      // Swipe Left -> Delete
      triggerHaptic([50, 50, 50]);
      onDelete(card.id);
    }

    setSwipeOffset(0);
    touchStartX.current = null;
  };

  return (
    <div className="relative rounded-xl bg-slate-100 overflow-hidden mb-3">
      {/* Background actions (visible when swiping) */}
      {!isGuest && (
        <div className="absolute inset-0 flex items-center justify-between px-4 font-bold z-0">
          <div className={`flex items-center space-x-2 transition-opacity ${swipeOffset > 20 ? 'opacity-100 text-emerald-600' : 'opacity-0'}`}>
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Mastered</span>
          </div>
          <div className={`flex items-center space-x-2 transition-opacity ${swipeOffset < -20 ? 'opacity-100 text-rose-600' : 'opacity-0'}`}>
            <span className="text-sm">Delete</span>
            <Trash2 className="w-5 h-5" />
          </div>
        </div>
      )}

      <div
        className={`bg-white p-4 sm:p-5 flex flex-col justify-between space-y-3.5 z-10 relative ${!isSwiping ? 'transition-all duration-300 ease-out' : ''} ${cardStyle === '3d' ? 'rounded-3xl border-4 border-slate-900 border-b-[8px]' :
          cardStyle === 'classic' ? 'border border-slate-300 rounded-2xl' :
            'rounded-3xl shadow-sm border border-slate-100 bg-gradient-to-br from-white to-slate-50'
          }`}
        style={{
          transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.03}deg)`,
          boxShadow: isSwiping ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-start mb-2 gap-3">
            <div className="flex items-start space-x-3 min-w-0 flex-1">
              <h4 className="font-black font-outfit text-slate-800 text-lg tracking-tight leading-none pt-1 truncate">{card.word}</h4>
              <SpeakerButton
                word={card.word}
                className="p-2 rounded-full"
                activeClassName="bg-primary-500 text-white shadow-lg shadow-primary-500/40 animate-pulse scale-110"
                inactiveClassName="bg-primary-50 hover:bg-primary-100 text-primary-600"
                onClick={() => triggerHaptic(20)}
              />
            </div>
            <div className="flex items-center shrink-0">
              {isAdmin && (
                <DropdownMenu
                  items={[
                    {
                      icon: <Edit2 className="w-4 h-4" />,
                      label: 'Edit',
                      onClick: () => {
                        triggerHaptic(20);
                        onEdit(card);
                      }
                    },
                    {
                      icon: <Trash2 className="w-4 h-4" />,
                      label: 'Delete',
                      onClick: () => {
                        triggerHaptic([50, 50]);
                        onDelete(card.id);
                      },
                      destructive: true
                    }
                  ]}
                />
              )}
            </div>
          </div>

          {/* Body */}
          <p className="text-[15px] text-slate-600 leading-relaxed font-medium">{card.meaning}</p>
        </div>

        {/* Example */}
        {card.example && (
          <div className="bg-slate-50 p-2.5 rounded-lg border-l-2 border-slate-200">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
              Example
            </span>
            <p className="text-xs italic text-slate-600">"{card.example}"</p>
          </div>
        )}

        {/* Expandable Metadata Section */}
        {(card.pos || card.synonyms || card.antonyms || card.pronunciation || card.rootWords || card.mood || card.difficulty || card.connotation) && (
          <div className="mt-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center text-[11px] font-bold text-slate-400 hover:text-primary-600 transition-colors w-full justify-center py-1 border-t border-slate-100"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" /> Less details
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" /> More details
                </>
              )}
            </button>

            {isExpanded && (
              <div className="pt-3 pb-1 flex flex-wrap gap-2 border-t border-slate-100/80 mt-2">
                {card.pos && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                    {card.pos}
                  </span>
                )}
                {card.pronunciation && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                    /{card.pronunciation}/
                  </span>
                )}
                {card.mood && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">
                    {card.mood}
                  </span>
                )}
                {card.difficulty && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
                    {card.difficulty}
                  </span>
                )}
                {card.connotation && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-100">
                    {card.connotation}
                  </span>
                )}

                {/* Detailed Text Sections */}
                <div className="w-full space-y-2 mt-2">
                  {card.synonyms && (
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Synonyms</span>
                      <span className="text-slate-700 text-xs font-semibold">{card.synonyms}</span>
                    </div>
                  )}
                  {card.antonyms && (
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Antonyms</span>
                      <span className="text-slate-700 text-xs font-semibold">{card.antonyms}</span>
                    </div>
                  )}
                  {card.rootWords && (
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Root Words</span>
                      <span className="text-slate-700 text-xs font-semibold">{card.rootWords}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {!isGuest && boardColumns.length >= 2 && card.columnId === boardColumns[0].id && (
          <div className="pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                  window.navigator.vibrate(30);
                }
                onMove(boardColumns[1].id);
              }}
              className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[13px] rounded-xl flex items-center justify-center transition-colors border border-amber-200/50"
            >
              Add to Learning
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
