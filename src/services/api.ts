/**
 * API Client Service
 * Centralized HTTP communication with backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  VocabularyCard,
  ApiResponse,
  FilterOptions,
  UserStatistics,
  WordHistory,
  BulkOperationResult,
  BoardColumn,
  Recommendation,
} from '@/types';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

class VocabFlowAPIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axiosInstance;

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // ==================== COLUMNS ====================

  /**
   * Get all dynamic board columns
   */
  async getColumns() {
    try {
      const response = await this.client.get<ApiResponse<BoardColumn[]>>(
        '/columns'
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch columns: ${error}`);
    }
  }

  async createColumn(data: Partial<BoardColumn>) {
    try {
      const response = await this.client.post<ApiResponse<BoardColumn>>(
        '/columns',
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create column: ${error}`);
    }
  }

  async updateColumn(id: string, data: Partial<BoardColumn>) {
    try {
      const response = await this.client.put<ApiResponse<BoardColumn>>(
        `/columns/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update column: ${error}`);
    }
  }

  async deleteColumn(id: string) {
    try {
      const response = await this.client.delete<ApiResponse<{ id: string }>>(
        `/columns/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete column: ${error}`);
    }
  }

  // ==================== VOCABULARY CARDS ====================

  /**
   * Get all vocabulary cards with optional filtering and pagination
   */
  async getCards(filters?: Partial<FilterOptions>, page = 1, limit = 50) {
    try {
      const response = await this.client.get<ApiResponse<VocabularyCard[]>>(
        '/cards',
        {
          params: {
            q: filters?.searchQuery,
            status: filters?.status,
            columnId: filters?.columnId,
            sortBy: filters?.sortBy,
            pos: filters?.pos,
            mood: filters?.mood,
            connotation: filters?.connotation,
            difficulty: filters?.difficulty,
            page,
            limit,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      const serverError = error.response?.data?.error || error.message;
      throw new Error(`Failed to fetch cards: ${serverError}`);
    }
  }

  /**
   * Get single card by ID
   */
  async getCard(id: string) {
    try {
      const response = await this.client.get<ApiResponse<VocabularyCard>>(
        `/cards/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch card: ${error}`);
    }
  }

  /**
   * Get practice cards (Spaced Repetition)
   */
  async getPracticeCards(limit = 10) {
    try {
      const response = await this.client.get<ApiResponse<VocabularyCard[]>>(
        '/cards/practice',
        { params: { limit } }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch practice cards: ${error}`);
    }
  }

  /**
   * Create new vocabulary card
   */
  async createCard(data: Omit<VocabularyCard, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await this.client.post<ApiResponse<VocabularyCard>>(
        '/cards',
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create card: ${error}`);
    }
  }

  /**
   * Update existing card
   */
  async updateCard(id: string, data: Partial<VocabularyCard>) {
    try {
      const response = await this.client.put<ApiResponse<VocabularyCard>>(
        `/cards/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update card: ${error}`);
    }
  }

  /**
   * Delete card
   */
  async deleteCard(id: string) {
    try {
      const response = await this.client.delete<ApiResponse<{ deleted: boolean }>>(
        `/cards/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete card: ${error}`);
    }
  }

  /**
   * Bulk create cards from CSV/array
   */
  async bulkCreateCards(cards: Array<Omit<VocabularyCard, 'id' | 'createdAt' | 'updatedAt'>>) {
    try {
      const response = await this.client.post<ApiResponse<BulkOperationResult>>(
        '/cards/bulk',
        { cards }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to bulk create cards: ${error}`);
    }
  }

  // ==================== USER HISTORY & TRACKING ====================

  /**
   * Record user action on a card
   */
  async recordHistory(cardId: string, data: Partial<WordHistory>) {
    try {
      const response = await this.client.post<ApiResponse<WordHistory>>(
        `/history`,
        { cardId, ...data }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to record history: ${error}`);
    }
  }

  /**
   * Get history for a specific card
   */
  async getCardHistory(cardId: string) {
    try {
      const response = await this.client.get<ApiResponse<WordHistory[]>>(
        `/history/card/${cardId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch card history: ${error}`);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics() {
    try {
      const response = await this.client.get<ApiResponse<UserStatistics>>(
        '/statistics'
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch statistics: ${error}`);
    }
  }

  // ==================== SEARCH & FILTER ====================

  /**
   * Advanced search with filters
   */
  async searchCards(query: string, filters?: Partial<FilterOptions>) {
    try {
      const response = await this.client.get<ApiResponse<VocabularyCard[]>>(
        '/cards/search',
        {
          params: {
            q: query,
            ...filters,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search cards: ${error}`);
    }
  }

  // ==================== AI & ANALYTICS ====================

  /**
   * Get the global daily Word of the Day
   */
  async getWordOfTheDay(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await this.client.get<ApiResponse<any>>('/ai/word-of-the-day');
      return response.data;
    } catch (error: any) {
      const serverError = error.response?.data?.error || error.message;
      return { success: false, error: serverError };
    }
  }

  /**
   * Enrich word with metadata using AI
   */
  async enrichWordMetadata(word: string, meaning?: string) {
    try {
      const response = await this.client.post<ApiResponse<any>>(
        '/ai/enrich',
        { word, meaning }
      );
      return response.data;
    } catch (error: any) {
      const serverError = error.response?.data?.error || error.message;
      throw new Error(`Failed to enrich word: ${serverError}`);
    }
  }

  /**
   * Get AI-powered learning recommendations
   */
  async getRecommendations(): Promise<{ success: boolean; data?: Recommendation[]; error?: string }> {
    try {
      const response = await this.client.get('/ai/recommendations');
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // --- Analytics ---
  async getActivity(days: number = 7): Promise<{ success: boolean; data?: { date: string, reviews: number, masteries: number }[]; error?: string }> {
    try {
      const response = await this.client.get(`/analytics/activity?days=${days}`);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getDistribution(): Promise<{ success: boolean; data?: { partOfSpeech: any[], status: any[] }; error?: string }> {
    try {
      const response = await this.client.get('/analytics/distribution');
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get learning insights
   */
  async getLearningInsights() {
    try {
      const response = await this.client.get<ApiResponse>(
        '/analytics/insights'
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch insights: ${error}`);
    }
  }
}

// Export singleton instance
export const apiClient = new VocabFlowAPIClient();
