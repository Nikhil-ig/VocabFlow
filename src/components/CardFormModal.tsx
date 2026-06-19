/**
 * Card Form Modal Component
 */

'use client';

import { VocabularyCard } from '@/types';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useCardForm } from '@/hooks';
import { useVocabStore } from '@/lib/store';
import { apiClient } from '@/services/api';
import { useState } from 'react';

interface CardFormModalProps {
  card?: VocabularyCard;
  isOpen: boolean;
  title: string;
  onSubmit: (data: Omit<VocabularyCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export function CardFormModal({ card, isOpen, title, onSubmit, onClose }: CardFormModalProps) {
  const { formData, errors, validate, handleChange, reset } = useCardForm(card);
  const boardColumns = useVocabStore(state => state.boardColumns);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState('');

  if (!isOpen) return null;

  const handleEnrich = async () => {
    if (!formData.word) {
      setEnrichError('Please enter a word first');
      return;
    }
    setEnrichError('');
    setIsEnriching(true);
    try {
      const result = await apiClient.enrichWordMetadata(formData.word, formData.meaning);
      if (result.success && result.data) {
        const data = result.data;
        if (data.meaning && !formData.meaning) handleChange('meaning', data.meaning);
        if (data.example && !formData.example) handleChange('example', data.example);
        if (data.pos && !formData.pos) handleChange('pos', data.pos);
        if (data.synonyms && !formData.synonyms) handleChange('synonyms', data.synonyms);
        if (data.antonyms && !formData.antonyms) handleChange('antonyms', data.antonyms);
        if (data.pronunciation && !formData.pronunciation) handleChange('pronunciation', data.pronunciation);
        if (data.rootWords && !formData.rootWords) handleChange('rootWords', data.rootWords);
        if (data.mood && !formData.mood) handleChange('mood', data.mood);
        if (data.difficulty && !formData.difficulty) handleChange('difficulty', data.difficulty);
        if (data.connotation && !formData.connotation) handleChange('connotation', data.connotation);
      }
    } catch (err: any) {
      setEnrichError(err.message || 'Failed to auto-fill metadata');
    } finally {
      setIsEnriching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      word: formData.word,
      meaning: formData.meaning,
      example: formData.example,
      columnId: formData.columnId,
      status: 'TO_LEARN', // legacy
      pos: formData.pos || null,
      synonyms: formData.synonyms,
      antonyms: formData.antonyms,
      pronunciation: formData.pronunciation,
      rootWords: formData.rootWords,
      mood: formData.mood,
      difficulty: formData.difficulty || null,
      connotation: formData.connotation || null,
    } as Omit<VocabularyCard, 'id' | 'createdAt' | 'updatedAt'>);

    reset();
    // Do not call onClose() here, page.tsx will handle closing on success so that errors can be seen.
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scale-up">
        <div className="bg-primary-950 text-white p-4 flex justify-between items-center">
          <h3 className="font-extrabold text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Word */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex justify-between items-center">
                <span>Vocabulary Word *</span>
                <button 
                  type="button" 
                  onClick={handleEnrich} 
                  disabled={isEnriching || !formData.word}
                  className="flex items-center text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnriching ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                  Auto-Fill
                </button>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ephemeral"
                value={formData.word}
                onChange={(e) => {
                  handleChange('word', e.target.value);
                  setEnrichError('');
                }}
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium transition-all ${
                  errors.word ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
              {errors.word && <p className="text-xs text-rose-500 mt-1">{errors.word}</p>}
              {enrichError && <p className="text-xs text-rose-500 mt-1">{enrichError}</p>}
            </div>

            {/* Part of Speech */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Part of Speech
              </label>
              <select
                value={formData.pos || ''}
                onChange={(e) => handleChange('pos', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium transition-all"
              >
                <option value="">Select Part of Speech</option>
                <option value="Noun">Noun</option>
                <option value="Verb">Verb</option>
                <option value="Adjective">Adjective</option>
                <option value="Adverb">Adverb</option>
                <option value="Pronoun">Pronoun</option>
                <option value="Preposition">Preposition</option>
                <option value="Conjunction">Conjunction</option>
                <option value="Interjection">Interjection</option>
              </select>
            </div>

            {/* Meaning */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Meaning / Definition *
              </label>
              <textarea
                required
                placeholder="e.g. Lasting for a very short time"
                value={formData.meaning}
                onChange={(e) => handleChange('meaning', e.target.value)}
                rows={2}
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium transition-all ${
                  errors.meaning ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
              {errors.meaning && <p className="text-xs text-rose-500 mt-1">{errors.meaning}</p>}
            </div>

            {/* Example */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Example Phrase
              </label>
              <textarea
                placeholder="e.g. The beauty of a rainbow is ephemeral."
                value={formData.example}
                onChange={(e) => handleChange('example', e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium"
              />
            </div>

            {/* Pronunciation */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Pronunciation
              </label>
              <input
                type="text"
                placeholder="e.g. ih-FEM-er-uhl"
                value={formData.pronunciation}
                onChange={(e) => handleChange('pronunciation', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium"
              />
            </div>

            {/* Root Words */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Root Words
              </label>
              <input
                type="text"
                placeholder="e.g. ephemeros"
                value={formData.rootWords}
                onChange={(e) => handleChange('rootWords', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium"
              />
            </div>

            {/* Synonyms */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Synonyms
              </label>
              <input
                type="text"
                placeholder="e.g. Fleeting, Brief"
                value={formData.synonyms}
                onChange={(e) => handleChange('synonyms', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium"
              />
            </div>

            {/* Antonyms */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Antonyms
              </label>
              <input
                type="text"
                placeholder="e.g. Permanent, Endless"
                value={formData.antonyms}
                onChange={(e) => handleChange('antonyms', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium"
              />
            </div>

            {/* Mood */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Mood
              </label>
              <input
                type="text"
                placeholder="e.g. Melancholic"
                value={formData.mood}
                onChange={(e) => handleChange('mood', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty || ''}
                onChange={(e) => handleChange('difficulty', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium"
              >
                <option value="">Select Difficulty</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Master">Master</option>
              </select>
            </div>

            {/* Connotation */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Connotation
              </label>
              <select
                value={formData.connotation || ''}
                onChange={(e) => handleChange('connotation', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium"
              >
                <option value="">Select Connotation</option>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
                <option value="Neutral">Neutral</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Initial Column
              </label>
              <select
                value={formData.columnId}
                onChange={(e) => handleChange('columnId', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-semibold"
              >
                {boardColumns.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex space-x-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              {card ? 'Save Changes' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
