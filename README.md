# Personal AI Weekly Planner

A polished, minimalist personal productivity application for managing your weekly schedule, tasks, and routines.

## Current Status: Stage 1 - Frontend Foundation ✓

The foundational user interface has been implemented with:

- ✅ React + TypeScript + Vite setup
- ✅ Tailwind CSS v4 with custom design tokens
- ✅ Motion for React and Lucide icons
- ✅ Responsive weekly and daily planner views
- ✅ Light/dark theme switching
- ✅ Mock data for demonstration
- ✅ Apple-inspired minimalist design
- ✅ GitHub Pages base path configuration

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animation**: Motion for React
- **Validation**: Zod (ready for future stages)
- **Local Storage**: Dexie.js (ready for future stages)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Run TypeScript type checks
npm run type-check
```

The application will be available at `http://localhost:5173`

## Features (Stage 1)

### Weekly View
- Seven-day weekly overview
- Color-coded event cards by status
- Task completion statistics
- Priority indicators
- Clickable days to view details

### Daily View
- Detailed timeline of scheduled events
- Separate section for flexible tasks
- Status indicators (pending, in progress, completed, cancelled)
- Priority and category labels
- Back navigation to weekly view

### Theme Support
- Light and dark themes
- Respects system preferences
- Persistent theme selection
- Smooth transitions

## Project Structure

```
weekly-planner/
├── src/
│   ├── components/       # React components
│   │   ├── Header.tsx
│   │   ├── WeeklyView.tsx
│   │   └── DailyView.tsx
│   ├── contexts/         # React contexts
│   │   └── ThemeContext.tsx
│   ├── data/            # Mock data
│   │   └── mockData.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Next Stages (Not Yet Implemented)

- **Stage 2**: Task CRUD operations, categories, priorities, recurring activities
- **Stage 3**: Local persistence with IndexedDB, history, archive, import/export
- **Stage 4**: Cloudflare Worker API and D1 database
- **Stage 5**: Cloud synchronization and multi-device access
- **Stage 6**: AI assistant integration
- **Stage 7**: GitHub Pages deployment and PWA features
- **Stage 8**: Final verification and testing

## Development Notes

- All data is currently mocked for demonstration purposes
- No backend or database integration in Stage 1
- Authentication and cloud sync will be added in later stages
- AI features require explicit approval before implementation

## License

ISC
