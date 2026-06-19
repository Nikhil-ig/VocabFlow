/**
 * Main Application Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import {
    Header,
    ProgressBar,
    Notification,
    CardFormModal,
    FlashcardModal,
    SearchToolbar,
    DroppableColumn,
    MobileTabView,
    ConfirmModal,
    BottomNav,
    ProfileModal,
    WordOfTheDayScratchCard,
} from '@/components';
import { useVocabStore } from '@/lib/store';
import {
    useFlashcardQuiz,
    useResponsive,
    useCardColumns,
} from '@/hooks';
import { VocabularyCard, LearningStatus, HistoryAction } from '@/types';
import { apiClient } from '@/services/api';

export default function Home() {
    const isMobile = useResponsive();
    const {
        currentCard: flashcardCard,
        isRevealed: flashcardRevealed,
        isOpen: flashcardOpen,
        isLoading: flashcardLoading,
        setIsRevealed: setFlashcardRevealed,
        startQuiz,
        nextCard,
        closeQuiz,
    } = useFlashcardQuiz();
    const { columns, boardColumns, stats } = useCardColumns();

    const cards = useVocabStore((state) => state.cards);
    const setCards = useVocabStore((state) => state.setCards);
    const updateCardLocal = useVocabStore((state) => state.updateCardLocal);
    const removeCard = useVocabStore((state) => state.removeCard);
    const setNotification = useVocabStore((state) => state.setNotification);
    const filters = useVocabStore((state) => state.filters);
    const setStatistics = useVocabStore((state) => state.setStatistics);

    // Modal states
    const [editingCard, setEditingCard] = useState<VocabularyCard | null>(null);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<VocabularyCard | null>(null);
    const [activeTab, setActiveTab] = useState<string>('');
    const [columnPagination, setColumnPagination] = useState<Record<string, { page: number, hasMore: boolean, isLoading: boolean, total: number }>>({});

    const addCard = useVocabStore((state) => state.addCard);

    // Auth Session
    const { user, status } = useAuth();
  const session = user ? { user } : null;
    const isGuest = status === 'unauthenticated';

    useEffect(() => {
        if (boardColumns.length > 0 && !activeTab) {
            setActiveTab(boardColumns[0].id);
        }
    }, [boardColumns, activeTab]);

    // Fetch data when filters change
    useEffect(() => {
        if (status === 'loading') return;

        const loadData = async () => {

            try {
                const columnsResponse = await apiClient.getColumns().catch(e => ({ success: false, data: [] }));
                const statsResponse = !isGuest ? await apiClient.getUserStatistics().catch(e => ({ success: false, data: null })) : { success: false, data: null };

                let cols: any[] = [];
                if (columnsResponse.success && columnsResponse.data) {
                    cols = columnsResponse.data;
                    useVocabStore.getState().setBoardColumns(cols);
                }

                if (statsResponse.success && statsResponse.data) {
                    setStatistics(statsResponse.data);
                }

                // Fetch cards per column
                if (cols.length > 0) {
                    const initialPaging: Record<string, { page: number, hasMore: boolean, isLoading: boolean, total: number }> = {};
                    const cardPromises = cols.map(col =>
                        apiClient.getCards(
                            {
                                searchQuery: filters.searchQuery || undefined,
                                sortBy: filters.sortBy !== 'default' ? filters.sortBy : undefined,
                                status: filters.status || undefined,
                                columnId: col.id,
                                pos: filters.pos || undefined,
                                mood: filters.mood || undefined,
                                connotation: filters.connotation || undefined,
                                difficulty: filters.difficulty || undefined,
                            },
                            1,
                            10
                        )
                    );

                    const cardResponses = await Promise.all(cardPromises);
                    let allCards: VocabularyCard[] = [];

                    cardResponses.forEach((res, index) => {
                        if (res.success && res.data) {
                            // Filter out duplicates (just in case)
                            const newCards = res.data.filter(newCard => !allCards.some(existingCard => existingCard.id === newCard.id));
                            allCards = [...allCards, ...newCards];

                            const colId = cols[index].id;
                            initialPaging[colId] = {
                                page: 1,
                                hasMore: res.pagination ? res.pagination.page < res.pagination.pages : false,
                                isLoading: false,
                                total: res.pagination?.total || newCards.length,
                            };
                        }
                    });

                    setCards(allCards);
                    setColumnPagination(initialPaging);

                    if (isGuest) {
                        const guestStats = {
                            totalCards: 0,
                            toLearnCards: 0,
                            learningCards: 0,
                            masteredCards: 0,
                            masteryPercentage: 0
                        };
                        
                        cols.forEach((col, index) => {
                            const count = initialPaging[col.id]?.total || 0;
                            guestStats.totalCards += count;
                            if (index === 0) guestStats.toLearnCards += count;
                            else if (index === cols.length - 1) guestStats.masteredCards += count;
                            else guestStats.learningCards += count;
                        });
                        
                        if (guestStats.totalCards > 0) {
                            guestStats.masteryPercentage = Math.round((guestStats.masteredCards / guestStats.totalCards) * 100);
                        }
                        
                        setStatistics(guestStats as any);
                    }
                }
            } catch (error) {
                console.error('Failed to load data:', error);
                setNotification({
                    message: 'Failed to load vocabulary data',
                    type: 'error',
                });
            }
        };

        loadData();
    }, [
        filters.searchQuery,
        filters.sortBy,
        filters.status,
        filters.pos,
        filters.mood,
        filters.connotation,
        filters.difficulty,
        setCards,
        setNotification,
        status,
        isGuest
    ]);

    const loadMoreForColumn = async (columnId: string) => {
        const paging = columnPagination[columnId];
        if (!paging || paging.isLoading || !paging.hasMore) return;

        setColumnPagination(prev => ({
            ...prev,
            [columnId]: { ...prev[columnId], isLoading: true }
        }));

        try {
            const nextPage = paging.page + 1;
            const response = await apiClient.getCards(
                {
                    searchQuery: filters.searchQuery || undefined,
                    sortBy: filters.sortBy !== 'default' ? filters.sortBy : undefined,
                    status: filters.status || undefined,
                    columnId: columnId,
                    pos: filters.pos || undefined,
                    mood: filters.mood || undefined,
                    connotation: filters.connotation || undefined,
                    difficulty: filters.difficulty || undefined,
                },
                nextPage,
                10
            );

            if (response.success && response.data) {
                // Filter duplicates and append
                const newCards = response.data.filter(
                    newCard => !useVocabStore.getState().cards.some(existingCard => existingCard.id === newCard.id)
                );
                setCards([...useVocabStore.getState().cards, ...newCards]);

                setColumnPagination(prev => ({
                    ...prev,
                    [columnId]: {
                        page: nextPage,
                        hasMore: response.pagination ? response.pagination.page < response.pagination.pages : false,
                        isLoading: false,
                        total: response.pagination?.total || prev[columnId].total,
                    }
                }));
            } else {
                setColumnPagination(prev => ({
                    ...prev,
                    [columnId]: { ...prev[columnId], isLoading: false }
                }));
            }
        } catch (error) {
            console.error(`Failed to load more for column ${columnId}:`, error);
            setColumnPagination(prev => ({
                ...prev,
                [columnId]: { ...prev[columnId], isLoading: false }
            }));
            setNotification({ message: 'Failed to load more cards', type: 'error' });
        }
    };

    // Handle drag and drop
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const cardId = active.id as string;
        const newStatus = over.id as string; // columnId
        const card = cards.find((c) => c.id === cardId);

        if (card && card.columnId !== newStatus) {
            const oldStatus = card.columnId || boardColumns[0].id;
            try {
                // Optimistic update
                if (!isGuest) {
                    if (session?.user?.role === 'ADMIN') {
                        // Admins update the global card position
                        updateCardLocal(cardId, { columnId: newStatus });
                        await apiClient.updateCard(cardId, { columnId: newStatus });
                    } else {
                        // Regular users just record history to track their personal progress
                        updateCardLocal(cardId, { columnId: newStatus });
                        await apiClient.recordHistory(cardId, {
                            action: HistoryAction.STATUS_CHANGED,
                            newStatus,
                        });
                    }
                }
                setColumnPagination(prev => {
                    const next = { ...prev };
                    if (next[oldStatus]) next[oldStatus] = { ...next[oldStatus], total: Math.max(0, next[oldStatus].total - 1) };
                    if (next[newStatus]) next[newStatus] = { ...next[newStatus], total: next[newStatus].total + 1 };
                    return next;
                });
                
                // Update global statistics
                const currentStats = useVocabStore.getState().statistics;
                if (currentStats && boardColumns.length >= 3) {
                    const firstColId = boardColumns[0].id;
                    const lastColId = boardColumns[boardColumns.length - 1].id;
                    let { toLearnCards, learningCards, masteredCards, totalCards } = currentStats;
                    
                    if (oldStatus === firstColId) toLearnCards = Math.max(0, toLearnCards - 1);
                    else if (oldStatus === lastColId) masteredCards = Math.max(0, masteredCards - 1);
                    else learningCards = Math.max(0, learningCards - 1);
                    
                    if (newStatus === firstColId) toLearnCards++;
                    else if (newStatus === lastColId) masteredCards++;
                    else learningCards++;
                    
                    useVocabStore.getState().updateStatistics({
                        toLearnCards,
                        learningCards,
                        masteredCards,
                        masteryPercentage: totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0
                    });
                }
                
                setNotification({
                    message: `Card moved!`,
                    type: 'success',
                });
            } catch (error) {
                console.error('Failed to update card:', error);
                setNotification({
                    message: 'Failed to update card status',
                    type: 'error',
                });
                // Revert optimistic update
                updateCardLocal(cardId, { columnId: oldStatus });
            }
        }
    };

    // Handle status change from UI
    const handleStatusChange = async (cardId: string, newStatus: string) => {
        const card = cards.find((c) => c.id === cardId);
        if (!card) return;

        const oldStatus = card.columnId || boardColumns[0].id;
        try {
            if (!isGuest) {
                if (session?.user?.role === 'ADMIN') {
                    // Admins update the global card position
                    updateCardLocal(cardId, { columnId: newStatus });
                    await apiClient.updateCard(cardId, { columnId: newStatus });
                } else {
                    // Regular users just record history to track their personal progress
                    updateCardLocal(cardId, { columnId: newStatus });
                    await apiClient.recordHistory(cardId, {
                        action: HistoryAction.STATUS_CHANGED,
                        newStatus,
                    });

                }
            }

            setColumnPagination(prev => {
                const next = { ...prev };
                if (next[oldStatus]) next[oldStatus] = { ...next[oldStatus], total: Math.max(0, next[oldStatus].total - 1) };
                if (next[newStatus]) next[newStatus] = { ...next[newStatus], total: next[newStatus].total + 1 };
                return next;
            });

            // Update global statistics
            const currentStats = useVocabStore.getState().statistics;
            if (currentStats && boardColumns.length >= 3) {
                const firstColId = boardColumns[0].id;
                const lastColId = boardColumns[boardColumns.length - 1].id;
                let { toLearnCards, learningCards, masteredCards, totalCards } = currentStats;
                
                if (oldStatus === firstColId) toLearnCards = Math.max(0, toLearnCards - 1);
                else if (oldStatus === lastColId) masteredCards = Math.max(0, masteredCards - 1);
                else learningCards = Math.max(0, learningCards - 1);
                
                if (newStatus === firstColId) toLearnCards++;
                else if (newStatus === lastColId) masteredCards++;
                else learningCards++;
                
                useVocabStore.getState().updateStatistics({
                    toLearnCards,
                    learningCards,
                    masteredCards,
                    masteryPercentage: totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0
                });
            }

            setNotification({
                message: `Card updated!`,
                type: 'success',
            });
        } catch (error) {
            console.error('Failed to update status:', error);
            setNotification({
                message: 'Failed to update card',
                type: 'error',
            });
            updateCardLocal(cardId, { columnId: oldStatus });
        }
    };

    // Handle card creation
    const handleCreateCard = async (data: Omit<VocabularyCard, 'id' | 'createdAt' | 'updatedAt'>) => {

        try {
            const response = await apiClient.createCard(data);
            if (response.success && response.data) {
                const colId = response.data.columnId || boardColumns[0].id;
                setCards([...cards, response.data]);
                setColumnPagination(prev => {
                    const next = { ...prev };
                    if (next[colId]) next[colId] = { ...next[colId], total: next[colId].total + 1 };
                    return next;
                });
                
                // Optimistically update global statistics
                const currentStats = useVocabStore.getState().statistics;
                if (currentStats && boardColumns.length >= 3) {
                    const firstColId = boardColumns[0].id;
                    const lastColId = boardColumns[boardColumns.length - 1].id;
                    let { toLearnCards, learningCards, masteredCards, totalCards } = currentStats;
                    
                    totalCards++;
                    if (colId === firstColId) toLearnCards++;
                    else if (colId === lastColId) masteredCards++;
                    else learningCards++;
                    
                    useVocabStore.getState().updateStatistics({
                        totalCards,
                        toLearnCards,
                        learningCards,
                        masteredCards,
                        masteryPercentage: totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0
                    });
                }
                
                setIsAddingCard(false);
                setNotification({
                    message: `Added "${data.word}" to ${data.status}`,
                    type: 'success',
                });
            }
        } catch (error: any) {
            console.error('Failed to create card:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to add card';
            setNotification({
                message: typeof errorMessage === 'string' ? errorMessage : 'Failed to add card',
                type: 'error',
            });
        }
    };

    // Handle card update
    const handleUpdateCard = async (data: Omit<VocabularyCard, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!editingCard) return;

        try {
            const response = await apiClient.updateCard(editingCard.id, data);
            if (response.success && response.data) {
                updateCardLocal(editingCard.id, data);
                setEditingCard(null);
                setNotification({
                    message: `Updated "${data.word}"`,
                    type: 'success',
                });
            }
        } catch (error: any) {
            console.error('Failed to update card:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update card';
            setNotification({
                message: typeof errorMessage === 'string' ? errorMessage : 'Failed to update card',
                type: 'error',
            });
        }
    };

    // Handle card deletion trigger
    const handleDeleteCard = (cardId: string) => {
        const card = cards.find((c) => c.id === cardId);
        if (card) {
            setCardToDelete(card);
        }
    };

    // Actual deletion logic
    const confirmDelete = async () => {
        if (!cardToDelete) return;

        try {
            await apiClient.deleteCard(cardToDelete.id);
            const colId = cardToDelete.columnId || boardColumns[0].id;
            removeCard(cardToDelete.id);
            setColumnPagination(prev => {
                const next = { ...prev };
                if (next[colId]) next[colId] = { ...next[colId], total: Math.max(0, next[colId].total - 1) };
                return next;
            });
            
            // Optimistically update global statistics
            const currentStats = useVocabStore.getState().statistics;
            if (currentStats && boardColumns.length >= 3) {
                const firstColId = boardColumns[0].id;
                const lastColId = boardColumns[boardColumns.length - 1].id;
                let { toLearnCards, learningCards, masteredCards, totalCards } = currentStats;
                
                totalCards = Math.max(0, totalCards - 1);
                if (colId === firstColId) toLearnCards = Math.max(0, toLearnCards - 1);
                else if (colId === lastColId) masteredCards = Math.max(0, masteredCards - 1);
                else learningCards = Math.max(0, learningCards - 1);
                
                useVocabStore.getState().updateStatistics({
                    totalCards,
                    toLearnCards,
                    learningCards,
                    masteredCards,
                    masteryPercentage: totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0
                });
            }
            setNotification({
                message: `Deleted "${cardToDelete.word}"`,
                type: 'success',
            });
            setCardToDelete(null);
        } catch (error) {
            console.error('Failed to delete card:', error);
            setNotification({
                message: 'Failed to delete card',
                type: 'error',
            });
        }
    };

    // Handle flashcard status update
    const handleFlashcardStatusChange = async (newStatus: string) => {
        if (!flashcardCard) return;

        await handleStatusChange(flashcardCard.id, newStatus);
        nextCard();
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24 md:pb-12">
            <Notification />
            <Header onProfileClick={() => setIsProfileOpen(true)} />

            <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
                {/* Word of the Day Scratch Card */}
                <WordOfTheDayScratchCard />

                {/* Progress Bar */}
                <ProgressBar />

                {/* Search Toolbar */}
                <SearchToolbar
                    onAddClick={() => setIsAddingCard(true)}
                    onFlashcardClick={startQuiz}
                />

                {/* Board View */}
                {isMobile ? (
                    <MobileTabView
                        boardColumns={boardColumns}
                        columns={columns}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onEdit={setEditingCard}
                        onDelete={handleDeleteCard}
                        onMove={handleStatusChange}
                        onLoadMore={loadMoreForColumn}
                        pagination={columnPagination}
                    />
                ) : (
                    <DndContext onDragEnd={handleDragEnd}>
                        <div
                            className="grid gap-6 items-start"
                            style={{ gridTemplateColumns: `repeat(${boardColumns.length || 3}, minmax(0, 1fr))` }}
                        >
                            {boardColumns.map((col) => (
                                <DroppableColumn
                                    key={col.id}
                                    column={col}
                                    cards={columns[col.id] || []}
                                    onEdit={setEditingCard}
                                    onDelete={handleDeleteCard}
                                    onMove={handleStatusChange}
                                    onLoadMore={() => loadMoreForColumn(col.id)}
                                    hasMore={columnPagination[col.id]?.hasMore || false}
                                    isLoading={columnPagination[col.id]?.isLoading || false}
                                    totalCount={columnPagination[col.id]?.total ?? columns[col.id]?.length ?? 0}
                                />
                            ))}
                        </div>
                    </DndContext>
                )}
            </main>

            {/* Modals */}
            <CardFormModal
                isOpen={isAddingCard}
                title="Add New Word"
                onSubmit={handleCreateCard}
                onClose={() => setIsAddingCard(false)}
            />

            <CardFormModal
                card={editingCard || undefined}
                isOpen={!!editingCard}
                title="Edit Word"
                onSubmit={handleUpdateCard}
                onClose={() => setEditingCard(null)}
            />

            <FlashcardModal
                isOpen={flashcardOpen}
                isLoading={flashcardLoading}
                isGuest={isGuest}
                card={flashcardCard}
                isRevealed={flashcardRevealed}
                onClose={closeQuiz}
                onReveal={() => setFlashcardRevealed(true)}
                onStatusChange={handleFlashcardStatusChange}
                onNext={nextCard}
            />

            <ConfirmModal
                isOpen={!!cardToDelete}
                title="Delete Vocabulary Word"
                message={`Are you sure you want to permanently delete "${cardToDelete?.word}"? This action cannot be undone and will erase all learning progress.`}
                confirmText="Delete Permanently"
                onConfirm={confirmDelete}
                onCancel={() => setCardToDelete(null)}
            />

            <BottomNav
                onAddClick={() => setIsAddingCard(true)}
                onFlashcardClick={startQuiz}
                onProfileClick={() => setIsProfileOpen(true)}
            />

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
}
