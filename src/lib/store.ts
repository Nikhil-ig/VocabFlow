/**
 * Zustand Store for VocabFlow
 * Manages global client-side state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VocabularyCard, LearningStatus, FilterOptions, UserStatistics, BoardColumn, SystemSettings } from '@/types';

interface VocabFlowStore {
  // State
  cards: VocabularyCard[];
  boardColumns: BoardColumn[];
  systemSettings: SystemSettings | null;
  statistics: UserStatistics | null;
  filters: FilterOptions;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  isMobile: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCards: (cards: VocabularyCard[]) => void;
  setBoardColumns: (cols: BoardColumn[]) => void;
  setSystemSettings: (settings: SystemSettings) => void;
  addCard: (card: VocabularyCard) => void;
  updateCardLocal: (id: string, updates: Partial<VocabularyCard>) => void;
  removeCard: (id: string) => void;

  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;

  setStatistics: (stats: UserStatistics) => void;
  updateStatistics: (updates: Partial<UserStatistics>) => void;

  setNotification: (notification: VocabFlowStore['notification']) => void;
  clearNotification: () => void;
  setIsMobile: (isMobile: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getCardsByStatus: (status: LearningStatus) => VocabularyCard[];
  getCardsByColumn: (columnId: string) => VocabularyCard[];
  getMasteryRate: () => number;
}

const initialFilters: FilterOptions = {
  searchQuery: '',
  sortBy: 'default',
};

const initialStats: UserStatistics = {
  totalCards: 0,
  masteredCards: 0,
  learningCards: 0,
  toLearnCards: 0,
  masteryPercentage: 0,
  lastUpdated: new Date(),
  totalReviewsToday: 0,
  averageReviewsPerDay: 0,
  streakDays: 0,
};

export const useVocabStore = create<VocabFlowStore>()(
  persist(
    (set, get) => ({
      cards: [],
      boardColumns: [],
      systemSettings: null,
      statistics: initialStats,
      filters: initialFilters,
      notification: null,
      isMobile: false,
      isLoading: false,
      error: null,

      setCards: (cards) => set({ cards }),
      setBoardColumns: (cols) => set({ boardColumns: cols }),
      setSystemSettings: (settings) => set({ systemSettings: settings }),

      addCard: (card) => set((state) => ({
        cards: [...state.cards, card],
      })),

      updateCardLocal: (id, updates) => set((state) => ({
        cards: state.cards.map((card) =>
          card.id === id ? { ...card, ...updates, updatedAt: new Date() } : card
        ),
      })),

      removeCard: (id) => set((state) => ({
        cards: state.cards.filter((card) => card.id !== id),
      })),

      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
      })),
      resetFilters: () => set({ filters: initialFilters }),

      setStatistics: (stats) => set({ statistics: stats }),
      updateStatistics: (updates) => set((state) => ({
        statistics: state.statistics ? { ...state.statistics, ...updates } : null,
      })),

      setNotification: (notification) => set({ notification }),
      clearNotification: () => set({ notification: null }),
      setIsMobile: (isMobile) => set({ isMobile }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      getCardsByStatus: (status) => {
        const state = get();
        return state.cards.filter((card) => card.status === status);
      },
      
      getCardsByColumn: (columnId) => {
        const state = get();
        return state.cards.filter((card) => card.columnId === columnId);
      },

      getMasteryRate: () => {
        const state = get();
        if (state.cards.length === 0) return 0;
        const mastered = state.cards.filter((c) => c.status === LearningStatus.MASTERED || c.column?.name.toLowerCase().includes('master')).length;
        return Math.round((mastered / state.cards.length) * 100);
      },
    }),
    {
      name: 'vocabflow-storage',
      partialize: (state) => ({
        cards: state.cards,
        boardColumns: state.boardColumns,
        statistics: state.statistics,
        systemSettings: state.systemSettings,
      }),
    }
  )
);
