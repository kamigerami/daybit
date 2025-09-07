# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DayBit is a minimal web application for logging one word per day, visualized in a GitHub-style heatmap. The application is fully implemented and working.

**Core Features**:
- Single word entry per day with validation (max 20 chars, no spaces)
- GitHub-style heatmap showing logged days using cal-heatmap
- Recent words list (last 7 entries)
- LocalStorage persistence
- Toast notifications for user feedback
- Fully responsive design
- TypeScript implementation

## Tech Stack (Implemented)

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Heatmap**: cal-heatmap library
- **Storage**: localStorage for local persistence
- **UI Feedback**: react-hot-toast for notifications
- **Testing**: Playwright for end-to-end testing

## Development Commands

```bash
# Development server (runs on localhost:3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npx playwright test

# Run tests with UI
npx playwright test --ui

# Take screenshots for testing
npx playwright test tests/screenshot.spec.ts

# Lint code
npm run lint
```

## Project Structure

```
src/
├── app/
│   └── page.tsx              # Main application page
├── components/
│   ├── Header.tsx            # App title and tagline
│   ├── InputForm.tsx         # Word entry form with validation
│   ├── Heatmap.tsx           # GitHub-style heatmap visualization
│   └── RecentWords.tsx       # Display last 7 entries
├── lib/
│   └── storage.ts            # LocalStorage utilities and types
└── types/
    └── cal-heatmap.d.ts      # Type definitions for cal-heatmap

tests/
├── daybit.spec.ts            # Comprehensive test suite
├── screenshot.spec.ts        # Screenshot generation tests
└── screenshots/              # Generated test screenshots
```

## Key Components

### InputForm
- Validates single words (no spaces, max 20 characters)
- Updates existing entry for the same day
- Shows character count and validation feedback
- Displays current day's word in placeholder when exists

### Heatmap
- Uses cal-heatmap for GitHub-style visualization
- Shows full year view with hover tooltips
- Green color scale indicating activity
- Responsive design for mobile and desktop

### RecentWords
- Shows last 7 logged entries
- Highlights today's entry
- Empty state with helpful message

### Storage
- Uses localStorage with key `daybit_entries`
- Stores entries as `{ date: 'YYYY-MM-DD', word: 'string' }`
- Provides utilities for saving, retrieving, and managing entries

## Validation Rules

- **Word Entry**: Single non-space string using regex `^[^\s]+$`
- **Character Limit**: Maximum 20 characters
- **Daily Limit**: One entry per day (overwrites if exists)
- **UI Feedback**: Toast notifications instead of alerts

## Testing

The application includes comprehensive Playwright tests covering:
- Component visibility and functionality
- Input validation
- Word entry and persistence
- Responsive design
- Screenshot generation
- Keyboard navigation
- Data persistence across reloads

## Multi-User Support & Deployment

### Current Architecture
- **User Sessions**: Each user gets a unique anonymous ID stored in localStorage
- **Data Isolation**: User entries stored with user-specific keys (`daybit_entries_user_xyz`)
- **Privacy First**: No server-side user data, browser-based storage

### Deployment Options

#### 1. Static Deployment (Current - Recommended for MVP)
```bash
npm run build
# Deploy to Vercel, Netlify, or any static host
```
- ✅ Each browser creates anonymous user session
- ✅ No backend required
- ✅ Privacy-focused, works offline
- ❌ No cross-device sync

#### 2. Future: Add Authentication + Database
For multi-device support, would need:
- Database (PostgreSQL/Supabase)
- Authentication (NextAuth.js/Supabase Auth)
- API routes for user data
- Migration from localStorage to cloud

### User Experience
- **First Visit**: Auto-generates anonymous user ID
- **Multiple Users**: Each browser/device is independent
- **Data Privacy**: All data stays in user's browser
- **No Registration**: Immediate use, no friction

## Production Ready

The application is fully functional and production-ready with:
- ✅ TypeScript compilation without errors
- ✅ ESLint compliance (minimal warnings)
- ✅ Successful production build
- ✅ Multi-user session support
- ✅ Hydration error fixes
- ✅ Comprehensive test coverage
- ✅ Responsive design tested
- ✅ Proper error handling
- ✅ Accessibility considerations