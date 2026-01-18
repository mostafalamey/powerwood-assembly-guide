# 🪛 PWAssemblyGuide - Interactive 3D Cabinet Assembly Guide

> Mobile-first, multilingual 3D web application for kitchen cabinet assembly instructions

[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()
[![Phase](https://img.shields.io/badge/phase-3%20of%2010-blue)]()
[![Progress](https://img.shields.io/badge/progress-25%25-green)]()

---

## 📖 Overview

PWAssemblyGuide is a revolutionary web-based 3D assembly guide that helps customers assemble kitchen cabinets with interactive 3D animations, multi-language support, and voice narration. Accessible via QR codes on product packaging, it provides a superior alternative to traditional paper manuals.

### ✨ Key Features (MVP)

- 🎯 **QR Code Access** - Scan to instantly load your cabinet's guide
- 🎨 **Interactive 3D** - Rotate, zoom, and explore assembly steps
- 🌍 **Multilingual** - English and Arabic with RTL support
- 📱 **Mobile-First** - Optimized for smartphones and tablets
- 🎬 **Step Animations** - Watch parts come together in 3D
- 🔊 **Audio Narration** - Listen while you work (Phase 5)
- ⚡ **Fast & Offline** - Static hosting, PWA support (V2)

---

## 🚀 Current Status

### Phase Completion

- ✅ **Phase 1: Foundation** (100%) - Setup, routing, i18n
- ✅ **Phase 2: 3D Viewer** (100%) - Enhanced rendering, controls
- 🚧 **Phase 3: Step System** (60%) - Animations in progress
- ⏳ **Phase 4-10** - Upcoming

### Latest Updates

- **Jan 14, 2026:** Completed Phase 2 - Enhanced 3D viewer with collapsible UI
- **Jan 13, 2026:** Completed Phase 1 - Project foundation ready
- **Jan 13, 2026:** Project initiated

### Tech Stack

```
Frontend:    Next.js 14 (Pages Router) + TypeScript 5.3
3D Engine:   Three.js 0.160.0
UI:          Tailwind CSS 3.4 (RTL support)
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

```
AssemblyGuide/
├── components/
│   ├── 3d/
│   │   └── SceneViewer.tsx       # Core 3D rendering engine
│   ├── Layout.tsx                # App layout wrapper
│   ├── LanguageSwitcher.tsx      # Language toggle
│   ├── StepControls.tsx          # Play/pause/reset
│   └── StepNavigation.tsx        # Progress & step list
├── contexts/
│   └── LanguageContext.tsx       # i18n provider
├── data/
│   └── cabinets.json             # Cabinet definitions
├── locales/
│   ├── en.json                   # English translations
│   └── ar.json                   # Arabic translations
├── pages/
│   ├── _app.tsx                  # App wrapper
│   ├── index.tsx                 # Home page
│   └── cabinet/[id]/
│       ├── index.tsx             # Cabinet overview
│       └── step/[stepId].tsx     # Step viewer
├── public/
│   └── models/                   # GLB 3D models
├── types/
│   └── cabinet.ts                # TypeScript interfaces
├── MVP.md                        # Product requirements
├── PRD.md                        # Detailed specs
├── PROGRESS.md                   # Development progress
└── PHASE3_GUIDE.md               # Phase 3 implementation
```

---

## 📊 Performance

### Current Metrics

| Metric     | Target | Current   |
| ---------- | ------ | --------- |
| 3D FPS     | >30fps | ~60fps ✅ |
| Model Size | <2MB   | 1.2MB ✅  |
| Page Load  | <3s    | TBD ⏳    |
| Lighthouse | >90    | TBD ⏳    |

---

## 📅 Roadmap

### MVP (V1.0) - April 2026

- [x] Phase 1: Foundation (2 weeks) ✅
- [x] Phase 2: 3D Viewer (2 weeks) ✅
- [ ] Phase 3: Step System (2 weeks) - 60% complete 🚧
- [ ] Phase 4: Content Creation (2 weeks)
- [ ] Phase 5: Audio Integration (1 week)
- [ ] Phase 6: Admin Panel (2 weeks)
- [ ] Phase 7: QR Codes (1 week)
- [ ] Phase 8: Polish (2 weeks)
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

**Last Updated:** January 14, 2026  
**Version:** 0.3.0 (Phase 3 in progress)  
**Status:** 🚧 Active Development

## 🔧 Configuration

### Adding New Cabinets

Edit `data/cabinets.json`:

```json
{
  "id": "NEW-001",
  "name": "Cabinet Name",
  "nameAr": "اسم الخزانة",
  "category": "base",
  "estimatedTime": 20,
  "steps": [],
  "requiredTools": ["Tool 1", "Tool 2"]
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
