/**
 * Flashcard Quiz Modal Component
 */

'use client';

import { VocabularyCard } from '@/types';
import { useTextToSpeech } from '@/hooks';
import { SpeakerButton } from './SpeakerButton';
import { X, Sparkles, Lightbulb, ChevronRight, Volume2, Lock } from 'lucide-react';

import { useVocabStore } from '@/lib/store';

interface FlashcardModalProps {
  isOpen: boolean;
  isLoading: boolean;
  isGuest?: boolean;
  card: VocabularyCard | null;
  isRevealed: boolean;
  onClose: () => void;
  onReveal: () => void;
  onStatusChange: (status: string) => void;
  onNext: () => void;
}

export function FlashcardModal({
  isOpen,
  isLoading,
  isGuest,
  card,
  isRevealed,
  onClose,
  onReveal,
  onStatusChange,
  onNext,
}: FlashcardModalProps) {
  const boardColumns = useVocabStore(state => state.boardColumns);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scale-up">
        {/* Header */}
        <div className="bg-primary-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm">Practice Challenge</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 flex flex-col items-center text-center space-y-6">
          {isLoading || !card ? (
            <div className="w-full space-y-6 animate-pulse">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
                <div className="h-10 w-48 bg-slate-200 rounded-xl"></div>
              </div>
              <div className="w-full h-32 bg-slate-100 rounded-xl"></div>
            </div>
          ) : (
            <>
              {/* Word */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest bg-primary-50 px-2.5 py-1 rounded-full inline-block">
                  Flashcard
                </span>

                <div className="flex items-center justify-center space-x-3 pt-2">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight select-none">
                    {card.word}
                  </h2>
                  <SpeakerButton
                    word={card.word}
                    className="p-2 rounded-xl"
                    activeClassName="bg-primary-600 text-white animate-pulse"
                    inactiveClassName="bg-slate-100 hover:bg-slate-200 text-slate-700"
                    iconClassName="w-5 h-5"
                  />
                </div>
              </div>

              {/* Reveal Button or Content */}
              {!isRevealed ? (
                <button
                  onClick={onReveal}
                  className="w-full py-8 bg-slate-50 hover:bg-primary-50/30 rounded-xl border border-dashed border-slate-300 hover:border-primary-300 text-slate-500 hover:text-primary-600 transition-all flex flex-col items-center justify-center space-y-2 group"
                >
                  <Lightbulb className="w-8 h-8 text-primary-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm">Click to reveal definition & example</span>
                </button>
              ) : (
                <div className="space-y-4 w-full bg-slate-50 p-4 rounded-xl text-left border border-slate-100 animate-fade-in">
                  <div>
                    <span className="text-[9px] font-bold text-primary-600 uppercase tracking-wider block mb-0.5">
                      Meaning
                    </span>
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                      {card.meaning}
                    </p>
                  </div>
                  {card.example && (
                    <div className="pt-2.5 border-t border-slate-200">
                      <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block mb-0.5">
                        Example Usage
                      </span>
                      <p className="text-xs italic text-slate-600">"{card.example}"</p>
                    </div>
                  )}

                  {/* Extra Metadata */}
                  {(card.pos || card.synonyms || card.antonyms || card.pronunciation || card.rootWords || card.mood || card.difficulty || card.connotation) && (
                    <div className="pt-3 border-t border-slate-200">
                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                        {card.pos && (
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Part of Speech</span>
                            <span className="text-slate-700 font-medium">{card.pos}</span>
                          </div>
                        )}
                        {card.pronunciation && (
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Pronunciation</span>
                            <span className="text-slate-700 font-medium">{card.pronunciation}</span>
                          </div>
                        )}
                        {card.synonyms && (
                          <div className="col-span-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Synonyms</span>
                            <span className="text-slate-700 font-medium">{card.synonyms}</span>
                          </div>
                        )}
                        {card.antonyms && (
                          <div className="col-span-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Antonyms</span>
                            <span className="text-slate-700 font-medium">{card.antonyms}</span>
                          </div>
                        )}
                        {card.rootWords && (
                          <div className="col-span-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Root Words</span>
                            <span className="text-slate-700 font-medium">{card.rootWords}</span>
                          </div>
                        )}
                        {card.mood && (
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Mood</span>
                            <span className="text-slate-700 font-medium">{card.mood}</span>
                          </div>
                        )}
                        {card.difficulty && (
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Difficulty</span>
                            <span className="inline-block px-1.5 py-0.5 rounded-full bg-slate-200/50 text-[10px] font-bold text-slate-600">{card.difficulty}</span>
                          </div>
                        )}
                        {card.connotation && (
                          <div className="col-span-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Connotation</span>
                            <span className="text-slate-700 font-medium">{card.connotation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Actions */}
              {isRevealed && (
                <div className="w-full space-y-3 pt-2">
                  <p className="text-xs text-slate-400 font-bold">How did you do?</p>

                  {isGuest ? (
                    <div className="bg-slate-100 p-4 rounded-xl text-center border border-slate-200 flex flex-col items-center space-y-2">
                      <Lock className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">Progress Tracking is Locked</span>
                      <a href="/login" className="text-[10px] font-bold text-primary-600 hover:underline">Login to Unlock</a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {boardColumns.map(col => {
                        const textColor = col.color.includes('text') ? col.color.split(' ').find(c => c.startsWith('text')) : 'text-primary';
                        const borderColor = col.color.includes('border') ? col.color.split(' ').find(c => c.startsWith('border')) : 'border-primary';
                        const hoverColor = col.color.includes('bg') ? col.color.split(' ').find(c => c.startsWith('bg'))?.replace('bg-', 'hover:bg-') + '/20' : 'hover:bg-primary/10';

                        return (
                          <button
                            key={col.id}
                            onClick={() => onStatusChange(col.id)}
                            className={`py-2.5 bg-slate-50 ${hoverColor} border ${borderColor} ${textColor} rounded-lg text-xs font-bold transition-colors`}
                          >
                            {col.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={onNext}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>Next Word</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}