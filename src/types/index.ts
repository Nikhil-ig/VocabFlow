/**
 * Core Types for VocabFlow Application
 * Defines all data structures and type safety
 */

/**
 * Learning Status Enum
 * Represents the progression stages of a vocabulary word
 */
export enum LearningStatus {
  TO_LEARN = 'TO_LEARN',
  LEARNING = 'LEARNING',
  MASTERED = 'MASTERED',
}

/**
 * Board Column Definition
 */
export interface BoardColumn {
  id: string;
  name: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  id: string;
  applicationName: string;
  primaryColor: string;
  enablePublicReg: boolean;
  spacedRepAlgorithm: string;
  uiStyle: string;
  cardStyle: string;
  fontFamily: string;
}

/**
 * Vocabulary Word Card
 * Core entity representing a single vocabulary entry
 */
export interface VocabularyCard {
  id: string;
  word: string;
  meaning: string;
  example?: string | null;
  status: LearningStatus; // Legacy enum, keep for type compat temporarily
  columnId?: string;
  column?: BoardColumn;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;

  // New Fields (12-column support)
  pos?: string;
  synonyms?: string;
  antonyms?: string;
  pronunciation?: string;
  rootWords?: string;
  mood?: string;
  difficulty?: string;
  connotation?: string;
}

/**
 * Word History Entry
 * Tracks user interactions and learning progress
 */
export interface WordHistory {
  id: string;
  cardId: string;
  userId?: string;
  action: HistoryAction;
  previousStatus?: string;
  newStatus?: string;
  timestamp: Date;
  timesReviewed: number;
  timesMarkedCorrect: number;
}

/**
 * History Action Types
 */
export enum HistoryAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  REVIEWED = 'REVIEWED',
  MASTERED = 'MASTERED',
  DELETED = 'DELETED',
}

/**
 * User Statistics
 * Aggregated learning metrics for a user
 */
export interface UserStatistics {
  userId?: string;
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  toLearnCards: number;
  masteryPercentage: number;
  lastUpdated: Date;
  totalReviewsToday: number;
  averageReviewsPerDay: number;
  streakDays: number;
}

export interface Recommendation {
  id: string;
  title: string;
  message: string;
  icon: string;
  actionLabel: string;
  type: 'alert' | 'info' | 'warning' | 'success' | 'primary';
}

/**
 * Flashcard Quiz Item
 * Represents a card during active review
 */
export interface FlashcardQuizItem {
  card: VocabularyCard;
  revealed: boolean;
  result?: 'correct' | 'incorrect' | null;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Filter and Sort Options
 */
export interface FilterOptions {
  searchQuery: string;
  status?: LearningStatus;
  sortBy: 'default' | 'alphabetical' | 'meaningLength' | 'recentlyAdded' | 'mostReviewed';
  columnId?: string;
  pos?: string;
  mood?: string;
  connotation?: string;
  difficulty?: string;
}

/**
 * Pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * AI Evaluation Result (for future AI integration)
 */
export interface AIEvaluationResult {
  cardId: string;
  confidence: number;
  recommendedStatus: LearningStatus;
  suggestedAlternativeMeaning?: string;
  learningPattern?: 'quick_learner' | 'slow_learner' | 'inconsistent';
}

/**
 * Bulk Operation Result
 */
export interface BulkOperationResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors?: Array<{ id: string; error: string }>;
}
