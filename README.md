# VocabFlow Frontend - AI-Powered Vocabulary Learning Platform

A modern, scalable, and AI-ready Next.js + TypeScript application for dynamic vocabulary learning with Kanban board interface, flashcard quizzes, and advanced progress tracking.

## 🚀 Project Architecture

### Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.3
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Directory Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes (backend-like routes)
│   │   │   ├── cards/         # Card CRUD endpoints
│   │   │   ├── history/       # User interaction history
│   │   │   └── statistics/    # Learning statistics
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main application page
│   │
│   ├── components/            # React components
│   │   ├── Card.tsx           # Vocabulary card component
│   │   ├── Column.tsx         # Droppable column (desktop)
│   │   ├── CardFormModal.tsx  # Add/Edit form modal
│   │   ├── FlashcardModal.tsx # Flashcard quiz modal
│   │   ├── Header.tsx         # Header with stats
│   │   ├── MobileTabView.tsx  # Mobile tab interface
│   │   ├── Notification.tsx   # Toast notification
│   │   ├── SearchToolbar.tsx  # Search & sort toolbar
│   │   └── index.ts           # Barrel exports
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── index.ts           # useTextToSpeech, useFlashcardQuiz,
│   │                          # useResponsive, useCardColumns, etc.
│   │
│   ├── lib/                   # Utility functions & stores
│   │   └── store.ts          # Zustand global state
│   │
│   ├── services/              # API client & business logic
│   │   └── api.ts            # VocabFlowAPIClient singleton
│   │
│   └── types/                 # TypeScript type definitions
│       └── index.ts           # All interface & type exports
│
├── .env.local                 # Environment variables
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 📋 Core Features

### 1. **Kanban Board Interface**
- Three-column board: "To Learn", "Learning", "Mastered"
- Drag & drop cards between columns
- Real-time status synchronization
- Desktop and mobile responsive layouts

### 2. **Vocabulary Management**
- Create, read, update, delete vocabulary cards
- Each card contains: word, meaning, example
- Automatic status management
- Search across all card fields

### 3. **Flashcard Quiz Mode**
- Random card selection from non-mastered words
- Click to reveal answer
- Quick status marking (Needs Review / Mastered)
- Continue to next card or exit

### 4. **Advanced Filtering & Sorting**
- Real-time search
- Sort by: Spreadsheet order, Alphabetical, Definition length, Recently added
- Filter by learning status
- Debounced search for performance

### 5. **Progress Tracking**
- Mastery percentage display
- Per-status card counts
- Multi-segment progress bar
- User history tracking

### 6. **Text-to-Speech**
- Pronounce words using browser's speech synthesis
- Visual feedback for speaking state
- Error handling for unsupported browsers

### 7. **Mobile Responsive**
- Auto-detect device type (< 768px = mobile)
- Mobile-optimized tab navigation
- Touch-friendly interfaces
- Optimized card layouts for small screens

## 🏗️ Data Models

### VocabularyCard
```typescript
interface VocabularyCard {
  id: string;
  word: string;
  meaning: string;
  example: string;
  status: 'To Learn' | 'Learning' | 'Mastered';
  createdAt: Date;
  updatedAt: Date;
}
```

### WordHistory
```typescript
interface WordHistory {
  id: string;
  cardId: string;
  action: HistoryAction;
  previousStatus?: LearningStatus;
  newStatus?: LearningStatus;
  timestamp: Date;
}
```

### UserStatistics
```typescript
interface UserStatistics {
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  toLearnCards: number;
  masteryPercentage: number;
}
```

## 🔧 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env.local (already included with defaults)
# Update API_URL if needed:
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Development

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm build

# Start production server
npm start
```

The app will be available at `http://localhost:3000`

## 🧠 State Management (Zustand Store)

### Store Methods

```typescript
// Card Operations
setCards(cards)                          // Set all cards
addCard(card)                           // Add single card
updateCardLocal(id, updates)            // Optimistic update
removeCard(id)                          // Remove card

// Filtering & Sorting
setFilters(filters)                     // Update filter options
getFilteredCards()                      // Get filtered cards
getSortedCards(cards)                   // Get sorted cards

// Statistics
setStatistics(stats)                    // Update statistics
getMasteryRate()                        // Calculate mastery %

// UI State
setNotification(notification)           // Show toast
setIsMobile(isMobile)                   // Set mobile flag
setIsLoading(loading)                   // Loading state
```

## 🎣 Custom Hooks

### useTextToSpeech()
```typescript
const { speak, speakingWord } = useTextToSpeech();
speak('word');  // Pronounce word
```

### useFlashcardQuiz()
```typescript
const {
  currentCard,
  isRevealed,
  startQuiz,
  nextCard,
  closeQuiz
} = useFlashcardQuiz();
```

### useCardColumns()
```typescript
const { columns, stats } = useCardColumns();
// columns: { 'To Learn': [...], 'Learning': [...], 'Mastered': [...] }
// stats: { total, mastered, learning, toLearn, masteryRate }
```

## 📡 API Integration

### VocabFlowAPIClient

All API calls go through the singleton `apiClient`:

```typescript
import { apiClient } from '@/services/api';

// Fetch cards
const response = await apiClient.getCards(filters, page, limit);

// Create card
await apiClient.createCard(cardData);

// Update card
await apiClient.updateCard(id, updates);

// Delete card
await apiClient.deleteCard(id);

// Record history
await apiClient.recordHistory(cardId, historyData);

// Get statistics
await apiClient.getUserStatistics();
```

### API Endpoints

```
GET    /api/cards                 # List cards (with filtering)
POST   /api/cards                 # Create card
GET    /api/cards/:id             # Get card by ID
PUT    /api/cards/:id             # Update card
DELETE /api/cards/:id             # Delete card
POST   /api/cards/bulk            # Bulk create cards

POST   /api/history               # Record history
GET    /api/history/card/:id      # Get card history

GET    /api/statistics            # Get user statistics
GET    /api/analytics/insights    # Get learning insights

GET    /api/ai/recommendations    # AI recommendations (future)
```

## 🎨 Styling

### Tailwind Configuration
- Custom color palette (slate, indigo, amber, emerald)
- Custom animations (fade-in, scale-up)
- Responsive breakpoints (md: 768px)
- Scrollbar styling

### CSS Classes
- `text-gradient`: Gradient text effect
- `card-shadow`: Card hover shadow
- `scrollbar-thin`: Thin scrollbar style
- `animate-fade-in`: Fade in animation
- `animate-scale-up`: Scale up animation

## 🚀 AI Integration Ready

### Planned AI Features

1. **Learning Pattern Analysis**
   - Identify quick learners vs. slow learners
   - Personalized learning pace recommendations

2. **Intelligent Flashcard Sequencing**
   - Prioritize cards based on forgetting curve
   - Adaptive difficulty adjustment

3. **Pronunciation Feedback**
   - Voice-based learning validation
   - Accent analysis (future)

4. **Context-Aware Definitions**
   - AI-generated alternative meanings
   - Contextual example suggestions

5. **Learning Recommendations**
   - Suggest words based on learning history
   - Topic clustering

### AI Preparation Layer
The codebase is structured to support AI services:
- `AIEvaluationResult` type for evaluation outcomes
- `apiClient.getRecommendations()` endpoint
- `apiClient.getLearningInsights()` endpoint
- History tracking for AI model training

## 📱 Mobile Responsiveness

### Breakpoints
- **Mobile**: < 768px (md breakpoint)
  - Single column layout
  - Tab-based navigation
  - Optimized touch targets
  
- **Desktop**: ≥ 768px
  - Three-column Kanban board
  - Drag & drop enabled
  - Full toolbar display

## 🔐 Environment Variables

```
NEXT_PUBLIC_API_URL     # API endpoint (publicly accessible)
```

**Note**: Frontend environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

## 📦 Dependencies Overview

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^15.0.0 | React framework with SSR |
| react | ^19.0.0 | UI library |
| zustand | ^4.4.1 | Lightweight state management |
| @dnd-kit/core | ^8.1.1 | Drag and drop |
| axios | ^1.6.2 | HTTP client |
| lucide-react | ^0.344.0 | Icon library |
| tailwindcss | ^3.3.6 | Utility-first CSS |

## 🚦 Performance Optimizations

1. **Code Splitting**: Next.js automatic route-based splitting
2. **Image Optimization**: Next.js Image component (when used)
3. **Debounced Search**: 300ms debounce to reduce API calls
4. **Optimistic UI Updates**: Immediate feedback, rollback on error
5. **Memoization**: React.memo for card components
6. **Lazy Loading**: Modal components only render when open
7. **Type Safety**: Full TypeScript for compile-time checking

## 🧪 Testing Preparation

The architecture supports:
- Unit tests for hooks and utilities
- Component tests with React Testing Library
- E2E tests with Playwright
- API mocking for tests

## 📚 Database Integration

### Current State
- Mock in-memory storage for development

### For Production

Connect to your preferred database:

**Option 1: PostgreSQL + Prisma**
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

**Option 2: MongoDB**
```typescript
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.DATABASE_URL);
```

**Option 3: SQLite (Simple)**
```typescript
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database(':memory:');
```

Database stubs are marked with `TODO:` comments in API routes.

## 🔄 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Variables (Production)
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NODE_ENV=production
```

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [DND Kit Documentation](https://docs.dndkit.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🤝 Contributing

This is a template project. Feel free to:
1. Add database integration
2. Implement authentication
3. Add real API connections
4. Build the AI recommendation system
5. Create mobile apps (React Native)

## 📝 License

MIT License

---

**Built with ❤️ for vocabulary learners and AI enthusiasts**
