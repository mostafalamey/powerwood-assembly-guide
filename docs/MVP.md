# Minimum Viable Product (MVP) Document

## Kitchen Cabinet Assembly Guide Web Application

**Project Name:** PWAssemblyGuide MVP  
**Version:** 1.0  
**Date:** January 14, 2026  
**Target Launch:** April 2026 (16 weeks)  
**Document Owner:** Product Team  
**Current Phase:** Phase 2 ✅ Completed | Phase 3 🚧 In Progress

---

## 1. Executive Summary

The MVP focuses on delivering core assembly guide functionality for a **subset of 10 cabinets** (2 per category minimum) to validate the concept, gather user feedback, and prove technical feasibility before scaling to all 58 cabinets.

### MVP Goals

1. **Validate user experience** with 3D assembly guides via QR codes
2. **Prove technical architecture** works on mobile devices
3. **Test multilingual approach** (English + Arabic)
4. **Establish content pipeline** with admin panel
5. **Launch within 16 weeks** with limited scope

### Success Criteria

- ✅ 10 cabinets fully functional with 3D animations
- ✅ <3 second load time on mobile
- ✅ 85%+ QR code scan success rate
- ✅ Positive user feedback from 50+ beta testers
- ✅ Admin can add new cabinet in <30 minutes

---

## 2. MVP Scope Definition

### 2.1 What's IN the MVP ✅

#### Core Features (Must Have)

1. **QR Code Direct Access** - Scan to land on specific cabinet
2. **10 Cabinets** - Representative sample across all categories:

   - Base Cabinets: 2 models
   - Wall Cabinets: 2 models
   - High Cabinets: 1 model
   - Tall Cabinets: 1 model
   - Corner Base: 1 model
   - Corner Wall: 1 model
   - Fillers: 2 models

3. **3D Interactive Viewer**

   - GLB model loading
   - Step-based animations
   - Predefined camera angles
   - User orbit controls (rotate/zoom)
   - Reset camera button
   - Play/pause/restart controls

4. **Step Navigation**

   - Step list with thumbnails
   - Click to jump to step
   - Previous/Next buttons
   - Progress indicator
   - Mobile-optimized layout

5. **Multilingual Support**

   - English and Arabic languages
   - RTL layout for Arabic
   - Language switcher
   - Translated UI and step descriptions

6. **Audio Narration**

   - Manual play button per step
   - English and Arabic audio files
   - Play/pause controls
   - Preloading for current step

7. **Basic Admin Panel**

   - Single admin login
   - Upload GLB files (manual Draco compression for MVP)
   - Create cabinet entries
   - **3D Authoring Tool** for visual step creation:
     - Load cabinet 3D models in interactive viewer
     - Select individual objects/parts in the scene
     - Show/hide different elements
     - Move and rotate objects to create assembly positions
     - Record object animations (movement sequences)
     - Record camera positions and movements
     - Preview animations before saving
     - Generate step data automatically from recordings
   - **Dual-Language Input:**
     - Side-by-side English/Arabic text fields for step descriptions
     - Common woodworking terms available via JSON reference
     - UI translations handled by static JSON files
   - **Copy Steps Between Cabinets:**
     - Browse existing steps from other cabinets
     - Copy animation, camera, and description
     - Adjust for different model if needed
     - Track step reuse statistics
   - Upload audio files
   - Assign to categories
   - Generate QR codes

8. **Cabinet Landing Page**

   - Overview after QR scan
   - Cabinet name and image
   - Estimated assembly time
   - Step count
   - "Start Assembly" button
   - Language switcher

9. **Mobile-First Responsive Design**

   - Works on phones (320px+ width)
   - Touch-friendly controls
   - Optimized for portrait orientation

10. **Basic Analytics**
    - Track QR scans per cabinet
    - Track language preferences
    - Basic error logging

---

### 2.2 What's OUT of the MVP ❌ (Deferred to V2)

#### Features Postponed

1. **PWA/Offline Mode** - Requires service worker complexity
2. **Reusable Assembly Sequences** - Template system needs more dev time
3. **Category Browse Page** - Not needed if users access via QR only
4. **Advanced Analytics Dashboard** - Basic tracking sufficient for MVP
5. **Automatic Draco Compression** - Admin manually compresses in Blender
6. **Multi-Admin Support** - Single admin sufficient initially
7. **Search/Filter** - Not needed for 10 cabinets
8. **Version Control** - Always show latest content
9. **User-Generated Content** - Comments/tips deferred
10. **Additional Languages** - English + Arabic only
11. **Video Tutorials** - 3D animations sufficient for MVP
12. **AR Mode** - Complex, defer to future
13. **2D Fallback** - Focus on WebGL-capable devices
14. **Advanced Error Handling** - Basic 404 page only
15. **Accessibility Features** - WCAG compliance in V2

#### Simplified MVP Approaches

- **Admin Panel:** Basic CRUD interface with 3D authoring tool (not full CMS like Payload)
- **3D Models:** Simplified geometry (<30K triangles) for faster load
- **Audio:** English only initially, Arabic added week 14
- **3D Authoring:** Visual editor for creating steps and animations (replaces manual coordinate entry)
- **Translation:** Manual dual-language input with JSON reference files (no API needed)
- **Step Reuse:** Simple copy functionality (not full template system - deferred to V2)
- **Testing:** Manual testing (no automated tests in MVP)

---

## 3. MVP Cabinet Selection

### 3.1 Selected Cabinets (10 Total)

| Category      | Cabinet ID | Name                | Reason for Selection     | Steps | Complexity |
| ------------- | ---------- | ------------------- | ------------------------ | ----- | ---------- |
| Base Cabinets | BC-001     | 2-Door Base 36"     | Most popular base model  | 8     | Medium     |
| Base Cabinets | BC-015     | Drawer Base 24"     | Tests drawer assembly    | 12    | High       |
| Wall Cabinets | WC-001     | 2-Door Wall 30"     | Standard wall cabinet    | 6     | Low        |
| Wall Cabinets | WC-008     | Glass Door Wall 36" | Tests glass installation | 10    | Medium     |
| High Cabinets | HC-001     | Tall Wall 42"       | Simple high cabinet      | 7     | Low        |
| Tall Cabinets | TC-001     | Pantry 24"          | Full-height assembly     | 15    | High       |
| Corner Base   | CB-001     | Corner Base 36"     | Corner angle complexity  | 9     | High       |
| Corner Wall   | CW-001     | Corner Wall 30"     | Corner wall mounting     | 8     | Medium     |
| Fillers       | FL-001     | Base Filler 3"      | Simplest assembly        | 3     | Very Low   |
| Fillers       | FL-003     | Wall Filler 6"      | Filler variation         | 3     | Very Low   |

**Total Steps Across 10 Cabinets:** ~81 steps  
**Average Steps per Cabinet:** 8.1

### 3.2 Selection Rationale

- **Coverage:** At least 1 from each of 7 categories
- **Variety:** Mix of simple (fillers) and complex (pantry, drawer base)
- **Popularity:** Prioritize best-selling models
- **Reusability:** Models that share components (test future sequence system)
- **Feasibility:** Models with existing or easy-to-create 3D files

---

## 4. MVP User Stories (Prioritized)

### 🔴 Critical (P0) - Must Have

**US-MVP-1:** As a customer, I want to scan a QR code on my cabinet box, so that I can immediately access its assembly guide.

- Acceptance: QR scans and loads cabinet page in <3 seconds

**US-MVP-2:** As a customer, I want to see each assembly step in 3D, so that I understand exactly how parts connect.

- Acceptance: 3D model animates showing assembly movement

**US-MVP-3:** As a customer, I want to navigate between steps, so that I can follow the guide at my own pace.

- Acceptance: Can jump to any step, use prev/next buttons

**US-MVP-4:** As a customer, I want to rotate the 3D model, so that I can see from different angles.

- Acceptance: Touch drag rotates model smoothly

**US-MVP-5:** As an Arabic speaker, I want to switch to Arabic language, so that I can read instructions in my native language.

- Acceptance: UI switches to RTL, text translates to Arabic

**US-MVP-6:** As a customer, I want to hear voice narration, so that I can listen while working.

- Acceptance: Audio plays clearly when I press play button

**US-MVP-7:** As an admin, I want to upload a new cabinet's 3D models, so that customers can access its guide.

- Acceptance: Upload GLB, create steps, generates QR code

**US-MVP-7b:** As an admin, I want to visually create assembly steps using a 3D authoring tool, so that I can efficiently design animations without external software.

- Acceptance: Select objects, move/rotate them, record animation, save camera position

**US-MVP-7c:** As an admin, I want to enter step descriptions in both English and Arabic simultaneously, so that I can provide bilingual content efficiently.

- Acceptance: Side-by-side text fields for English/Arabic, common terms reference available, both save to step data

**US-MVP-7d:** As an admin, I want to copy steps from other cabinets, so that I can reuse common assembly sequences (like hinge attachment).

- Acceptance: Browse existing steps, select one, copy to current cabinet, adjust if needed

---

### 🟡 Important (P1) - Should Have

**US-MVP-8:** As a customer, I want to see progress through the assembly, so that I know how much is left.

- Acceptance: Progress bar shows completion percentage

**US-MVP-9:** As an admin, I want to preview 3D models before publishing, so that I ensure quality.

- Acceptance: See 3D preview in admin panel

**US-MVP-10:** As a customer, I want to reset the camera if I get disoriented, so that I can return to the default view.

- Acceptance: Reset button returns to predefined angle

---

### 🟢 Nice to Have (P2) - Could Have (if time permits)

**US-MVP-11:** As an admin, I want to see which cabinets are accessed most, so that I can identify popular models.

- Acceptance: Admin dashboard shows scan counts

**US-MVP-12:** As a customer, I want to see estimated assembly time, so that I can plan accordingly.

- Acceptance: Landing page shows time estimate

---

## 5. MVP Technical Architecture (Simplified)

### 5.1 Simplified Tech Stack

| Component        | Technology                       | MVP Simplification                    |
| ---------------- | -------------------------------- | ------------------------------------- |
| **Frontend**     | Next.js 14 (Pages Router)        | Simpler than App Router for MVP       |
| **3D Rendering** | Three.js (vanilla)               | Skip React Three Fiber for simplicity |
| **State**        | React Context API                | No Zustand needed for 10 cabinets     |
| **i18n**         | next-i18next                     | Same as full version                  |
| **Styling**      | Tailwind CSS                     | Same as full version                  |
| **Admin Panel**  | Next.js API Routes + React Admin | No separate CMS, built-in admin       |
| **Database**     | JSON files (file system)         | No MongoDB for MVP                    |
| **Hosting**      | Hostinger (static)               | No Node.js server needed              |
| **CDN**          | Cloudflare (free tier)           | Same as full version                  |

### 5.2 MVP Data Storage

**Instead of database, use static JSON files:**

```text
/data/
  cabinets.json          # All 10 cabinet definitions
  categories.json        # 7 category metadata
  analytics.json         # Simple scan tracking
```

**Admin edits generate new JSON files → Rebuild static site → Deploy:**

### 5.3 Simplified File Structure

```folders
AssemblyGuide/
├── pages/
│   ├── index.tsx                    # Simple landing (optional)
│   ├── cabinet/
│   │   └── [id].tsx                 # Cabinet overview + step viewer
│   ├── admin/
│   │   ├── login.tsx
│   │   ├── dashboard.tsx
│   │   └── cabinets/
│   │       ├── index.tsx            # List cabinets
│   │       ├── new.tsx              # Create cabinet
│   │       └── [id]/edit.tsx        # Edit cabinet
│   └── api/
│       ├── cabinets.ts              # CRUD operations
│       └── analytics.ts             # Track scans
├── components/
│   ├── ThreeViewer.tsx              # 3D canvas component
│   ├── StepList.tsx                 # Step navigation
│   ├── AudioPlayer.tsx              # Audio controls
│   ├── LanguageSwitcher.tsx         # Language toggle
│   ├── AdminLayout.tsx              # Admin UI shell
│   └── admin/
│       ├── StepAuthor.tsx           # 3D authoring tool
│       ├── ObjectSelector.tsx       # Scene object selection
│       ├── TransformControls.tsx    # Move/rotate controls
│       ├── AnimationRecorder.tsx    # Record animations
│       ├── CameraRecorder.tsx       # Record camera positions
│       ├── DualLanguageInput.tsx    # Side-by-side EN/AR text fields
│       ├── TermsReference.tsx       # Common woodworking terms popup
│       └── StepCopyModal.tsx        # Browse and copy existing steps
├── lib/
│   ├── three-setup.ts               # Three.js initialization
│   ├── load-cabinet.ts              # Load JSON data
│   ├── qr-generator.ts              # QR code creation
│   └── admin/
│       ├── scene-parser.ts          # Parse GLB object hierarchy
│       ├── animation-utils.ts       # Animation keyframe generation
│       ├── transform-tracker.ts     # Track object transformations
│       └── step-search.ts           # Search and filter existing steps
├── public/
│   ├── models/                      # 10 cabinet GLB files
│   ├── audio/
│   │   ├── en/                      # English narration
│   │   └── ar/                      # Arabic narration
│   └── qr/                          # Generated QR codes
├── data/
│   ├── cabinets.json
│   └── categories.json
└── locales/
    ├── en/
    │   ├── common.json              # UI translations
    │   └── woodworking.json         # Common woodworking terms
    └── ar/
        ├── common.json
        └── woodworking.json
```

---

## 6. MVP Development Timeline (16 Weeks)

### Phase 1: Setup & Foundation (Weeks 1-2) ✅ COMPLETED

**Goal:** Project infrastructure ready

**Status:** ✅ Completed on January 13, 2026

- [x] Week 1: Initialize Next.js project

  - ✅ Create project with TypeScript
  - ✅ Install dependencies (Three.js, Tailwind, custom i18n)
  - ✅ Set up Git repository
  - ✅ Create folder structure
  - ✅ Configure Tailwind with RTL support

- [x] Week 2: Basic routing and layout
  - ✅ Create page routes (cabinet/[id], cabinet/[id]/step/[stepId])
  - ✅ Build basic layout component
  - ✅ Set up custom i18n with en/ar (localStorage + Context API)
  - ✅ Create language switcher
  - ✅ Test RTL layout switching

**Deliverable:** ✅ Empty pages with routing working  
**Implementation Notes:**

- Using Pages Router for simpler static export
- Custom i18n instead of next-i18next (static export compatibility)
- Language persistence via localStorage

---

### Phase 2: 3D Viewer Core (Weeks 3-4) ✅ COMPLETED

**Goal:** Display 3D models and control camera

**Status:** ✅ Completed on January 14, 2026

- [x] Week 3: Three.js integration

  - ✅ Set up Three.js scene, camera, renderer (SceneViewer.tsx)
  - ✅ Implement GLB loader with error handling
  - ✅ Display first test model (BC-001.glb from CarcassBase.glb)
  - ✅ Add OrbitControls for mobile-friendly interaction
  - ✅ Implement responsive canvas sizing with pixel ratio limiting
  - ✅ Enhanced lighting (hemisphere + directional with shadows)
  - ✅ Ground plane with shadow reception
  - ✅ Material customization (darker legs, brighter panels)

- [x] Week 4: Camera and controls
  - ✅ Predefined camera positions per step with auto-centering
  - ✅ Camera transition animations
  - ✅ Reset camera button (StepControls component)
  - ✅ Play/pause/restart animation controls
  - ✅ Mobile-optimized compact UI (w-10/h-10 buttons)
  - ✅ Collapsible step description for 400px viewer height
  - ✅ Animation mixer setup for future step animations
  - ✅ Touch controls optimization
  - ✅ Play/pause/restart animation buttons

**Deliverable:** ✅ Interactive 3D viewer with controls  
**Implementation Notes:**

- ACESFilmicToneMapping for realistic rendering
- SRGBColorSpace for accurate color display
- Pixel ratio capped at 2 for mobile performance
- Material name-based styling (legs vs panels)
- 400px viewer with collapsible description UI

---

### Phase 3: Step System (Weeks 5-6) 🚧 IN PROGRESS

**Goal:** Navigate between assembly steps

**Status:** 🚧 Starting Week 5 - January 14, 2026

- [ ] Week 5: Step data structure

  - ✅ Define cabinets.json schema (already created with sample data)
  - ✅ Load cabinet data in pages (already implemented)
  - ✅ Build step list component (StepNavigation.tsx exists)
  - ✅ Implement step navigation logic (already working)
  - ✅ Current step state management (URL-based with useRouter)
  - 🔄 **TO DO:** Enhance animation system
    - [ ] Create animation data format for steps
    - [ ] Implement object show/hide based on step
    - [ ] Add smooth transitions between steps
    - [ ] Test with multiple assembly steps

- [ ] Week 6: Step UI and progress
  - ✅ Progress bar component (already in StepNavigation)
  - ✅ Previous/Next navigation (already implemented)
  - ✅ Mobile-optimized step list (compact layout done)
  - [ ] **TO DO:** Visual enhancements
    - [ ] Step thumbnails (auto-generated from 3D)
    - [ ] Swipe gestures for mobile
    - [ ] Step completion indicators
    - [ ] Improved step descriptions with tools/duration display

**Deliverable:** Full step navigation working  
**Current Progress:**

- Basic navigation structure complete
- Step data loading functional
- UI components created
- Animation system needs enhancement for step-based visibility

---

### Phase 4: Content Creation (Weeks 7-8)

**Goal:** Create 3D models and translations

- [x] Week 7: 3D modeling

  - Model 10 cabinets in Blender
  - Create arrow models
  - Set up animations in Blender
  - Export as GLB with Draco compression
  - Optimize polygon counts (<30K each)

- [x] Week 8: Translations and audio
  - Write step descriptions (English)
  - Professional Arabic translation
  - Record/generate audio narration (English)
  - Record/generate audio narration (Arabic)
  - Organize files by language

**Deliverable:** All 10 cabinets' assets ready

---

### Phase 5: Audio Integration (Week 9)

**Goal:** Audio narration system

- [x] Week 9: Audio player
  - Build AudioPlayer component
  - Implement preloading
  - Play/pause controls
  - Sync audio with step changes
  - Test on iOS Safari (autoplay restrictions)
  - Volume controls

**Deliverable:** Working audio narration

---

### Phase 6: Admin Panel (Weeks 10-11)

**Goal:** Content management interface

- [x] Week 10: Admin CRUD

  - Simple login page (hardcoded credentials for MVP)
  - Cabinet list page
  - Create cabinet form
  - Edit cabinet form
  - File upload (GLB, audio)
  - **Create translation JSON files** (woodworking terms, UI labels)
  - **Step browser/copy functionality**

- [x] Week 11: Admin features
  - Step editor (add/remove/reorder)
  - **3D Authoring Tool:**
    - Three.js scene in admin panel
    - Object selection (raycasting)
    - Transform controls (move/rotate)
    - Show/hide object toggles
    - Animation recording system
    - Camera position recording
    - Playback preview
  - **Dual-language input UI:**
    - Side-by-side English/Arabic text fields
    - Common terms reference panel
    - Copy-paste helpers for repeated phrases
  - **Copy step modal:**
    - Search existing steps across all cabinets
    - Preview animation before copying
    - One-click copy
  - QR code generation
  - Save to cabinets.json
  - Deploy workflow (rebuild site)

**Deliverable:** Functional admin panel with visual step creator

---

### Phase 7: QR Code & Landing (Week 12)

**Goal:** Complete QR scan journey

- [x] Week 12: QR implementation
  - Generate QR codes for 10 cabinets
  - Cabinet landing page design
  - Show cabinet overview (name, time, steps)
  - "Start Assembly" button
  - Handle invalid QR codes (404)
  - Test QR scanning on devices

**Deliverable:** End-to-end QR flow working

---

### Phase 8: Polish & Optimization (Weeks 13-14)

**Goal:** Performance and UX refinement

- [x] Week 13: Performance

  - Lazy load 3D models per step
  - Optimize audio file sizes
  - Implement image optimization
  - Add loading states
  - Reduce JS bundle size
  - Lighthouse performance audit

- [x] Week 14: UX improvements
  - Smooth transitions
  - Better loading indicators
  - Error messages
  - Help tooltips
  - Keyboard shortcuts (desktop)
  - Final Arabic UI adjustments

**Deliverable:** Polished user experience

---

### Phase 9: Testing (Week 15)

**Goal:** Validate on real devices

- [x] Week 15: Device testing
  - Test on 5+ mobile devices
    - iPhone 11, 13 (Safari)
    - Samsung Galaxy S10, S21 (Chrome)
    - Budget Android (One Plus Nord)
  - Test QR scanning in real-world conditions
  - Test in bright/dim lighting
  - Test with actual cabinet parts
  - User testing with 10 beta testers
  - Fix critical bugs
  - Performance validation (<3s load)

**Deliverable:** Bug-free, tested application

---

### Phase 10: Deployment & Launch (Week 16)

**Goal:** Production launch

- [x] Week 16: Go live
  - Set up Hostinger hosting
  - Configure Cloudflare CDN
  - Deploy static build
  - Set up custom domain
  - SSL certificate
  - Print QR codes on stickers
  - Train admin on CMS
  - Create admin documentation
  - Soft launch announcement
  - Monitor analytics

**Deliverable:** Live production app

---

## 7. MVP Success Metrics

### Launch Targets (First 30 Days)

- **QR Scans:** 100+ unique scans
- **Page Load Time:** <3 seconds (Mobile 4G)
- **3D Render FPS:** >30fps on iPhone 11
- **Error Rate:** <5% of sessions
- **Step Completion:** >80% users complete all steps
- **Language Usage:** Track English vs. Arabic
- **Mobile Traffic:** >85% of all traffic
- **Browser Support:** >95% successful loads

### User Feedback Metrics

- **Ease of Use:** >4/5 rating
- **Clarity of Instructions:** >4/5 rating
- **Would Recommend:** >80% yes
- **Compared to Paper Manual:** >90% prefer digital

### Admin Efficiency

- **Add New Cabinet:** <15 minutes (with step copying)
- **Create New Step:** <6 minutes (visual authoring + manual Arabic entry)
- **Copy Existing Step:** <2 minutes (adjust if needed)
- **Arabic Translation:** <1 minute per step (manual entry with term reference)
- **Edit Step:** <2 minutes
- **Generate QR Code:** <30 seconds

---

## 8. MVP Constraints & Assumptions

### Constraints

1. **16-week deadline** - Cannot extend timeline
2. **Single developer** - No large team
3. **Budget:** Minimal (Hostinger hosting only)
4. **10 cabinets maximum** - No scope creep
5. **English + Arabic only** - No other languages
6. **Manual compression** - No automated pipeline
7. **Basic admin** - No advanced CMS features

### Assumptions

1. Admin has Blender skills for 3D modeling
2. Audio narration can be generated/recorded quickly
3. Hostinger hosting supports static sites adequately
4. 10 cabinets representative of all 58
5. Users have smartphones with camera (99% do)
6. Users willing to use web app vs. paper (validated by research)
7. QR codes can be printed on packaging before launch

---

## 9. MVP Risks & Mitigation

### Critical Risks

**Risk 1: 3D Modeling Takes Too Long**  
**Mitigation:**

- Start modeling in Week 1 (parallel to dev)
- Use simple geometry (quality over complexity)
- Reuse common parts between cabinets
- Outsource if falling behind (Week 5 checkpoint)

**Risk 2: Mobile Performance Issues**  
**Mitigation:**

- Test on real devices weekly (not just emulators)
- Set hard limit: 30K triangles per model
- Use Draco compression aggressively
- Disable shadows/advanced effects on mobile

**Risk 3: Arabic Translation Quality**  
**Mitigation:**

- Hire professional technical translator
- Review with native Arabic speaker
- Test with Arabic-speaking beta users (Week 15)
- Iterate based on feedback

**Risk 4: QR Code Printing Delays**  
**Mitigation:**

- Generate QR codes by Week 12
- Use temporary stickers if packaging not ready
- QR codes can be added to existing boxes post-launch

**Risk 5: Audio Production Bottleneck**  
**Mitigation:**

- Use TTS (Text-to-Speech) for MVP if needed
- Record English first, Arabic in Week 14
- Keep narration short and concise

---

## 10. Post-MVP Roadmap

### Immediate Post-Launch (Weeks 17-20)

1. **Bug Fixes:** Address issues found by users
2. **Analytics Review:** Analyze usage patterns
3. **User Feedback:** Collect and prioritize improvements
4. **Add 5 More Cabinets:** Expand to 15 total (validate workflow)

### V1.5 (Months 2-3)

1. **Reusable Sequences:** Implement template system
2. **All 58 Cabinets:** Complete full catalog
3. **Category Browse:** Add home page navigation
4. **Improved Admin:** Better UX for content management

### V2.0 (Months 4-6)

1. **PWA/Offline:** Service worker for offline use
2. **Advanced Analytics:** Dashboard with insights
3. **Automated Compression:** Draco pipeline in admin
4. **Additional Languages:** Spanish, French
5. **Accessibility:** WCAG 2.1 AA compliance

### V3.0 (Months 7-12)

1. **AR Mode:** Augmented reality assembly
2. **Video Supplements:** Record live demos
3. **User Tips:** Community-contributed advice
4. **Professional Portal:** Installer-specific features

---

## 11. MVP Team & Responsibilities

### Core Team (Minimal Viable Team)

**Role: Full-Stack Developer** (Copilot or You)

- Responsibilities:
  - Next.js development
  - Three.js integration
  - Admin panel build
  - Deployment

**Role: 3D Modeler** (You)

- Responsibilities:
  - Create 10 cabinet GLB files
  - Animate assembly steps
  - Export optimized models
  - Generate arrows

**Role: Translator** (Contractor)

- Responsibilities:
  - Translate UI to Arabic
  - Translate step descriptions
  - Review RTL layout
  - Estimate: 20 hours

**Role: Voice Actor / TTS** (Contractor or Service)

- Responsibilities:
  - Record English narration (~80 steps)
  - Record Arabic narration (~80 steps)
  - Estimate: 10 hours or $50 TTS credits

**Role: Beta Testers** (10 volunteers)

- Responsibilities:
  - Test assembly with real cabinets
  - Provide feedback
  - Validate QR code experience

---

## 12. MVP Budget Estimate

| Item                            | Cost      | Notes                                     |
| ------------------------------- | --------- | ----------------------------------------- |
| **Hosting (Hostinger Premium)** | $48/year  | Already owned                             |
| **Domain Name**                 | $15/year  | If new domain needed                      |
| **Cloudflare CDN**              | $0        | Free tier                                 |
| **Arabic Translator**           | $150      | Create woodworking terms JSON + UI review |
| **Voice Narration**             | $200      | TTS or voice actor                        |
| **QR Code Stickers (1000)**     | $100      | Temporary before packaging                |
| **Beta Testing Incentives**     | $200      | 10 testers × $20 gift cards               |
| **Contingency (20%)**           | $143      | Unexpected costs                          |
| **Total MVP Budget**            | **~$856** | Excluding developer time                  |

**Developer Time:** 16 weeks × 40 hours = 640 hours (if outsourced: ~$32K @ $50/hr)

---

## 13. MVP Go/No-Go Criteria

### Go-Live Checklist (All Must Be TRUE)

- [ ] All 10 cabinets have GLB models loaded
- [ ] All 81 steps have descriptions (English + Arabic)
- [ ] Audio narration for all steps (English minimum)
- [ ] QR codes tested and working on 3+ devices
- [ ] Page load <3 seconds on 4G mobile (tested)
- [ ] 3D viewer renders at >30fps on iPhone 11
- [ ] RTL layout works correctly for Arabic
- [ ] Admin panel can create/edit cabinets
- [ ] No critical bugs (app-breaking issues)
- [ ] 10 beta testers completed full assembly successfully
- [ ] Cloudflare CDN configured and caching
- [ ] SSL certificate active
- [ ] Analytics tracking functional
- [ ] Admin trained on CMS usage

### No-Go Scenarios (Delay Launch If)

- QR scan success rate <80%
- Page load time >5 seconds
- Critical bug affecting >10% of users
- Arabic layout severely broken
- Audio not working on iOS
- Hosting setup incomplete

---

## 14. MVP Learning Objectives

The MVP is designed to validate:

1. **User Acceptance:** Do customers prefer 3D guides over paper?
2. **Technical Feasibility:** Does 3D work smoothly on mobile?
3. **Content Pipeline:** Can we efficiently create 58 cabinets' worth of content?
4. **QR Code UX:** Is scanning the best entry point?
5. **Language Approach:** Is English + Arabic sufficient initially?
6. **Admin Efficiency:** Can non-technical admin manage content?
7. **Performance:** Can we meet <3s load time with 3D?
8. **Business Impact:** Does this reduce support calls?

### Key Questions to Answer Post-MVP

- Which cabinets are accessed most frequently?
- Where do users get stuck (drop-off rates per step)?
- What's the average assembly time with vs. without guide?
- Do users prefer audio or text instructions?
- Is Arabic translation quality adequate?
- Do users want offline mode (requested in feedback)?

---

## 15. MVP Definition of Done

### Feature Complete When

- ✅ User can scan QR code and access cabinet
- ✅ User can view 3D assembly step-by-step
- ✅ User can rotate/zoom model
- ✅ User can play audio narration
- ✅ User can switch to Arabic language
- ✅ Admin can add new cabinets via admin panel
- ✅ QR codes generated and downloadable
- ✅ Works on iOS 12+ and Android 8+
- ✅ Hosted on production domain with SSL
- ✅ Performs at target metrics (<3s load, 30fps)

### Launch Ready When

- ✅ All 10 MVP cabinets are complete
- ✅ Beta testing completed with positive feedback
- ✅ No critical or high-priority bugs
- ✅ Admin documentation created
- ✅ QR codes printed or ready to print
- ✅ Monitoring and analytics in place
- ✅ Stakeholder sign-off obtained

---

## 16. Appendix

### A. MVP Cabinet Models Detail

**BC-001: 2-Door Base Cabinet 36":**

- Steps: 8
- Assembly time: 25 minutes
- Components: Carcass, 2 doors, hinges, shelf
- Complexity: Medium (standard hinge attachment)

**BC-015: Drawer Base 24":**

- Steps: 12
- Assembly time: 35 minutes
- Components: Carcass, 3 drawer boxes, slides, fronts
- Complexity: High (drawer slide installation)

**WC-001: 2-Door Wall 30":**

- Steps: 6
- Assembly time: 15 minutes
- Components: Carcass, 2 doors, hinges
- Complexity: Low (simplest wall cabinet)

**WC-008: Glass Door Wall 36":**

- Steps: 10
- Assembly time: 30 minutes
- Components: Carcass, glass doors, special hinges, clips
- Complexity: Medium (glass handling)

**HC-001: Tall Wall 42":**

- Steps: 7
- Assembly time: 20 minutes
- Components: Carcass, 2 doors, hinges, shelves
- Complexity: Low (similar to WC-001 but taller)

**TC-001: Pantry Cabinet 24":**

- Steps: 15
- Assembly time: 45 minutes
- Components: Carcass, 4 doors, multiple shelves, hinges
- Complexity: High (full-height assembly)

**CB-001: Corner Base 36":**

- Steps: 9
- Assembly time: 35 minutes
- Components: L-shaped carcass, door, lazy susan hardware
- Complexity: High (corner angle alignment)

**CW-001: Corner Wall 30":**

- Steps: 8
- Assembly time: 25 minutes
- Components: L-shaped carcass, 2 doors, hinges
- Complexity: Medium (corner assembly)

**FL-001: Base Filler 3":**

- Steps: 3
- Assembly time: 5 minutes
- Components: Filler strip, brackets
- Complexity: Very Low (simplest assembly)

**FL-003: Wall Filler 6":**

- Steps: 3
- Assembly time: 5 minutes
- Components: Filler strip, brackets
- Complexity: Very Low

---

### B. Technology Decision Log

#### **Decision 1: Pages Router vs. App Router**

- **Choice:** Pages Router
- **Reason:** Simpler for MVP, better i18n support with next-i18next
- **Reconsider for V2:** App Router when more stable

#### **Decision 2: Vanilla Three.js vs. React Three Fiber**

- **Choice:** Vanilla Three.js
- **Reason:** Less abstraction, easier debugging, smaller bundle
- **Reconsider for V2:** R3F for cleaner component structure

#### **Decision 3: Database vs. JSON Files**

- **Choice:** JSON files
- **Reason:** No server needed, easy to version control, simpler deploy
- **Reconsider for V2:** Database when scaling to 58 cabinets

#### **Decision 4: Custom Admin vs. Payload CMS**

- **Choice:** Custom admin with Next.js API routes
- **Reason:** Full control, no extra dependencies, faster for MVP
- **Reconsider for V2:** Payload CMS for better admin UX

**Decision 5: PWA in MVP or V2?**

- **Choice:** Defer to V2
- **Reason:** Service worker complexity, not critical for QR-code-first UX
- **Reconsider:** Based on user feedback requesting offline

---

### C. MVP vs. Full Product Comparison

| Feature                | MVP (V1.0)       | Full Product (V2.0+)     |
| ---------------------- | ---------------- | ------------------------ |
| **Cabinets**           | 10               | 58                       |
| **Languages**          | English + Arabic | +Spanish, French, German |
| **Offline Mode**       | ❌ No            | ✅ Yes (PWA)             |
| **Reusable Sequences** | ❌ No            | ✅ Yes                   |
| **Admin Panel**        | Basic CRUD       | Full CMS (Payload)       |
| **Analytics**          | Basic tracking   | Advanced dashboard       |
| **Compression**        | Manual Draco     | Automated pipeline       |
| **Category Browse**    | ❌ No            | ✅ Yes                   |
| **Video Tutorials**    | ❌ No            | ✅ Optional              |
| **AR Mode**            | ❌ No            | ✅ V3.0                  |
| **Accessibility**      | Basic            | WCAG 2.1 AA              |
| **2D Fallback**        | ❌ No            | ✅ For old browsers      |

---

### D. MVP Risk Matrix

| Risk                  | Probability | Impact | Severity    | Mitigation Priority |
| --------------------- | ----------- | ------ | ----------- | ------------------- |
| 3D modeling delays    | Medium      | High   | 🔴 Critical | High                |
| Mobile performance    | Medium      | High   | 🔴 Critical | High                |
| Translation quality   | Low         | Medium | 🟡 Medium   | Medium              |
| QR printing delays    | Low         | Low    | 🟢 Low      | Low                 |
| Audio production      | Medium      | Medium | 🟡 Medium   | Medium              |
| Browser compatibility | Low         | Medium | 🟡 Medium   | Medium              |
| Hosting bandwidth     | Low         | High   | 🟡 Medium   | Low                 |

---

## 17. Approval & Sign-Off

| Role           | Name | Signature | Date | Status     |
| -------------- | ---- | --------- | ---- | ---------- |
| Product Owner  |      |           |      | ⏳ Pending |
| Technical Lead |      |           |      | ⏳ Pending |
| Stakeholder    |      |           |      | ⏳ Pending |

---

**Document Version:** 1.1  
**Last Updated:** January 14, 2026  
**Next Review:** February 13, 2026 (4 weeks into development)  
**Latest Milestone:** Phase 2 Completed - 3D Viewer Core Fully Functional

---

## 18. Next Steps

1. **Immediate Actions:**

   - [ ] Review and approve this MVP document
   - [ ] Set up development environment (Week 1)
   - [ ] Start 3D modeling first 2 cabinets (Week 1)
   - [ ] Hire Arabic translator and voice talent

2. **Week 1 Kickoff:**

   - [ ] Initialize Next.js project
   - [ ] Create GitHub repository
   - [ ] Set up project tracking (GitHub Issues/Projects)
   - [ ] Schedule weekly progress reviews

3. **Stakeholder Communication:**
   - [ ] Share PRD and MVP with stakeholders
   - [ ] Schedule kickoff meeting
   - [ ] Set up weekly demo schedule
   - [ ] Define feedback channels

Let's build this! 🚀
