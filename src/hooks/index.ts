/**
 * Custom Hooks for VocabFlow
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { VocabularyCard, LearningStatus } from '@/types';
import { useVocabStore } from '@/lib/store';

/**
 * Hook for Text-to-Speech functionality
 */
export const useTextToSpeech = () => {
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const { setNotification } = useVocabStore();

  const speak = useCallback((text: string, options?: { rate?: number }) => {
    if (typeof window === 'undefined') return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = options?.rate || 0.9;

      utterance.onstart = () => setSpeakingWord(text);
      utterance.onend = () => setSpeakingWord(null);
      utterance.onerror = () => {
        setSpeakingWord(null);
        setNotification({
          message: 'Text-to-speech error occurred',
          type: 'error',
        });
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setNotification({
        message: 'Text-to-speech not supported in this browser',
        type: 'error',
      });
    }
  }, [setNotification]);

  return { speak, speakingWord };
};

/**
 * Hook for Flashcard Quiz Logic
 */
import { apiClient } from '@/services/api';

export const useFlashcardQuiz = () => {
  const [currentCard, setCurrentCard] = useState<VocabularyCard | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [practicePool, setPracticePool] = useState<VocabularyCard[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setNotification } = useVocabStore();

  const startQuiz = useCallback(async () => {
    setIsOpen(true);
    setIsLoading(true);
    try {
      const response = await apiClient.getPracticeCards(10);
      if (response.success && response.data && response.data.length > 0) {
        const pool = response.data;
        setPracticePool(pool);
        setCurrentCard(pool[0]);
        setIsRevealed(false);
      } else {
        setCurrentCard(null);
        setNotification({
          message: 'No cards available to practice!',
          type: 'info',
        });
      }
    } catch (error) {
      console.error('Failed to start quiz:', error);
      setNotification({
        message: 'Failed to load practice cards',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [setNotification]);

  const nextCard = useCallback(() => {
    setPracticePool((prevPool) => {
      if (prevPool.length <= 1) {
        // Pool is empty, restart quiz to fetch new cards
        startQuiz();
        return [];
      }
      const newPool = prevPool.slice(1);
      setCurrentCard(newPool[0]);
      setIsRevealed(false);
      return newPool;
    });
  }, [startQuiz]);

  const closeQuiz = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
        setCurrentCard(null);
        setIsRevealed(false);
        setPracticePool([]);
    }, 300); // Wait for transition
  }, []);

  return {
    currentCard,
    isRevealed,
    isOpen,
    isLoading,
    setIsRevealed,
    startQuiz,
    nextCard,
    closeQuiz,
  };
};

/**
 * Hook for Responsive Detection
 */
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const setMobileStore = useVocabStore((state) => state.setIsMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setMobileStore(mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setMobileStore]);

  return isMobile;
};

/**
 * Hook for Auto-dismiss Notifications
 */
export const useAutoNotification = (duration = 3000) => {
  const { notification, clearNotification } = useVocabStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification, duration]);
};

/**
 * Hook for Infinite Scroll
 */
export const useInfiniteScroll = (
  onIntersect: () => void,
  hasMore: boolean,
  isLoading: boolean
) => {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  const ref = useCallback(
    (element: HTMLElement | null) => {
      setNode(element);
    },
    []
  );

  useEffect(() => {
    if (!node || !hasMore || isLoading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onIntersectRef.current();
      }
    }, {
      rootMargin: '100px',
    });

    observer.current.observe(node);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [node, hasMore, isLoading]);

  return { ref };
};

/**
 * Hook for Card Column Operations
 */
export const useCardColumns = () => {
  const cards = useVocabStore((state) => state.cards);
  const boardColumns = useVocabStore((state) => state.boardColumns);
  const statistics = useVocabStore((state) => state.statistics);

  const columns: Record<string, VocabularyCard[]> = {};
  
  boardColumns.forEach(col => {
    columns[col.id] = cards.filter(c => c.columnId === col.id);
  });

  // Handle unassigned cards by putting them in the first column
  const unassigned = cards.filter(c => !c.columnId);
  if (unassigned.length > 0 && boardColumns.length > 0) {
    const firstColId = boardColumns[0].id;
    if (columns[firstColId]) {
      columns[firstColId] = [...columns[firstColId], ...unassigned];
    }
  }

  return { columns, boardColumns, stats: statistics };
};

/**
 * Hook for Drag and Drop State
 */
export const useDragDropState = () => {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = useCallback((id: string) => {
    setDraggingId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  return {
    draggingId,
    handleDragStart,
    handleDragEnd,
  };
};

/**
 * Hook for Form Handling with Validation
 */
export const useCardForm = (initialCard?: VocabularyCard) => {
  const boardColumns = useVocabStore((state) => state.boardColumns);
  const defaultColId = boardColumns.length > 0 ? boardColumns[0].id : '';

  const [formData, setFormData] = useState({
    word: initialCard?.word || '',
    meaning: initialCard?.meaning || '',
    example: initialCard?.example || '',
    columnId: initialCard?.columnId || defaultColId,
    pos: initialCard?.pos || '',
    synonyms: initialCard?.synonyms || '',
    antonyms: initialCard?.antonyms || '',
    pronunciation: initialCard?.pronunciation || '',
    rootWords: initialCard?.rootWords || '',
    mood: initialCard?.mood || '',
    difficulty: initialCard?.difficulty || '',
    connotation: initialCard?.connotation || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialCard) {
      setFormData({
        word: initialCard.word,
        meaning: initialCard.meaning,
        example: initialCard.example || '',
        columnId: initialCard.columnId || defaultColId,
        pos: initialCard.pos || '',
        synonyms: initialCard.synonyms || '',
        antonyms: initialCard.antonyms || '',
        pronunciation: initialCard.pronunciation || '',
        rootWords: initialCard.rootWords || '',
        mood: initialCard.mood || '',
        difficulty: initialCard.difficulty || '',
        connotation: initialCard.connotation || '',
      });
    } else {
      setFormData({
        word: '',
        meaning: '',
        example: '',
        columnId: defaultColId,
        pos: '',
        synonyms: '',
        antonyms: '',
        pronunciation: '',
        rootWords: '',
        mood: '',
        difficulty: '',
        connotation: '',
      });
    }
  }, [initialCard]);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.word.trim()) {
      newErrors.word = 'Word is required';
    }
    if (!formData.meaning.trim()) {
      newErrors.meaning = 'Meaning is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const reset = useCallback(() => {
    setFormData({
      word: initialCard?.word || '',
      meaning: initialCard?.meaning || '',
      example: initialCard?.example || '',
      columnId: initialCard?.columnId || defaultColId,
      pos: initialCard?.pos || '',
      synonyms: initialCard?.synonyms || '',
      antonyms: initialCard?.antonyms || '',
      pronunciation: initialCard?.pronunciation || '',
      rootWords: initialCard?.rootWords || '',
      mood: initialCard?.mood || '',
      difficulty: initialCard?.difficulty || '',
      connotation: initialCard?.connotation || '',
    });
    setErrors({});
  }, [initialCard]);

  return {
    formData,
    errors,
    validate,
    handleChange,
    reset,
    setFormData,
  };
};

/**
 * Hook for Debounced Search
 */
export const useDebouncedSearch = (callback: (query: string) => void, delay = 300) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      callback(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, callback, delay]);

  return [value, setValue] as const;
};
