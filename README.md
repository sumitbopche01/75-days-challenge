# 75 Hard Challenge PWA

A comprehensive Progressive Web App (PWA) for tracking your 75 Hard Challenge
journey. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🏆 What is 75 Hard?

75 Hard is a mental toughness challenge created by Andy Frisella. For 75
consecutive days, you must complete all 5 daily tasks:

1. **Follow a diet** - Any diet of your choice, no cheat meals or alcohol
2. **Two 45-minute workouts** - One must be outdoors, regardless of weather
3. **Drink 1 gallon of water** daily
4. **Read 10 pages** of a non-fiction, self-development book
5. **Take a progress photo** every day

**⚠️ Important Rule:** If you miss ANY task on ANY day, you must restart from
Day 1.

## ✨ Features

### ✅ Core Functionality

- **Daily Task Tracking** - Interactive checkboxes for all 5 rules
- **Progress Overview** - Real-time progress tracking and completion status
- **Data Persistence** - All progress saved locally in your browser
- **Motivational Messages** - Dynamic encouragement based on your progress
- **Day Counter** - Track your current day (1-75) with percentage completion

### 📱 PWA Features

- **Installable** - Add to home screen on mobile/desktop
- **Offline Ready** - Works without internet connection
- **Native App Feel** - Full-screen, app-like experience
- **Responsive Design** - Optimized for all devices

### 🎯 Navigation Sections

- **Today's Tasks** - Complete daily requirements (functional)
- **Calendar** - View all 75 days (placeholder - coming soon)
- **Statistics** - Progress analytics (placeholder - coming soon)
- **Community** - Connect with others (placeholder - coming soon)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone & Install**
   ```bash
   cd 75DaysChallenge
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to `http://localhost:3000`
   - Follow the setup wizard to create your profile
   - Start your 75 Hard journey!

### Building for Production

```bash
npm run build
npm start
```

## 🎮 How to Use

### First Time Setup

1. Enter your name when prompted
2. Review the 5 rules of 75 Hard
3. Click "Start 75 Hard Challenge"

### Daily Usage

1. **View Today's Tasks** - See all 6 daily requirements
2. **Complete Tasks** - Click checkboxes or task rows to mark complete
3. **Track Progress** - Watch your completion status update in real-time
4. **Stay Motivated** - Get encouraging messages based on your progress

### Key Interactions

- ✅ **Click any task** to toggle completion
- 🎯 **Task rows turn green** when completed
- 📊 **Progress bar updates** automatically
- 🏆 **"Day Complete!"** appears when all tasks done

## 💾 Data Storage

All your progress is stored locally in your browser using localStorage:

- User profile and preferences
- Daily task completion status
- Challenge settings and current day
- Future: Water intake, workouts, reading, photos

## 🏗️ Technical Architecture

### Built With

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **PWA** - Service worker and web manifest
- **LocalStorage** - Client-side data persistence

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components  
├── lib/                 # Utilities and storage logic
├── types/               # TypeScript interfaces
└── hooks/               # Custom React hooks
```

### Key Files

- `src/app/page.tsx` - Main home page with task tracking
- `src/lib/storage.ts` - Data persistence layer
- `src/types/challenge.ts` - TypeScript interfaces
- `src/lib/utils.ts` - Utility functions
- `public/manifest.json` - PWA configuration

## 🎨 Design System

### Color Scheme

- **Primary Blue** (`blue-600`) - Main actions and progress
- **Success Green** (`green-600`) - Completed tasks
- **Warning Amber** (`amber-600`) - Important notices
- **Neutral Grays** - Text and backgrounds

### Components

- **Cards** - Container for content sections
- **Buttons** - Primary, secondary, outline, ghost variants
- **Task Items** - Interactive checkboxes with hover effects
- **Progress Bars** - Visual completion indicators

## 🔮 Roadmap

### Phase 1 - Core Features ✅

- [x] Basic task tracking
- [x] Daily progress overview
- [x] PWA functionality
- [x] User onboarding

### Phase 2 - Enhanced Tracking 🚧

- [ ] Detailed water intake tracker
- [ ] Workout logger (indoor/outdoor)
- [ ] Reading progress with books
- [ ] Progress photo uploads
- [ ] Calendar view with all 75 days

### Phase 3 - Analytics & Social 📋

- [ ] Statistics dashboard
- [ ] Streak tracking
- [ ] Data export/import
- [ ] Community features
- [ ] Achievement system

## 🐛 Known Issues

- Calendar, Statistics, and Community sections show placeholder content
- No data synchronization across devices
- Limited offline functionality (basic caching only)

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT License - Feel free to use this code for your own 75 Hard journey!

## 💪 Stay Strong!

Remember: **75 Hard is about building mental toughness, not physical
transformation.**

_"The only person you need to be better than is the person you were yesterday."_

---

**Good luck on your 75 Hard journey! 🔥**
