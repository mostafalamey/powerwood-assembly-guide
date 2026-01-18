# Changelog

All notable changes to the PWAssemblyGuide project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### In Progress

- Step animation system (Phase 3)
- Object visibility control
- Smooth transitions with GSAP
- Swipe gestures for mobile navigation

---

## [0.3.0] - 2026-01-14

### ✨ Added - Phase 2 Completion

- **Enhanced 3D Rendering:**
  - HemisphereLight for ambient illumination
  - DirectionalLight with shadow casting
  - Shadow optimization (1024x1024 shadow map)
  - ACESFilmicToneMapping for photorealistic look
  - SRGBColorSpace for accurate color representation
- **Material Customization:**
  - Darker legs (0.8 grey multiplier)
  - Brighter panels (1.2 brightness multiplier)
  - Name-based detection (checks both mesh and material)
- **Ground Plane:**
  - Infinite grid appearance
  - Shadow reception
  - Subtle grey color (#f0f0f0)
- **Model Positioning:**
  - Auto-centering algorithm
  - Ground alignment (sits on ground plane)
  - Optimal camera distance calculation
- **UI Components:**
  - `StepControls.tsx` - Compact mobile controls (w-10/h-10)
  - `StepNavigation.tsx` - Progress bar and step list
  - Collapsible step description with smooth transitions
  - 400px viewer height for prominence
- **Performance:**
  - Pixel ratio capped at 2 for mobile
  - Efficient material updates
  - Optimized shadow rendering

### 🐛 Fixed

- Material caching issue (browser not reflecting color changes)
- Model elevation (was floating above ground)
- Navigation buttons requiring scroll (reduced margins/padding)
- Div structure for collapsible content
- `cabinetsData.find()` error (was object, not array)
- `modelUrl` property name (should be `.model`)

### 🔄 Changed

- Increased 3D viewer height: 280px → 400px
- Reduced layout spacing: px-4 → px-2, py-6 → py-2
- Button sizes: text-sm → text-xs, smaller icons
- Description area made collapsible
- Chevron icon rotates on toggle

### 📚 Documentation

- Updated [MVP.md](./MVP.md) with Phase 1 & 2 completion status
- Created [PROGRESS.md](./PROGRESS.md) - Comprehensive progress tracker
- Created [PHASE3_GUIDE.md](./PHASE3_GUIDE.md) - Implementation guide
- Created [PHASE3_QUICKREF.md](./PHASE3_QUICKREF.md) - Quick reference
- Updated [README.md](./README.md) with current status
- Updated version to 1.1 in MVP.md

---

## [0.2.0] - 2026-01-13

### ✨ Added - Phase 1 Completion

- **Project Setup:**
  - Next.js 14.0.4 with Pages Router
  - TypeScript 5.3.0 configuration
  - Tailwind CSS 3.4.0 with RTL support
  - Three.js 0.160.0 with OrbitControls and GLTFLoader
- **Internationalization:**
  - Custom i18n system (localStorage + React Context)
  - Language files: `locales/en.json`, `locales/ar.json`
  - `LanguageSwitcher` component
  - RTL layout switching
  - Language persistence via localStorage
- **Routing:**
  - `pages/index.tsx` - Home page
  - `pages/cabinet/[id]/index.tsx` - Cabinet overview
  - `pages/cabinet/[id]/step/[stepId].tsx` - Step viewer
  - Dynamic routing with URL-based navigation
- **Components:**
  - `Layout.tsx` - App wrapper with language switching
  - `LanguageSwitcher.tsx` - EN/AR toggle
  - `contexts/LanguageContext.tsx` - i18n provider
- **Data Structure:**
  - `data/cabinets.json` - Cabinet definitions (2 samples)
  - TypeScript interfaces in `types/cabinet.ts`
  - Sample data: BC-001 (Base Cabinet), WC-001 (Wall Cabinet)
- **3D Models:**
  - Converted `sources/BaseCabinetCarcass.skp` → `public/models/BC-001.glb`
  - Added `public/models/Arrows.glb` for assembly indicators
- **Configuration:**
  - `next.config.js` - Static export with trailingSlash
  - `tailwind.config.js` - RTL support, custom colors
  - `tsconfig.json` - TypeScript paths and settings

### 🔧 Technical Decisions

- **Pages Router over App Router:** Simpler for static export
- **Custom i18n:** next-i18next incompatible with static export
- **localStorage for language:** Client-side persistence without backend
- **Vanilla Three.js:** Easier debugging, smaller bundle vs R3F

### 📚 Documentation

- Created [MVP.md](./MVP.md) - MVP requirements (1047 lines)
- Created [PRD.md](./PRD.md) - Product specifications (1226 lines)
- Created [README.md](./README.md) - Project documentation

---

## [0.1.0] - 2026-01-13

### 🎉 Initial Release

- Project initialized
- Repository structure created
- Documentation framework established
- Source 3D files added:
  - `sources/BaseCabinetCarcass.skp`
- Planning documents created:
  - MVP scope defined
  - PRD drafted
  - 16-week timeline planned

---

## Version History Summary

| Version | Date       | Phase    | Status      | Highlights                            |
| ------- | ---------- | -------- | ----------- | ------------------------------------- |
| 0.3.0   | 2026-01-14 | Phase 2  | ✅ Complete | Enhanced 3D rendering, collapsible UI |
| 0.2.0   | 2026-01-13 | Phase 1  | ✅ Complete | Foundation, routing, i18n             |
| 0.1.0   | 2026-01-13 | Planning | ✅ Complete | Project initialization                |

---

## Upcoming Releases

### [0.4.0] - 2026-01-25 (Planned)

**Phase 3: Step System**

- Animation data format
- Object visibility control
- Smooth transitions (GSAP)
- Swipe gestures
- Step thumbnails
- Completion tracking

### [0.5.0] - 2026-02-08 (Planned)

**Phase 4: Content Creation**

- 10 cabinet 3D models
- Assembly animations
- English/Arabic translations
- Step descriptions

### [0.6.0] - 2026-02-15 (Planned)

**Phase 5: Audio Integration**

- AudioPlayer component
- English narration
- Arabic narration
- Preloading system

### [1.0.0] - 2026-04-?? (Planned)

**MVP Launch**

- All 10 cabinets functional
- Full QR code integration
- Admin panel complete
- Production deployment

---

## Notes

### Versioning Scheme

- **Major (1.0.0):** MVP launch, major milestones
- **Minor (0.X.0):** Phase completions, new features
- **Patch (0.0.X):** Bug fixes, minor improvements

### Development Pace

- Phase 1: 1 day (planned: 2 weeks) - 93% faster ⚡
- Phase 2: 1 day (planned: 2 weeks) - 93% faster ⚡
- Phase 3: In progress (planned: 2 weeks)
- **Overall:** Significantly ahead of schedule

### Key Metrics

- **Lines of Code:** ~2,000+ (TypeScript/TSX)
- **Components:** 7 (3D, UI, context, layout)
- **Pages:** 3 (index, cabinet, step)
- **Data Files:** 2 (cabinets, categories)
- **3D Models:** 2 (BC-001, Arrows)
- **Languages:** 2 (EN, AR)
- **Documentation:** 6 files, ~4,000 lines

---

**Maintained by:** PowerWood Development Team  
**Last Updated:** January 14, 2026
