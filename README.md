# 🪛 PWAssemblyGuide - Interactive 3D Cabinet Assembly Guide

> Mobile-first, multilingual 3D web application for kitchen cabinet assembly instructions

![Status](https://img.shields.io/badge/status-completed-brightgreen)
![Phase](https://img.shields.io/badge/phase-complete-brightgreen)
![Progress](https://img.shields.io/badge/progress-100%25-brightgreen)

---

## 📖 Overview

PWAssemblyGuide is a revolutionary web-based 3D assembly guide that helps customers assemble kitchen cabinets with interactive 3D animations, multi-language support, and voice narration. Accessible via QR codes on product packaging, it provides a superior alternative to traditional paper manuals. The platform supports multi-tenant branding and a comprehensive admin panel with a visual 3D animation authoring tool.

### ✨ Key Features (MVP)

- 🎯 **QR Code Access** - Scan to instantly load your cabinet's guide ✅
- 🎨 **Interactive 3D** - Rotate, zoom, and explore assembly steps ✅
- 🌍 **Multilingual** - English and Arabic with RTL support ✅
- 📱 **Mobile-First** - Optimized for smartphones and tablets ✅
- 🎬 **Step Animations** - Watch parts come together in 3D ✅
- 🔊 **Audio Narration** - Listen while you work ✅
- 🛠️ **Admin Panel** - Content management system with dashboard ✅
- 📋 **QR Generation** - Print-ready codes for packaging ✅
- 🎬 **Animation Authoring** - Visual keyframe editor for step animations ✅
- 📊 **Admin Dashboard** - Statistics, alerts, and quick actions ✅
- 🏷️ **Annotation System** - Add arrows, callouts, and text to animations ✅
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
- ✅ **Phase 8.5: Dark Mode** (100%) - Enhanced theme support, UI polish
- ✅ **Phase 9: Design Language & UX** (100%) - Neutral Papyrus design system, UX consistency pass
- ✅ **Phase 10: Launch** (100%) - Final polish, documentation, release

### Latest Updates

- **Feb 13, 2026:** 🎉 **Project Completed** - Neutral Papyrus design language implemented across entire application, UX consistency pass, comprehensive documentation finalized
- **Feb 13, 2026:** Admin UI/UX Overhaul - Accessibility improvements (focus traps, ARIA), unified glassmorphism design, shared LoadingSpinner component, dynamic categories, upload progress bars, mobile authoring warning, error handling, terminology cleanup
- **Feb 6, 2026:** Multi-tenant Platform - Branding customization, tenant configuration, subdomain support
- **Feb 5, 2026:** Annotation System - GLB-based arrows/indicators, text annotations, color picker, thumbnail previews, per-step storage, playback support
- **Jan 30, 2026:** View Transitions API - Smooth page transitions, custom 404 page
- **Jan 29, 2026:** Admin Dashboard - Real-time stats, category breakdown, alerts, quick actions
- **Jan 29, 2026:** Dark mode polish - ThemeToggle component, CSS transitions, home page redesign

### Tech Stack

```tech
Frontend:    Next.js 14 (Pages Router) + TypeScript 5.3
3D Engine:   Three.js 0.160.0 + GSAP 3.12.2
UI:          Tailwind CSS 3.4 (RTL support + Dark Mode)
Auth:        bcryptjs 2.4.3 (token-based)
QR Codes:    qrcode.react 3.1.0
i18n:        Custom (localStorage + React Context)
Build:       Static Export
Backend:     PHP 8.3 API Layer
Hosting:     Hostinger Premium (https://mlextensions.com)
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
# Clean previous builds (avoids file locking issues)
Remove-Item -Recurse -Force .next,out  # PowerShell
# rm -rf .next out  # Bash

# Create static export
npm run build

# Output: out/ folder with static HTML/CSS/JS
```

**Deployment:** Upload `out/` folder contents to Hostinger. See [HOSTINGER_DEPLOYMENT.md](docs/HOSTINGER_DEPLOYMENT.md) for complete deployment guide.

---

## 📁 Project Structure

```folders
AssemblyGuide/
├── components/
│   ├── 3d/
│   │   └── SceneViewer.tsx         # Core 3D rendering engine
│   ├── admin/
│   │   ├── AdminLayout.tsx         # Admin panel layout
│   │   ├── AssemblyFormModal.tsx    # Assembly create/edit modal
│   │   ├── AuthGuard.tsx           # Protected routes (dark mode)
│   │   ├── CategoryFormModal.tsx   # Category create/edit modal
│   │   ├── FileUploadField.tsx     # File upload with progress bar
│   │   ├── LoadingSpinner.tsx      # Shared loading indicator
│   │   ├── ObjectHierarchyTree.tsx  # GLB object tree view
│   │   ├── Timeline.tsx            # Keyframe timeline
│   │   └── ToastProvider.tsx       # Toast & confirm dialogs
│   ├── AudioPlayer.tsx             # Audio narration player
│   ├── Header.tsx                  # App header with back button
│   ├── LanguageSwitcher.tsx        # Language toggle
│   ├── StepControls.tsx            # Play/pause/reset
│   └── StepNavigation.tsx          # Progress & step list
├── contexts/
│   ├── AuthContext.tsx             # Admin authentication
│   ├── BrandingContext.tsx         # Multi-tenant branding
│   └── ThemeContext.tsx            # Dark mode support
├── data/
│   ├── assemblies-index.json       # Assembly metadata (fast loading)
│   ├── assemblies/
│   │   └── [id].json               # Individual assembly animations
│   └── assemblies-loader.ts        # Smart data merge function
├── pages/
│   ├── api/
│   │   ├── auth/                   # Login/validate endpoints
│   │   ├── assemblies.ts           # Assembly CRUD API
│   │   └── categories.ts           # Category CRUD API
│   ├── admin/
│   │   ├── login.tsx               # Admin login
│   │   ├── index.tsx               # Dashboard with stats
│   │   ├── branding.tsx            # Tenant branding config
│   │   ├── assemblies/
│   │   │   ├── index.tsx           # Assembly list with search/filter
│   │   │   ├── new.tsx             # Create assembly
│   │   │   └── [id]/
│   │   │       ├── edit.tsx        # Edit assembly
│   │   │       └── steps/
│   │   │           ├── index.tsx   # Step management
│   │   │           ├── new.tsx     # Add step form
│   │   │           ├── authoring.tsx # 3D animation authoring
│   │   │           └── [stepId]/
│   │   │               └── edit.tsx # Edit step form
│   │   ├── categories/             # Category management
│   │   └── qr-codes.tsx            # QR code generation & print
│   ├── _app.tsx                    # App wrapper
│   ├── index.tsx                   # Home page
│   └── assembly/[id]/
│       ├── index.tsx               # Assembly overview
│       └── step/[stepId].tsx       # Step viewer with 3D
├── public/
│   ├── models/                     # GLB 3D models
│   └── audio/                      # Narration files (eng/arb)
├── types/
│   ├── assembly.ts                 # Assembly TypeScript interfaces
│   └── animation.ts               # Animation/keyframe types
├── php-api/                        # PHP backend for Hostinger
└── docs/                           # Project documentation
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
- [x] Phase 9: Design Language & UX (1 week) ✅
  - [x] Neutral Papyrus design system ✅
  - [x] UX consistency pass across all pages ✅
  - [x] StepFormModal creation ✅
- [x] Phase 10: Launch (1 week) ✅
  - [x] Final documentation ✅
  - [x] Project completion ✅

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

**Total:** 14 documents, ~9,200+ lines of comprehensive documentation

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

**Last Updated:** February 13, 2026  
**Version:** 1.0.0 (Project Complete)  
**Status:** ✅ Completed

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
