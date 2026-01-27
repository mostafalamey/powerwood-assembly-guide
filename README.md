# 🪛 PWAssemblyGuide - Interactive 3D Cabinet Assembly Guide

> Mobile-first, multilingual 3D web application for kitchen cabinet assembly instructions

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Phase](https://img.shields.io/badge/phase-8%20of%2010-blue)
![Progress](https://img.shields.io/badge/progress-75%25-green)

---

## 📖 Overview

PWAssemblyGuide is a revolutionary web-based 3D assembly guide that helps customers assemble kitchen cabinets with interactive 3D animations, multi-language support, and voice narration. Accessible via QR codes on product packaging, it provides a superior alternative to traditional paper manuals.

### ✨ Key Features (MVP)

- 🎯 **QR Code Access** - Scan to instantly load your cabinet's guide ✅
- 🎨 **Interactive 3D** - Rotate, zoom, and explore assembly steps ✅
- 🌍 **Multilingual** - English and Arabic with RTL support ✅
- 📱 **Mobile-First** - Optimized for smartphones and tablets ✅
- 🎬 **Step Animations** - Watch parts come together in 3D ✅
- 🔊 **Audio Narration** - Listen while you work ✅
- 🛠️ **Admin Panel** - Content management system ✅
- 📋 **QR Generation** - Print-ready codes for packaging ✅
- 🎬 **Animation Authoring** - Visual keyframe editor for step animations ✅
- ⚡ **Fast & Offline** - Static hosting, PWA support (V2)

---

## 🚀 Current Status

### Phase Completion

- ✅ **Phase 1: Foundation** (100%) - Setup, routing, i18n
- ✅ **Phase 2: 3D Viewer** (100%) - Enhanced rendering, controls
- ✅ **Phase 3: Step System** (100%) - GSAP animations, completion tracking
- ✅ **Phase 5: Audio** (100%) - Multilingual narration
- ✅ **Phase 5.5: UI/UX** (100%) - Bug fixes, layout improvements
- ✅ **Phase 6: Admin Panel** (100%) - Auth, CRUD, step management, QR codes, authoring, reuse
- ✅ **Phase 8: Polish** (100%) - Toast notifications, sidebar collapse, authoring UX, icons
- ⏳ **Phase 9-10** - Upcoming

### Latest Updates

- **Jan 27, 2026:** Phase 8 completed - Toast notifications, collapsible sidebar, 3-column authoring layout, Material Symbols icons, performance optimizations
- **Jan 27, 2026:** Phase 6 completed - offset keyframes, undo/redo, easing curves, bulk ops, step copy/reuse
- **Jan 26, 2026:** Audio workflow unified (JSON `audioUrl`), admin uploads deferred to Save, visual editor audio sync
- **Jan 22, 2026:** Phase 6 at 90% - Animation authoring tool with keyframe editing
- **Jan 20, 2026:** Phase 6 at 80% - Admin panel with QR code print layout

### Tech Stack

```tech
Frontend:    Next.js 14 (Pages Router) + TypeScript 5.3
3D Engine:   Three.js 0.160.0 + GSAP 3.12.2
UI:          Tailwind CSS 3.4 (RTL support)
Auth:        bcryptjs 2.4.3 (token-based)
QR Codes:    qrcode.react 3.1.0
i18n:        Custom (localStorage + React Context)
Build:       Static Export
Hosting:     TBD (Hostinger planned)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern browser with WebGL support

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd AssemblyGuide

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create static export
npm run build

# Preview build
npm run start
```

---

## 📁 Project Structure

```folders
AssemblyGuide/
├── components/
│   ├── 3d/
│   │   └── SceneViewer.tsx       # Core 3D rendering engine
│   ├── admin/
│   │   ├── AdminLayout.tsx       # Admin panel layout
│   │   ├── AuthGuard.tsx         # Protected routes
│   │   └── CabinetFormModal.tsx  # Cabinet create/edit modal
│   ├── AudioPlayer.tsx           # Audio narration player
│   ├── Header.tsx                # App header with back button
│   ├── LanguageSwitcher.tsx      # Language toggle
│   ├── StepControls.tsx          # Play/pause/reset
│   └── StepNavigation.tsx        # Progress & step list
├── contexts/
│   ├── AuthContext.tsx           # Admin authentication
│   ├── ThemeContext.tsx          # Dark mode support
│   └── LanguageContext.tsx       # i18n provider
├── data/
│   ├── cabinets-index.json       # Cabinet metadata (fast loading)
│   ├── cabinets/
│   │   └── [id].json             # Individual cabinet animations
│   └── cabinets-loader.ts        # Smart data merge function
├── locales/
│   ├── en.json                   # English translations
│   └── ar.json                   # Arabic translations
├── pages/
│   ├── api/
│   │   ├── auth.ts               # Login endpoint
│   │   └── cabinets.ts           # Cabinet CRUD API
│   ├── admin/
│   │   ├── login.tsx             # Admin login
│   │   ├── cabinets/
│   │   │   ├── index.tsx         # Cabinet list with search/filter
│   │   │   └── [id]/
│   │   │       ├── edit.tsx      # Edit cabinet page
│   │   │       └── steps/
│   │   │           ├── index.tsx # Step management (drag-drop)
│   │   │           ├── new.tsx   # Add step form
│   │   │           └── [stepId]/
│   │   │               └── edit.tsx # Edit step form
│   │   └── qr-codes.tsx          # QR code generation & print
│   ├── _app.tsx                  # App wrapper
│   ├── index.tsx                 # Home page
│   └── cabinet/[id]/
│       ├── index.tsx             # Cabinet overview
│       └── step/[stepId].tsx     # Step viewer with 3D
├── public/
│   ├── models/                   # GLB 3D models
│   └── audio/                    # Narration files (eng/arb)
├── types/
│   └── cabinet.ts                # TypeScript interfaces
└── docs/
    ├── PROGRESS.md               # Development progress
    ├── IMPLEMENTATION_STATUS.md  # Implementation details
    └── DATA_STRUCTURE.md         # Data architecture docs
```

---

## 📊 Performance

### Current Metrics

| Metric     | Target | Current   |
| ---------- | ------ | --------- |
| 3D FPS     | >30fps | ~60fps ✅ |
| Model Size | <2MB   | 1.2MB ✅  |
| Page Load  | <3s    | ~2s ✅    |
| Lighthouse | >90    | TBD ⏳    |

---

## 📅 Roadmap

### MVP (V1.0) - March 2026

- [x] Phase 1: Foundation (2 weeks) ✅
- [x] Phase 2: 3D Viewer (2 weeks) ✅
- [x] Phase 3: Step System (2 weeks) ✅
- [ ] Phase 4: Content Creation (2 weeks) - Skipped for testing
- [x] Phase 5: Audio Integration (1 week) ✅
- [x] Phase 5.5: UI/UX Refinements (< 1 week) ✅
- [x] Phase 6: Admin Panel (2 weeks) ✅
  - [x] Authentication system ✅
  - [x] Cabinet CRUD ✅
  - [x] Step management with drag-drop ✅
  - [x] QR code generation with print layout ✅
  - [x] Visual 3D authoring tool ✅
  - [x] Step copy/reuse system ✅
- [x] Phase 7: QR Codes (1 week) - Integrated into Phase 6 ✅
- [x] Phase 8: Polish (1 day) ✅
  - [x] Toast notification system ✅
  - [x] Collapsible sidebar with state persistence ✅
  - [x] 3-column authoring layout ✅
  - [x] Material Symbols icon migration ✅
  - [x] Performance optimizations ✅
- [ ] Phase 9: Testing (1 week)
- [ ] Phase 10: Launch (1 week)

### Post-MVP (V1.1)

- Offline PWA support
- Advanced analytics
- Social sharing
- Video tutorials

### Full Product (V2.0)

- Scale to 58 cabinets
- More languages (Spanish, French, German)
- Reusable assembly sequences
- AR mode (iOS/Android)
- WCAG 2.1 AA accessibility

---

## 📚 Documentation

- **[MVP.md](./MVP.md)** - MVP requirements and scope
- **[PRD.md](./PRD.md)** - Full product specifications
- **[PROGRESS.md](./PROGRESS.md)** - Development progress tracker
- **[PHASE3_GUIDE.md](./PHASE3_GUIDE.md)** - Phase 3 implementation guide

---

## 📚 Documentation

**Comprehensive documentation available in the [docs/](./docs) folder:**

- **[📑 Documentation Index](./docs/DOCS_INDEX.md)** - Complete directory of all docs
- **[📊 Executive Summary](./docs/EXECUTIVE_SUMMARY.md)** - Status report for stakeholders
- **[📋 MVP Requirements](./docs/MVP.md)** - MVP scope and timeline
- **[📝 Product Requirements](./docs/PRD.md)** - Full product specifications
- **[📈 Progress Tracker](./docs/PROGRESS.md)** - Development progress
- **[🚀 Getting Started (Phase 3)](./docs/GETTING_STARTED_PHASE3.md)** - Implementation guide
- **[🔧 Phase 3 Guide](./docs/PHASE3_GUIDE.md)** - Detailed technical guide
- **[⚡ Phase 3 Quick Ref](./docs/PHASE3_QUICKREF.md)** - Quick reference
- **[📜 Changelog](./CHANGELOG.md)** - Version history

**Total:** 9 documents, ~5,500+ lines of comprehensive documentation

---

## 🌐 Languages

- **English** (default)
- **Arabic** (with RTL layout)

Switch languages using the language toggle in the header.

---

## 📝 Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript check

---

## 🎨 Technologies

- **Framework:** Next.js 14 (Pages Router)
- **3D Rendering:** Three.js 0.160.0
- **Styling:** Tailwind CSS 3.4
- **i18n:** Custom (localStorage + React Context)
- **Language:** TypeScript 5.3

---

## 🤝 Contributing

This is a private project. For questions or suggestions, contact the project team.

---

## 📝 License

Proprietary - All rights reserved

---

**Last Updated:** January 27, 2026  
**Version:** 0.11.0 (Phase 8 complete - 75% overall)  
**Status:** 🚧 Active Development

## 🔧 Configuration

### Adding New Cabinets

Admin panel provides a UI for this, or edit `data/cabinets-index.json`:

```json
{
  "id": "NEW-001",
  "name": {
    "en": "Cabinet Name",
    "ar": "اسم الخزانة"
  },
  "description": {
    "en": "Description",
    "ar": "وصف"
  },
  "category": "base",
  "image": "/cabinets/NEW-001.jpg",
  "stepCount": 0
}
```

Then create animation file in `data/cabinets/NEW-001.json`:

```json
{
  "steps": []
}
```

### Adding Translations

Edit translation files in `public/locales/[language]/common.json`

## 🚀 Deployment

This app is configured for static export to Hostinger:

1. Build: `npm run export`
2. Upload `out/` directory to Hostinger
3. Configure Cloudflare CDN

## 📱 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (iOS 12+)
- Samsung Internet (Android 8+)

## 🤝 Contributing

This is a private project. For questions, contact the development team.

## 📄 License

Proprietary - PowerWood © 2026
