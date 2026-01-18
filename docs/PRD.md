# Product Requirements Document (PRD)

## Kitchen Cabinet Assembly Guide Web Application

**Project Name:** PWAssemblyGuide  
**Version:** 1.0  
**Date:** January 13, 2026  
**Document Owner:** Product Team  
**Status:** Draft

---

## 1. Executive Summary

PWAssemblyGuide is a mobile-first, multilingual 3D web application that provides step-by-step interactive assembly instructions for 58 kitchen cabinet models. Customers scan a QR code on their cabinet box to access immersive 3D animations with voice narration in multiple languages, eliminating confusion and reducing assembly errors.

### Key Highlights

- **58 cabinet models** across 7 categories
- **Mobile-first** 3D experience with WebGL
- **QR code direct access** from product packaging
- **Multilingual support** (English, Arabic with RTL)
- **Offline PWA capability** for workshop use
- **Reusable assembly sequences** for efficient content management
- **Admin panel** with automatic 3D model optimization

---

## 2. Project Overview

### 2.1 Background

Kitchen cabinet assembly is often challenging for customers, leading to:

- Assembly errors and product damage
- Increased support calls
- Negative customer experience
- Higher return rates

Traditional paper manuals are:

- Difficult to follow with 2D diagrams
- Language-limited
- Easy to lose or damage
- Not accessible to all users

### 2.2 Solution

A web-based 3D assembly guide accessible via QR code that provides:

- Interactive 3D animations showing exact assembly steps
- Multi-angle camera views
- Voice narration in customer's language
- Step-by-step navigation with progress tracking
- Offline access after initial download

### 2.3 Target Audience

- **Primary:** DIY homeowners assembling purchased cabinets
- **Secondary:** Professional installers needing quick reference
- **Demographics:** Adults 25-65, varying technical proficiency
- **Access:** Mobile devices (smartphones/tablets) - 80%, Desktop - 20%

---

## 3. Goals and Objectives

### 3.1 Business Goals

1. **Reduce support costs** by 40% through self-service assembly guidance
2. **Decrease return rates** due to assembly errors by 60%
3. **Improve customer satisfaction** scores by 35%
4. **Enable market expansion** to Arabic-speaking regions
5. **Differentiate product** with premium digital experience

### 3.2 User Goals

1. **Complete assembly correctly** on first attempt
2. **Understand instructions** regardless of language proficiency
3. **Access guide easily** from product packaging
4. **Navigate at own pace** with pause/replay capabilities
5. **Work offline** in areas without reliable internet

### 3.3 Technical Goals

1. **Load in <3 seconds** on 4G mobile networks
2. **Support 1000+ concurrent users** with static hosting
3. **Achieve 30fps minimum** on mid-range mobile devices
4. **Cache efficiently** to minimize data usage (<5MB per cabinet)
5. **Achieve 95%+ mobile browser compatibility**

---

## 4. User Personas

### Persona 1: DIY Homeowner - Sarah

**Age:** 34 | **Location:** Urban apartment | **Device:** iPhone 13  
**Tech Proficiency:** Medium | **Language:** English

**Scenario:** Purchased base cabinet for kitchen renovation. Has assembled IKEA furniture before but nervous about expensive cabinets. Needs clear, visual instructions.

**Pain Points:**

- Paper manuals with unclear diagrams
- Afraid of making costly mistakes
- Limited space to spread out manual while working

**Goals:**

- Complete assembly without help
- Understand which parts go where
- Verify each step before proceeding

---

### Persona 2: Professional Installer - Ahmed

**Age:** 42 | **Location:** Dubai | **Device:** Samsung Galaxy tablet  
**Tech Proficiency:** High | **Language:** Arabic (primary), English (secondary)

**Scenario:** Installing 12 cabinets in client's home. Familiar with general assembly but needs quick reference for specific hardware placement unique to this brand.

**Pain Points:**

- English-only manuals slow down work
- Can't easily reference while hands are occupied
- Needs to verify specific details quickly

**Goals:**

- Fast access to specific assembly steps
- Arabic language support for efficiency
- Ability to zoom in on hardware details

---

### Persona 3: First-Time Assembler - Maria

**Age:** 28 | **Location:** Suburban home | **Device:** Android phone  
**Tech Proficiency:** Low | **Language:** English

**Scenario:** First time assembling furniture. Overwhelmed by number of parts. Needs extremely clear, step-by-step guidance with reassurance.

**Pain Points:**

- Static diagrams don't show movement/direction
- Uncertainty about whether step is completed correctly
- Technical terminology in manuals confusing

**Goals:**

- See exactly how parts should move/connect
- Hear verbal confirmation of steps
- Navigate backwards to review previous steps

---

## 5. Features and Requirements

### 5.1 Core Features (Must Have - MVP)

#### F1: QR Code Cabinet Access

**Priority:** P0 (Critical)

**Description:** Customers scan QR code on cabinet box to directly access that cabinet's assembly guide.

**Requirements:**

- F1.1: Unique QR code per cabinet SKU
- F1.2: QR code links to `/cabinet/[cabinetId]` route
- F1.3: Browser language auto-detection (fallback to English)
- F1.4: Invalid QR code shows helpful error page
- F1.5: QR code includes analytics tracking parameter

**Success Criteria:**

- 95% successful QR scan rate on first attempt
- <2 second load time from scan to landing page
- Works across iOS Camera, Android Camera apps

---

#### F2: Cabinet Overview Landing Page

**Priority:** P0 (Critical)

**Description:** After QR scan, display cabinet overview with key information before assembly starts.

**Requirements:**

- F2.1: Cabinet name and category display
- F2.2: 3D preview thumbnail (static or rotating)
- F2.3: Estimated assembly time
- F2.4: Total number of steps
- F2.5: Required tools list (if applicable)
- F2.6: "Start Assembly" CTA button
- F2.7: Language switcher (English/Arabic)
- F2.8: "Browse All Categories" link

**Success Criteria:**

- Users understand what cabinet they're assembling
- Clear call-to-action to begin
- Language preference easily changeable

---

#### F3: Interactive 3D Viewer

**Priority:** P0 (Critical)

**Description:** WebGL-based 3D viewer showing cabinet assembly animations with user controls.

**Requirements:**

- F3.1: Load and render GLB models with Three.js
- F3.2: Display current step's animation
- F3.3: Predefined camera angles per step
- F3.4: User orbit controls (rotate around model)
- F3.5: Pinch-to-zoom on mobile
- F3.6: Reset camera button
- F3.7: Play/Pause/Restart animation controls
- F3.8: Arrow GLB models show assembly direction
- F3.9: Smooth camera transitions between steps
- F3.10: Touch-friendly controls (no scroll interference)

**Success Criteria:**

- 30fps minimum on iPhone 11/Samsung S10
- Intuitive gesture controls
- Animations clearly show assembly movement
- <1 second model load per step

---

#### F4: Step Navigation System

**Priority:** P0 (Critical)

**Description:** Mobile-first interface for browsing and selecting assembly steps.

**Requirements:**

- F4.1: Vertical step list with thumbnails
- F4.2: Click/tap to navigate to specific step
- F4.3: Current step highlighted
- F4.4: Step numbering (1 of 12)
- F4.5: Progress bar showing completion
- F4.6: Previous/Next step buttons
- F4.7: Step description text
- F4.8: Swipe gesture support (mobile)
- F4.9: Keyboard navigation (desktop)
- F4.10: Auto-scroll step list to current step

**Success Criteria:**

- Easy to jump between steps
- Clear visual indication of progress
- Accessible on small screens (320px width)

---

#### F5: Audio Narration

**Priority:** P0 (Critical)

**Description:** Voice narration for each step in user's selected language.

**Requirements:**

- F5.1: Manual play button per step (no autoplay)
- F5.2: Audio file preloading for current step
- F5.3: Play/pause audio controls
- F5.4: Visual indicator when audio is playing
- F5.5: Separate audio files per language
- F5.6: Audio sync with step text
- F5.7: Background audio continues during 3D interaction
- F5.8: Volume control

**Success Criteria:**

- Clear, professional narration
- Works reliably on iOS/Android browsers
- <500ms latency from play button to audio start
- Handles network interruptions gracefully

---

#### F6: Multilingual Support

**Priority:** P0 (Critical)

**Description:** Full application support for English and Arabic with RTL layout.

**Requirements:**

- F6.1: Language switcher component (accessible on all pages)
- F6.2: RTL layout for Arabic (`dir="rtl"`)
- F6.3: Mirrored UI components in Arabic (step list, controls)
- F6.4: Translated step descriptions
- F6.5: Translated UI labels and buttons
- F6.6: Language preference persists in localStorage
- F6.7: Separate audio files per language
- F6.8: Language-specific fonts (support Arabic script)

**Success Criteria:**

- Complete Arabic translation with proper RTL layout
- No UI breaking in RTL mode
- Language switching without page reload
- Native-feeling experience in both languages

---

#### F7: Category Browse System

**Priority:** P1 (High)

**Description:** Home page allowing users to browse cabinets by category without QR code.

**Requirements:**

- F7.1: 7 category tiles (Base, Wall, High, Tall, Corner Base, Corner Wall, Fillers)
- F7.2: Cabinet count per category
- F7.3: Click category to view cabinets in that category
- F7.4: Cabinet grid with images and names
- F7.5: Search/filter functionality
- F7.6: Responsive grid layout

**Success Criteria:**

- Users can find any cabinet within 3 clicks
- Clear visual hierarchy
- Fast category navigation

---

#### F8: Progressive Web App (PWA)

**Priority:** P1 (High)

**Description:** Offline capability for using guide without internet connection.

**Requirements:**

- F8.1: Service worker for asset caching
- F8.2: "Add to Home Screen" prompt
- F8.3: Download cabinet for offline use button
- F8.4: Offline indicator in UI
- F8.5: Cache GLB models, audio, and step data
- F8.6: Update available notification
- F8.7: Storage limit management (~5MB per cabinet)

**Success Criteria:**

- Full cabinet functionality offline after initial download
- Clear indication of offline/online status
- <30 second download time per cabinet on 4G

---

#### F9: Admin Panel - Content Management

**Priority:** P0 (Critical)

**Description:** Admin interface for managing cabinets, sequences, and media files.

**Requirements:**

- F9.1: Single admin authentication (username/password)
- F9.2: Dashboard with cabinet count and statistics
- F9.3: Cabinet CRUD operations (Create, Read, Update, Delete)
- F9.4: Upload GLB files (with automatic Draco compression)
- F9.5: Define assembly steps per cabinet
- F9.6: Upload audio files (per step, per language)
- F9.7: **3D Visual Step Authoring Tool:**
  - F9.7a: Load cabinet GLB model in interactive 3D editor
  - F9.7b: Parse and display object hierarchy (parts list)
  - F9.7c: Select individual objects via click (raycasting)
  - F9.7d: Show/hide objects with visibility toggles
  - F9.7e: Transform controls for moving/rotating objects
  - F9.7f: Record object animation sequences (keyframes)
  - F9.7g: Record camera position and movement
  - F9.7h: Playback preview of created animation
  - F9.7i: Save animation data to step JSON
  - F9.7j: Timeline scrubber for animation editing
- F9.8: **Dual-Language Input System:**
  - F9.8a: Side-by-side English/Arabic text fields for descriptions
  - F9.8b: Common woodworking terms reference (JSON-based)
  - F9.8c: Quick-insert buttons for common phrases
  - F9.8d: UI translation via static JSON files
  - F9.8e: Character count and RTL preview
- F9.9: **Copy Steps Between Cabinets:**
  - F9.9a: Search/browse all existing steps
  - F9.9b: Filter by category or keyword
  - F9.9c: Preview step animation before copying
  - F9.9d: One-click copy (animation + camera + text)
  - F9.9e: Adjust copied step for different models
  - F9.9f: Track step reuse statistics
- F9.10: Assign cabinets to categories
- F9.9: Preview 3D models before publishing
- F9.10: Generate QR codes with download option

**Success Criteria:**

- Non-technical user can add new cabinet in <30 minutes
- Automatic model optimization (Draco compression)
- QR codes ready for print production

---

#### F10: Reusable Assembly Sequences

**Priority:** P1 (High)

**Description:** Template system for sharing common assembly patterns across cabinets.

**Requirements:**

- F10.1: Create sequence templates (e.g., "Hinge Attachment")
- F10.2: Define template steps, models, animations
- F10.3: Assign templates to multiple cabinets
- F10.4: Override template steps for specific cabinets
- F10.5: Visual indicator showing which cabinets use a sequence
- F10.6: Update template propagates to all using cabinets
- F10.7: Admin warning before deleting used template

**Success Criteria:**

- 50%+ step reuse across 58 cabinets
- Update once, apply to many
- No broken references after edits

---

#### F11: Analytics and Tracking

**Priority:** P1 (High)

**Description:** Track usage patterns to identify popular cabinets and potential issues.

**Requirements:**

- F11.1: Track QR code scans per cabinet
- F11.2: Track step completion rates
- F11.3: Track average time per step
- F11.4: Track language preference distribution
- F11.5: Track most accessed cabinets
- F11.6: Track error rates (404s, failed loads)
- F11.7: Admin dashboard with key metrics
- F11.8: Export analytics data (CSV)

**Success Criteria:**

- Identify cabinets with assembly difficulties
- Track feature usage patterns
- Privacy-compliant (no PII collection)

---

### 5.2 Non-Functional Requirements

#### NFR1: Performance

- **NFR1.1:** Initial page load <3 seconds on 4G (Mobile)
- **NFR1.2:** 3D rendering at 30fps minimum on mid-range devices
- **NFR1.3:** Step transition <500ms
- **NFR1.4:** GLB models <200KB each (compressed)
- **NFR1.5:** Audio files <500KB per step
- **NFR1.6:** Total app JS bundle <800KB (gzipped)

#### NFR2: Scalability

- **NFR2.1:** Support 1000+ concurrent users
- **NFR2.2:** Handle 58 cabinets with 15 average steps each (870 total steps)
- **NFR2.3:** CDN caching for 99% of requests
- **NFR2.4:** Static hosting compatible (no server-side runtime)

#### NFR3: Compatibility

- **NFR3.1:** iOS 12+ (Safari, Chrome)
- **NFR3.2:** Android 8+ (Chrome, Samsung Internet)
- **NFR3.3:** Desktop browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **NFR3.4:** WebGL 2.0 support required
- **NFR3.5:** Graceful degradation for older browsers (show 2D fallback)

#### NFR4: Accessibility

- **NFR4.1:** WCAG 2.1 AA compliance
- **NFR4.2:** Keyboard navigation support
- **NFR4.3:** Screen reader compatible (for non-3D content)
- **NFR4.4:** Minimum touch target size: 44x44px
- **NFR4.5:** Color contrast ratio >4.5:1

#### NFR5: Security

- **NFR5.1:** HTTPS only
- **NFR5.2:** Admin panel authentication (bcrypt password hashing)
- **NFR5.3:** CORS policy for asset loading
- **NFR5.4:** No sensitive data in client-side code
- **NFR5.5:** Rate limiting on API endpoints

#### NFR6: Maintainability

- **NFR6.1:** Modular component architecture
- **NFR6.2:** Code documentation and comments
- **NFR6.3:** Version control with Git
- **NFR6.4:** Automated build pipeline
- **NFR6.5:** Error logging and monitoring

---

## 6. User Stories

### Epic 1: First-Time Assembly Experience

**US1.1:** As a customer, I want to scan the QR code on my cabinet box, so that I can quickly access assembly instructions without typing URLs.

- **Acceptance Criteria:**
  - QR code scans successfully with default camera app
  - Lands on correct cabinet's overview page
  - Loads in less than 3 seconds

**US1.2:** As a customer, I want to see an overview of the assembly before starting, so that I know what to expect.

- **Acceptance Criteria:**
  - Shows cabinet name, estimated time, and step count
  - Displays required tools (if any)
  - Clear "Start Assembly" button

**US1.3:** As a non-English speaker, I want to switch to Arabic, so that I can understand instructions in my native language.

- **Acceptance Criteria:**
  - Language switcher visible on all pages
  - UI switches to RTL layout for Arabic
  - Step text and audio change to selected language

---

### Epic 2: Step-by-Step Assembly

**US2.1:** As a customer, I want to see a 3D animation of each assembly step, so that I understand exactly how parts connect.

- **Acceptance Criteria:**
  - 3D model loads and animates smoothly
  - Animation shows clear assembly movement
  - Arrows indicate direction

**US2.2:** As a customer, I want to play/pause the animation, so that I can work at my own pace.

- **Acceptance Criteria:**
  - Play/pause buttons are easily accessible
  - Animation stops/resumes at current position
  - Restart button resets to step beginning

**US2.3:** As a customer, I want to rotate the 3D model, so that I can see the assembly from different angles.

- **Acceptance Criteria:**
  - Touch drag rotates model on mobile
  - Mouse drag rotates on desktop
  - Pinch gesture zooms on mobile
  - Reset button returns to default view

**US2.4:** As a customer, I want to hear voice narration, so that I can understand instructions without reading text.

- **Acceptance Criteria:**
  - Play audio button visible per step
  - Audio plays clearly without lag
  - Can pause/resume audio
  - Audio matches step description

**US2.5:** As a customer, I want to navigate between steps easily, so that I can go back if I miss something.

- **Acceptance Criteria:**
  - Step list shows all steps with thumbnails
  - Click any step to jump to it
  - Previous/Next buttons work
  - Current step is highlighted

---

### Epic 3: Offline and Convenience

**US3.1:** As a customer working in a garage without WiFi, I want to download the cabinet guide for offline use, so that I can assemble without internet.

- **Acceptance Criteria:**
  - "Download for offline" button visible
  - All models and audio download locally
  - Works fully offline after download
  - Clear offline indicator shown

**US3.2:** As a customer, I want to add the guide to my home screen, so that I can quickly reopen it while assembling.

- **Acceptance Criteria:**
  - PWA install prompt appears (iOS/Android)
  - App icon added to home screen
  - Opens without browser chrome

---

### Epic 4: Admin Content Management

**US4.1:** As an admin, I want to log into the admin panel, so that I can manage cabinet content securely.

- **Acceptance Criteria:**
  - Login page with username/password
  - Secure authentication
  - Session persistence

**US4.2:** As an admin, I want to upload a new cabinet's 3D models, so that customers can access its assembly guide.

- **Acceptance Criteria:**
  - File upload interface for GLB files
  - Automatic Draco compression applied
  - Preview 3D model before saving
  - Progress indicator during upload

**US4.3:** As an admin, I want to define assembly steps with camera angles, so that the guide shows optimal views.

- **Acceptance Criteria:**
  - Add/edit/delete steps
  - Set camera position (X, Y, Z) per step
  - Assign GLB models to steps
  - Set animation timing

**US4.4:** As an admin, I want to upload audio narration files, so that customers hear instructions in their language.

- **Acceptance Criteria:**
  - Upload audio per step
  - Separate uploads for English/Arabic
  - Audio format validation (MP3)
  - File size limit enforced

**US4.5:** As an admin, I want to create reusable assembly sequences, so that I don't duplicate work across similar cabinets.

- **Acceptance Criteria:**
  - Create sequence template
  - Assign template to multiple cabinets
  - Edit template updates all using cabinets
  - Show usage count before deletion

**US4.6:** As an admin, I want to generate QR codes for each cabinet, so that they can be printed on packaging.

- **Acceptance Criteria:**
  - QR code generated per cabinet
  - Download as PNG/SVG
  - Includes analytics tracking
  - High resolution for printing

**US4.7:** As an admin, I want to view usage analytics, so that I can identify which cabinets are most accessed and potential issues.

- **Acceptance Criteria:**
  - Dashboard shows scan counts per cabinet
  - Step completion rates visible
  - Language preference breakdown
  - Export data to CSV

---

## 7. Technical Architecture

### 7.1 Technology Stack

| Component                | Technology                        | Justification                                                                |
| ------------------------ | --------------------------------- | ---------------------------------------------------------------------------- |
| **Frontend Framework**   | Next.js 14 (App Router)           | Static export, file-based routing, image optimization, built-in i18n support |
| **3D Rendering**         | Three.js + React Three Fiber      | Best mobile performance, excellent GLB support, large community              |
| **State Management**     | Zustand                           | Lightweight (~1KB), perfect for step/language state                          |
| **Internationalization** | next-i18next                      | RTL support, namespace organization, SSG compatible                          |
| **Admin CMS**            | Payload CMS                       | Self-hosted, file uploads, REST API, media management                        |
| **Model Compression**    | Draco (via gltf-transform)        | 50-70% size reduction for GLB files                                          |
| **UI Components**        | Tailwind CSS + Headless UI        | Mobile-first, RTL support, accessible components                             |
| **PWA**                  | next-pwa                          | Service worker generation, offline caching                                   |
| **Analytics**            | Plausible Analytics (self-hosted) | Privacy-friendly, GDPR compliant, lightweight                                |
| **Hosting**              | Hostinger + Cloudflare CDN        | Static hosting, global CDN, free SSL                                         |
| **Version Control**      | Git / GitHub                      | Code management, deployment automation                                       |

### 7.2 System Architecture

```text
┌──────────────────────────────────────────────────────┐
│                        User Device                   │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ QR Scanner │→ │ Next.js PWA  │← │ Service      │  │
│  └────────────┘  │              │  │ Worker       │  │
│                  │ React Three  │  │ (Offline)    │  │
│                  │ Fiber        │  └──────────────┘  │
│                  └──────┬───────┘                    │
└─────────────────────────┼────────────────────────────┘
                          │
                    HTTPS │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                   Cloudflare CDN                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cache: GLB Models, Audio Files, Images, JS/CSS      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                    Hostinger Premium                     │
│  ┌───────────────────────┐  ┌─────────────────────────┐  │
│  │  Static Files         │  │  Payload CMS            │  │
│  │  - HTML/JS/CSS        │  │  (Admin Panel)          │  │
│  │  - GLB Models         │  │  - Node.js Server       │  │
│  │  - Audio Files        │  │  - MongoDB / SQLite     │  │
│  │  - Cabinet Data JSON  │  │  - File Upload          │  │
│  └───────────────────────┘  └─────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 7.3 Data Models

#### Cabinet Model

```typescript
interface Cabinet {
  id: string; // Unique identifier (e.g., "CAB-001")
  sku: string; // Product SKU
  category: CabinetCategory; // Category enum
  name: {
    en: string;
    ar: string;
  };
  estimatedTime: number; // Minutes
  steps: Step[];
  qrCodeUrl: string; // Generated QR code image
  thumbnailUrl: string; // Cabinet preview image
  createdAt: Date;
  updatedAt: Date;
}

enum CabinetCategory {
  BASE = "base",
  WALL = "wall",
  HIGH = "high",
  TALL = "tall",
  CORNER_BASE = "corner_base",
  CORNER_WALL = "corner_wall",
  FILLERS = "fillers",
}
```

#### Step Model

```typescript
interface Step {
  id: string;
  stepNumber: number;
  description: {
    en: string;
    ar: string;
  };
  modelUrl: string; // Path to GLB file
  animationName?: string; // Animation clip name in GLB
  animationStartTime: number; // Seconds
  animationEndTime: number; // Seconds
  camera: CameraPosition;
  audioFiles: {
    en: string; // Path to English audio
    ar: string; // Path to Arabic audio
  };
  sequenceTemplateId?: string; // Reference to reusable sequence
}

interface CameraPosition {
  position: [number, number, number]; // [x, y, z]
  target: [number, number, number]; // Look-at point
  fov: number; // Field of view
}
```

#### Assembly Sequence Template

```typescript
interface SequenceTemplate {
  id: string;
  name: string;
  category: string; // e.g., "hardware", "drawer"
  steps: Step[];
  usedByCabinets: string[]; // Array of cabinet IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### 7.4 File Structure

```folders
AssemblyGuide/
├── app/                                # Next.js App Router
│   ├── [locale]/                       # i18n routing
│   │   ├── page.tsx                    # Home (category browse)
│   │   ├── cabinet/
│   │   │   └── [cabinetId]/
│   │   │       ├── page.tsx            # Cabinet overview
│   │   │       └── step/
│   │   │           └── [stepId]/
│   │   │               └── page.tsx    # Step view
│   │   └── categories/
│   │       └── [category]/
│   │           └── page.tsx            # Category listing
│   ├── layout.tsx                      # Root layout
│   └── not-found.tsx                   # 404 page
├── components/
│   ├── 3d/
│   │   ├── SceneViewer.tsx            # Main 3D canvas
│   │   ├── ModelLoader.tsx            # GLB loading logic
│   │   ├── CameraController.tsx       # Camera positioning
│   │   └── AnimationController.tsx    # Animation playback
│   ├── navigation/
│   │   ├── StepList.tsx               # Step navigation sidebar
│   │   ├── StepControls.tsx           # Play/pause/restart
│   │   └── ProgressBar.tsx            # Progress indicator
│   ├── audio/
│   │   └── AudioPlayer.tsx            # Audio narration
│   ├── layout/
│   │   ├── Header.tsx                 # App header
│   │   ├── LanguageSwitcher.tsx       # Language toggle
│   │   └── CategoryGrid.tsx           # Home page categories
│   └── ui/                             # Reusable UI components
├── public/
│   ├── models/
│   │   ├── parts/                     # Reusable GLB parts
│   │   ├── sequences/                 # Assembly sequences
│   │   └── cabinets/                  # Complete cabinet models
│   ├── audio/
│   │   ├── en/                        # English narration
│   │   └── ar/                        # Arabic narration
│   └── qr-codes/                      # Generated QR codes
├── data/
│   ├── cabinets.json                  # Cabinet definitions
│   ├── sequences.json                 # Reusable sequences
│   └── categories.json                # Category metadata
├── lib/
│   ├── 3d-utils.ts                    # Three.js helpers
│   ├── model-loader.ts                # GLB loading utilities
│   ├── analytics.ts                   # Tracking functions
│   └── storage.ts                     # PWA cache management
├── locales/
│   ├── en/
│   │   └── common.json
│   └── ar/
│       └── common.json
├── admin/                              # Payload CMS
│   ├── collections/
│   │   ├── Cabinets.ts
│   │   ├── Steps.ts
│   │   └── Sequences.ts
│   └── payload.config.ts
├── next.config.js
├── tailwind.config.js
└── package.json
```

### 7.5 Deployment Strategy

1. **Development Environment:**

   - Local Next.js dev server (`npm run dev`)
   - Local Payload CMS instance
   - Hot reload for rapid iteration

2. **Build Process:**

   - Run `next build` to generate static site
   - Compress GLB models with Draco via admin panel
   - Optimize images with next/image
   - Generate service worker with next-pwa

3. **Staging Deployment:**

   - Deploy to Cloudflare Pages for preview
   - Test QR codes in staging environment
   - Validate mobile performance

4. **Production Deployment:**

   - Upload static files to Hostinger via FTP/SFTP
   - Configure Cloudflare CDN in front
   - Set cache headers (GLB/audio: 1 year, HTML: 1 hour)
   - Deploy Payload CMS to separate subdomain (admin.domain.com)

5. **CI/CD Pipeline:**
   - GitHub Actions for automated builds
   - Deploy on push to main branch
   - Run Lighthouse tests for performance validation

---

## 8. Success Metrics (KPIs)

### 8.1 User Engagement Metrics

- **QR Code Scan Rate:** Target 80% of physical cabinets sold
- **Session Duration:** Average 15-30 minutes (full assembly time)
- **Step Completion Rate:** >90% users complete all steps
- **Return Visit Rate:** <10% (indicates successful first-time assembly)
- **Language Distribution:** Track English vs. Arabic usage

### 8.2 Performance Metrics

- **Page Load Time:** <3 seconds (4G mobile)
- **3D Render FPS:** >30fps on target devices
- **Offline Download Success:** >95%
- **Browser Compatibility:** >98% successful loads
- **Error Rate:** <2% of sessions

### 8.3 Business Impact Metrics

- **Support Call Reduction:** 40% decrease within 6 months
- **Return Rate Reduction:** 60% decrease due to assembly errors
- **Customer Satisfaction (CSAT):** >4.5/5 on assembly experience
- **Net Promoter Score (NPS):** >50
- **Time to Assembly:** 20% reduction vs. paper manual

### 8.4 Content Management Metrics

- **Admin Efficiency:** Add new cabinet in <30 minutes
- **Sequence Reuse Rate:** >50% of steps use templates
- **Model Optimization:** Average 65% file size reduction
- **QR Code Generation Time:** <30 seconds per cabinet

---

## 9. Timeline and Milestones

### Phase 1: Foundation (Weeks 1-2)

- [ ] Project setup (Next.js, Git, folder structure)
- [ ] Install dependencies (Three.js, i18n, Tailwind)
- [ ] Create base layout and routing structure
- [ ] Set up development environment

### Phase 2: Core 3D Viewer (Weeks 3-4)

- [ ] Implement Three.js scene setup
- [ ] Build GLB model loader
- [ ] Create camera controller with orbit controls
- [ ] Implement animation playback system
- [ ] Add play/pause/restart controls

### Phase 3: Navigation & Steps (Weeks 5-6)

- [ ] Build step list component
- [ ] Implement step navigation logic
- [ ] Create progress tracking
- [ ] Add previous/next navigation
- [ ] Design mobile-first step UI

### Phase 4: Multilingual Support (Week 7)

- [ ] Configure next-i18next
- [ ] Implement RTL layout for Arabic
- [ ] Create language switcher
- [ ] Add translation files (en/ar)
- [ ] Test RTL UI components

### Phase 5: Audio System (Week 8)

- [ ] Build audio player component
- [ ] Implement preloading logic
- [ ] Add play/pause controls
- [ ] Test on iOS/Android browsers
- [ ] Handle audio sync with steps

### Phase 6: Admin Panel (Weeks 9-11)

- [ ] Set up Payload CMS
- [ ] Create cabinet collection schema
- [ ] Build file upload with Draco compression
- [ ] Implement step editor
- [ ] Add sequence template system
- [ ] Create QR code generator
- [ ] Build analytics dashboard

### Phase 7: PWA & Offline (Week 12)

- [ ] Configure service worker
- [ ] Implement offline caching
- [ ] Add "Download for offline" feature
- [ ] Test offline functionality
- [ ] Add update notification

### Phase 8: QR Code Integration (Week 13)

- [ ] Implement dynamic routing for QR codes
- [ ] Create cabinet landing page
- [ ] Add error handling for invalid codes
- [ ] Test QR scanning flow end-to-end
- [ ] Generate QR codes for test cabinets

### Phase 9: Testing & Optimization (Weeks 14-15)

- [ ] Mobile device testing (iOS/Android)
- [ ] Performance optimization (Lighthouse)
- [ ] Cross-browser testing
- [ ] Load testing (1000+ concurrent users)
- [ ] Accessibility audit (WCAG)
- [ ] RTL layout validation

### Phase 10: Deployment & Launch (Week 16)

- [ ] Set up Hostinger hosting
- [ ] Configure Cloudflare CDN
- [ ] Deploy production build
- [ ] Set up analytics tracking
- [ ] Train admin user on CMS
- [ ] Create user documentation
- [ ] Soft launch with beta testers
- [ ] Full production launch

**Total Estimated Timeline:** 16 weeks (~4 months)

---

## 10. Risks and Mitigation

### Risk 1: Mobile WebGL Performance Issues

**Probability:** Medium | **Impact:** High

**Description:** 3D rendering may lag on older/low-end mobile devices.

**Mitigation:**

- Set minimum device requirements (iPhone 8+, Android 8+)
- Implement level-of-detail (LOD) for complex models
- Provide 2D fallback for unsupported devices
- Extensive testing on target device range
- Optimize polygon counts (<50K triangles per scene)

---

### Risk 2: Browser Compatibility Problems

**Probability:** Medium | **Impact:** Medium

**Description:** Older browsers may not support WebGL 2.0 or ES6 features.

**Mitigation:**

- Transpile code to ES5 with Babel
- Feature detection and graceful degradation
- Show 2D image sequence fallback
- Display browser update prompt for very old browsers
- Test on Safari (iOS), Chrome (Android), Samsung Internet

---

### Risk 3: Audio Autoplay Restrictions

**Probability:** High | **Impact:** Low

**Description:** Mobile browsers block autoplay to save data/battery.

**Mitigation:**

- Require manual play button (better UX anyway)
- Clear visual indicator for audio availability
- Preload audio on user interaction
- Provide text instructions as primary (audio as enhancement)

---

### Risk 4: Hosting Bandwidth Limits

**Probability:** Low | **Impact:** High

**Description:** Hostinger bandwidth exceeded with many concurrent users.

**Mitigation:**

- Use Cloudflare CDN for 90%+ cache hit rate
- Aggressive browser caching (1 year for assets)
- Monitor bandwidth usage weekly
- Plan upgrade path if traffic exceeds limits
- Compress all assets (Brotli/Gzip)

---

### Risk 5: Admin User Errors

**Probability:** Medium | **Impact:** Medium

**Description:** Admin may upload incorrect files or break sequences.

**Mitigation:**

- File validation (GLB format, file size limits)
- Preview models before publishing
- Undo/revision history in CMS
- Show usage warnings before deleting sequences
- Provide admin training and documentation

---

### Risk 6: Translation Quality Issues

**Probability:** Medium | **Impact:** Medium

**Description:** Poor Arabic translations may confuse users.

**Mitigation:**

- Hire professional translator for technical terms
- Review translations with native speaker
- User feedback mechanism for reporting errors
- A/B test translations with Arabic-speaking users
- Maintain glossary for consistent terminology

---

### Risk 7: 3D Model Pipeline Bottleneck

**Probability:** Medium | **Impact:** High

**Description:** Creating 58 cabinets' worth of 3D content is time-intensive.

**Mitigation:**

- Maximize sequence reuse (50%+ of steps)
- Use shared parts library extensively
- Create modeling templates in Blender/3DS Max
- Consider outsourcing modeling to 3D agency
- Prioritize most popular cabinets for MVP

---

### Risk 8: Offline Storage Limitations

**Probability:** Low | **Impact:** Low

**Description:** Users may run out of device storage for offline cabinets.

**Mitigation:**

- Show storage requirements before download
- Allow selective step downloads (not full cabinet)
- Implement storage cleanup for old cabinets
- Set reasonable quota (5MB per cabinet)
- Provide "Clear Cache" option in settings

---

## 11. Future Enhancements (Post-MVP)

### V2.0 Features (6-12 months)

1. **Additional Languages:** Spanish, French, German
2. **AR Mode:** Use device camera to overlay assembly guide on physical parts
3. **Video Tutorials:** Recorded live-action assembly for complex steps
4. **User-Generated Content:** Allow customers to upload tips/photos
5. **Integration with E-commerce:** Link to buy additional hardware/tools
6. **Multi-User Collaboration:** Share progress with helper/installer
7. **Voice Commands:** "Next step", "Repeat that" for hands-free operation
8. **Gamification:** Badges for completed cabinets, assembly streaks
9. **Smart Home Integration:** Alexa/Google Assistant voice guidance
10. **Advanced Analytics:** Heatmaps of where users get stuck

### V3.0 Features (12-24 months)

1. **AI Assembly Assistant:** Computer vision to verify step completion
2. **Custom Cabinet Builder:** Let customers design custom configurations
3. **VR Support:** Full immersive assembly training in VR headset
4. **B2B Portal:** For professional installers with multi-project tracking
5. **Marketplace:** Third-party add-ons, custom finishes, accessories

---

## 12. Assumptions and Dependencies

### Assumptions

1. Users have smartphones with camera (for QR codes)
2. Users have basic internet connectivity (4G minimum for initial load)
3. Admin has access to 3D modeling software (Blender/3DS Max)
4. Audio narration will be provided in quality formats
5. Hostinger hosting supports Node.js for Payload CMS
6. Users consent to analytics tracking (anonymized)

### Dependencies

1. **3D Models:** All 58 cabinet models created and ready
2. **Audio Files:** Professional narration recorded in English/Arabic
3. **Translations:** Professional Arabic translations completed
4. **QR Codes:** Physical packaging updated with printed QR codes
5. **Hosting:** Hostinger account configured and accessible
6. **Domain:** Production domain purchased and configured
7. **SSL Certificate:** HTTPS enabled (Cloudflare/Let's Encrypt)

---

## 13. Glossary

- **GLB:** Binary format of glTF (GL Transmission Format), optimized 3D model file
- **Draco:** Google's compression library for 3D meshes
- **Three.js:** JavaScript library for creating 3D graphics in the browser
- **PWA:** Progressive Web App, web app with offline and installable capabilities
- **RTL:** Right-to-Left text direction for languages like Arabic
- **WebGL:** Web Graphics Library for rendering 3D graphics in browser
- **CDN:** Content Delivery Network for fast global asset delivery
- **CMS:** Content Management System for admin content editing
- **FPS:** Frames Per Second, measure of 3D rendering performance
- **QR Code:** Quick Response code, 2D barcode scanned by phone cameras

---

## 14. Approval and Sign-off

| Role           | Name | Signature | Date |
| -------------- | ---- | --------- | ---- |
| Product Owner  |      |           |      |
| Technical Lead |      |           |      |
| UX Designer    |      |           |      |
| Stakeholder    |      |           |      |

---

**Document Version:** 1.0  
**Last Updated:** January 13, 2026  
**Next Review Date:** February 13, 2026
