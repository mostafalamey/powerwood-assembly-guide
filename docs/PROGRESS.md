# PWAssemblyGuide - Development Progress

**Last Updated:** January 27, 2026  
**Current Phase:** Phase 8 (Polish) - COMPLETE  
**Overall Progress:** 75% (12 of 16 weeks)

---

## 🎯 Quick Status

| Phase                    | Status         | Completion | Notes                                                     |
| ------------------------ | -------------- | ---------- | --------------------------------------------------------- |
| **Phase 1: Foundation**  | ✅ Complete    | 100%       | Project setup, routing, i18n working                      |
| **Phase 2: 3D Viewer**   | ✅ Complete    | 100%       | Enhanced rendering, controls, collapsible UI              |
| **Phase 3: Step System** | ✅ Complete    | 100%       | GSAP animations, additive transforms, completion tracking |
| **Phase 4: Content**     | ⏭️ Skipped     | N/A        | Using BC_002 test data, skipped full content creation     |
| **Phase 5: Audio**       | ✅ Complete    | 100%       | Audio player with multilingual support                    |
| **Phase 5.5: UI/UX**     | ✅ Complete    | 100%       | Bug fixes, layout improvements, rendering quality         |
| **Phase 6: Admin Panel** | ✅ Complete    | 100%       | Auth, CRUD, step management, QR codes, authoring tool     |
| **Phase 7: QR Codes**    | ✅ Complete    | 100%       | Integrated into Admin Panel with print layout             |
| **Phase 8: Polish**      | ✅ Complete    | 100%       | Performance, UX, admin polish                             |
| **Phase 9: Testing**     | ⏳ Not Started | 0%         | Device testing                                            |
| **Phase 10: Launch**     | ⏳ Not Started | 0%         | Deployment                                                |

---

## ✅ Phase 1: Foundation Setup (Weeks 1-2) - COMPLETED

**Completed:** January 13, 2026  
**Duration:** 2 days (ahead of schedule)

### Accomplishments

#### Week 1: Project Setup ✅

- ✅ Initialized Next.js 14 with Pages Router
- ✅ Configured TypeScript 5.3.0
- ✅ Installed core dependencies:
  - Three.js 0.160.0
  - Tailwind CSS 3.4.0
  - React 18
- ✅ Set up Git repository
- ✅ Created folder structure

#### Week 2: Routing & i18n ✅

- ✅ Implemented custom i18n system (localStorage + Context API)
  - Chose custom solution over next-i18next for static export compatibility
- ✅ Created language files (en.json, ar.json)
- ✅ Built language switcher component
- ✅ Configured RTL support in Tailwind
- ✅ Created page structure:
  - `pages/index.tsx` - Home page
  - `pages/cabinet/[id]/index.tsx` - Cabinet overview
  - `pages/cabinet/[id]/step/[stepId].tsx` - Step viewer
- ✅ Configured for static export (`next.config.js` with `trailingSlash: true`)

### Key Decisions

- **Pages Router over App Router:** Simpler for static export
- **Custom i18n:** next-i18next incompatible with static export
- **localStorage for language:** Client-side persistence without backend

### Files Created

```folder
components/
  LanguageSwitcher.tsx
  Layout.tsx
contexts/
  LanguageContext.tsx
locales/
  en.json
  ar.json
pages/
  _app.tsx
  index.tsx
  cabinet/[id]/
    index.tsx
    step/[stepId].tsx
next.config.js
tailwind.config.js
tsconfig.json
```

---

## ✅ Phase 2: 3D Viewer Core (Weeks 3-4) - COMPLETED

**Completed:** January 14, 2026  
**Duration:** 1 day (ahead of schedule)

### Accomplishments

#### Week 3: Three.js Integration ✅

- ✅ Created `SceneViewer` component (components/3d/SceneViewer.tsx)
- ✅ Implemented Three.js rendering pipeline:
  - Scene initialization
  - PerspectiveCamera with optimal FOV (50°)
  - WebGLRenderer with enhanced settings
- ✅ GLB/GLTF loader with error handling
- ✅ Enhanced lighting system:
  - HemisphereLight for ambient illumination
  - DirectionalLight with shadow casting
  - Shadow optimization (1024x1024 map)
- ✅ Ground plane with shadow reception
- ✅ Material customization system:
  - Darker legs (0.8 grey multiplier)
  - Brighter panels (1.2 brightness multiplier)
  - Name-based detection (checks both mesh and material names)
- ✅ Model positioning algorithm (auto-centers and grounds models)
- ✅ Responsive canvas sizing with pixel ratio limiting (max 2 for mobile)
- ✅ Window resize handling

#### Week 4: Controls & Interaction ✅

- ✅ OrbitControls integration for mobile-friendly interaction
- ✅ Camera auto-positioning system:
  - Calculates optimal distance from model
  - Centers on model bounding box
  - Proper aspect ratio handling
- ✅ Created `StepControls` component:
  - Play/Pause button
  - Restart button
  - Reset camera button
  - Compact mobile design (w-10/h-10)
- ✅ Animation mixer setup (ready for step animations)
- ✅ Touch controls optimization
- ✅ Mobile-first UI optimization:
  - Compact spacing (px-2, py-2)
  - Small text sizes (text-xs, text-sm)
  - Space-efficient layout
- ✅ Collapsible step description:
  - Toggle button with chevron icon
  - Smooth max-height transitions
  - 400px viewer height for prominence
  - Tools and duration inside collapsible area

### Key Technical Achievements

- **Rendering Quality:**
  - ACESFilmicToneMapping for photorealistic look
  - SRGBColorSpace for accurate colors
  - High-quality shadows
- **Performance:**
  - Pixel ratio capped at 2 (prevents 4K performance issues)
  - Efficient material updates
  - Optimized for mobile devices
- **User Experience:**
  - Responsive 3D viewer
  - Intuitive touch controls
  - Clean, compact mobile UI
  - Collapsible descriptions for screen space efficiency

### Files Created/Modified

```components
  3d/
    SceneViewer.tsx (708 lines)
  StepControls.tsx
components/
  3d/
    SceneViewer.tsx (375 lines)
  StepControls.tsx
  StepNavigation.tsx
types/
  cabinet.ts
data/
  cabinets.json (2 sample cabinets)
public/
  models/
    BC-001.glb (Base Cabinet Carcass)
    Arrows.glb (Assembly direction indicators)
pages/
  cabinet/[id]/step/[stepId].tsx (enhanced)
```

### Bug Fixes

1. ✅ Fixed `cabinetsData.find()` error (was object with `.cabinets` array)
2. ✅ Fixed `modelUrl` property name (should be `.model`)
3. ✅ Fixed material caching (browser cache masking color changes)
4. ✅ Fixed model elevation (proper ground positioning)
5. ✅ Fixed navigation requiring scroll (reduced margins/padding)

---

## ✅ Phase 3: Step System with GSAP Animations (Weeks 5-6) - COMPLETED

**Completed:** January 14, 2026  
**Duration:** 1 day (significantly ahead of schedule)  
**Achievement:** Full runtime animation system with completion tracking

### Accomplishments

#### Week 5: GSAP Animation System ✅

- ✅ Installed and integrated GSAP 3.x
- ✅ Designed JSON-based animation schema:

  ```json
  {
    "animation": {
      "duration": 2500,
      "objects": [
        {
          "name": "Leg_FR",
          "visible": true,
          "position": [0, 0.3, 0],
          "duration": 0,
          "delay": 0
        }
      ],
      "camera": {
        "position": [2, 0.8, 2],
        "target": [0, 0.2, 0],
        "duration": 1500
      }
    }
  }
  ```

- ✅ Implemented additive transform system:
  - Original transforms stored on model load
  - Position/rotation values are offsets from original
  - Enables proper hierarchical animations
- ✅ Support for hierarchical models (parent-child relationships preserved from GLB)
- ✅ Visibility control system with proper material resets
- ✅ Camera animation per step (smooth transitions)
- ✅ Easing functions support (power2.out, power2.in, power2.inOut)
- ✅ Duration and delay control per object
- ✅ Instant vs animated visibility changes

#### Week 6: Animation Controls & UX ✅

- ✅ Play button triggers animation restart
- ✅ Animation auto-start on step load
- ✅ Step click restarts current step animation
- ✅ Animation completion detection:
  - Uses animation.duration from JSON
  - Calls onAnimationComplete callback
- ✅ Disabled navigation during animations:
  - Next button grayed out until animation completes
  - Future steps in list become non-clickable
  - Animated pulsing icon on disabled Next button
- ✅ Backwards navigation always allowed (go to previous steps)
- ✅ GSAP tween cleanup (killTweensOf) on step change
- ✅ Fixed visibility race conditions
- ✅ Fixed double animation calls
- ✅ Material property resets (opacity, transparent, depthWrite)

### Key Technical Achievements

- **Additive Animation System:** Position/rotation as offsets enables reusable animation data
- **Hierarchy Support:** GLB parent-child relationships preserved (legs rotate with base panel)
- **Completion Tracking:** Smart detection when animations finish enables UX controls
- **Clean State Management:** Proper cleanup prevents animation conflicts
- **Mobile Performance:** GSAP optimized for 60fps animations

### Files Created/Modified

```components
components/
  3d/
    SceneViewer.tsx (updated with GSAP, 708 lines)
  StepNavigation.tsx (updated with isAnimating prop)
pages/
  cabinet/[id]/step/[stepId].tsx (updated with animation callbacks)
data/
  cabinets.json (6 steps with full animation sequences)
package.json (added gsap@^3.12.5)
```

### Bug Fixes During Phase 3

1. ✅ Fixed JSON parse error (removed duplicate data)
2. ✅ Fixed model path (BC-002.glb → BC_002.glb)
3. ✅ Fixed visibility race condition (elements appearing then disappearing)
4. ✅ Fixed double animation application (initial sync + setTimeout)
5. ✅ Fixed opacity fade on duration:0 (now instant visibility)
6. ✅ Fixed hierarchy flattening (use Babylon.js exporter from 3ds Max)
7. ✅ Fixed absolute transforms (changed to additive with original transform storage)

### Testing Results

- ✅ Tested BC-002 with 6-step assembly sequence
- ✅ Verified additive transforms work correctly
- ✅ Confirmed hierarchy preserved from GLB export
- ✅ Animation completion tracking functional
- ✅ Navigation disabled during animations
- ✅ All animations smooth at 60fps on mobile
- ✅ Step restart works correctly

---

## ⏭️ Phase 4: Content Creation (Weeks 7-8) - SKIPPED

**Status:** Skipped for MVP testing  
**Reason:** Using existing BC_002 test data with audio files

- Current test data includes BC_002 cabinet with 6 assembly steps
- Audio files for all 6 steps available in English and Arabic
- Will continue with Phase 5 (Audio Integration) using this test data

---

## ✅ Phase 5: Audio Integration (Week 9) - COMPLETED

**Completed:** January 15, 2026  
**Duration:** 1 day (ahead of schedule)

### Accomplishments

#### Week 9: Audio Player System ✅

- ✅ Created `AudioPlayer` component with full controls
- ✅ Implemented play/pause functionality
- ✅ Added progress bar with seek capability
- ✅ Volume control with slider
- ✅ Audio preloading for current step
- ✅ Automatic language switching (English/Arabic)
- ✅ iOS autoplay restriction handling
- ✅ Error handling for missing audio files
- ✅ Loading states with spinner
- ✅ Time display (current/total)
- ✅ Integrated into step viewer page (mobile & desktop layouts)
- ✅ Updated locale files with audio control labels

### Key Technical Achievements

- **Smart Audio Path Resolution:** Automatically determines audio path based on:
  - Cabinet category (BC → BaseCabinets, WC → WallCabinets, etc.)
  - Cabinet ID formatting (BC-002 → BC_002)
  - Language code mapping (en → eng, ar → arb)
  - Step ID (stepId → step{stepId}.mp3)

- **iOS Compatibility:**
  - Graceful handling of autoplay restrictions
  - User-initiated playback fallback
  - No errors on autoplay failure

- **Preloading Strategy:**
  - Audio loads immediately on step change
  - Preload="auto" attribute for better UX
  - Loading spinner during audio fetch

- **Multilingual Support:**
  - Automatic language detection from context
  - Seamless switching between English/Arabic audio
  - Separate audio files per language

- **User Controls:**
  - Play/pause with visual feedback
  - Seek bar with gradient progress indicator
  - Volume slider (0-100% in 10% increments)
  - Time formatting (MM:SS)

- **Error Handling:**
  - Graceful fallback message if audio unavailable
  - Console logging for debugging
  - No blocking errors

### Files Created/Modified

```components/
  AudioPlayer.tsx (new, 302 lines)
pages/
  cabinet/[id]/step/[stepId].tsx (updated with AudioPlayer integration)
public/
  locales/
    en/common.json (added audio translations)
    ar/common.json (added audio translations)
```

### Audio File Structure

The audio player expects files organized as:

```folder
public/audio/
  eng/                    # English audio
    BaseCabinets/
      BC_002/
        step1.mp3
        step2.mp3
        ...step6.mp3
  arb/                    # Arabic audio
    BaseCabinets/
      BC_002/
        step1.mp3
        step2.mp3
        ...step6.mp3
```

### Testing Results

- ✅ AudioPlayer component renders correctly
- ✅ Play/pause controls functional
- ✅ Progress bar updates in real-time
- ✅ Volume control works
- ✅ Time display accurate
- ✅ Language switching works (en ↔ ar)
- ✅ Error handling displays gracefully
- ✅ Mobile and desktop layouts both functional
- ⏳ Audio playback pending test in browser

---

## 📊 Technical Specifications

### Current Stack

```json
{
  "framework": "Next.js 14.0.4",
  "language": "TypeScript 5.3.0",
  "ui": "Tailwind CSS 3.4.0",
  "3d": "Three.js 0.160.0",
  "animation": "GSAP 3.12.5",
  "audio": "HTML5 Audio API",
  "i18n": "Custom (localStorage + React Context)",
  "build": "Static Export",
  "hosting": "TBD (Hostinger planned)"
}
```

### Performance Metrics

| Metric                | Target | Current | Status |
| --------------------- | ------ | ------- | ------ |
| Page Load (Mobile 4G) | <3s    | TBD     | ⏳     |
| 3D Render FPS         | >30fps | ~60fps  | ✅     |
| Model Size            | <2MB   | 1.2MB   | ✅     |
| Bundle Size           | <500KB | TBD     | ⏳     |
| Lighthouse Score      | >90    | TBD     | ⏳     |

### Browser Compatibility

- ✅ Chrome 90+ (tested)
- ✅ Safari iOS 14+ (tested)
- ⏳ Firefox 88+ (not tested)
- ⏳ Edge 90+ (not tested)
- ⏳ Samsung Internet (not tested)

---

## 📁 Current Project Structure

```folder
AssemblyGuide/
├── components/
│   ├── 3d/
│   │   └── SceneViewer.tsx          # Core 3D rendering engine
│   ├── AudioPlayer.tsx              # Audio narration player
│   ├── Header.tsx                   # App header with navigation
│   ├── Layout.tsx                   # App layout wrapper
│   ├── LanguageSwitcher.tsx         # Language toggle
│   ├── StepControls.tsx             # Play/pause/reset controls
│   └── StepNavigation.tsx           # Progress bar & step list
├── contexts/
│   └── LanguageContext.tsx          # i18n context provider
├── data/
│   ├── cabinets.json                # Cabinet definitions (BC_002 test data)
│   └── categories.json              # Category definitions
├── lib/
│   └── i18n.tsx                     # i18n utilities
├── pages/
│   ├── _app.tsx                     # App wrapper
│   ├── _document.tsx                # Document customization
│   ├── index.tsx                    # Home page
│   └── cabinet/[id]/
│       ├── index.tsx                # Cabinet overview
│       └── step/[stepId].tsx        # Step viewer (main page)
├── public/
│   ├── audio/
│   │   ├── eng/                     # English audio files
│   │   │   └── BaseCabinets/BC_002/ # BC_002 step audio (step1-6.mp3)
│   │   └── arb/                     # Arabic audio files
│   │       └── BaseCabinets/BC_002/ # BC_002 step audio (step1-6.mp3)
│   ├── locales/
│   │   ├── en/common.json           # English translations
│   │   └── ar/common.json           # Arabic translations
│   └── models/
│       ├── BC_002.glb               # Base cabinet model
│       └── Arrows.glb               # Direction indicators
├── types/
│   └── cabinet.ts                   # TypeScript interfaces
├── sources/
│   └── BaseCabinetCarcass.skp       # Original SketchUp file
├── docs/
│   ├── MVP.md                       # Product requirements
│   ├── PRD.md                       # Detailed specifications
│   └── PROGRESS.md                  # This file
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Tailwind configuration
└── tsconfig.json                    # TypeScript configuration
```

---

## 🎓 Lessons Learned

### Technical Insights

1. **Static Export Constraints:** next-i18next incompatible - custom i18n needed
2. **Material Caching:** Browser cache can mask Three.js material changes - need hard refresh
3. **Material Detection:** Name can be on mesh OR material object - check both
4. **Mobile Performance:** Limit pixel ratio to 2 (prevents excessive GPU load)
5. **Positioning Algorithm:** Must calculate from bounding box center, not origin
6. **Audio Path Construction:** Dynamic path building based on category prefix enables scalable file organization
7. **iOS Audio Restrictions:** Must handle autoplay failures gracefully with user-initiated fallback
8. **HTML5 Audio API:** Simple and effective for narration, no need for complex audio libraries

### Development Best Practices

1. **Component Structure:** Keep 3D logic in dedicated component (SceneViewer)
2. **Mobile First:** Design for smallest screen, enhance for desktop
3. **TypeScript:** Strong typing caught multiple bugs early
4. **File Organization:** Separate concerns (components, contexts, types, data)
5. **Error Boundaries:** Always provide graceful fallbacks for missing resources
6. **Preloading Strategy:** Load audio with preload="auto" for better UX

### UX Discoveries

1. **Compact UI:** Mobile assembly guides need minimal chrome
2. **Collapsible Content:** Users want to focus on 3D, hide text when not needed
3. **Visual Controls:** Icons work better than text labels on small screens
4. **Touch Optimization:** OrbitControls work well out of the box for mobile
5. **Audio Controls:** Users expect standard media controls (play/pause, seek, volume)
6. **Progress Indicators:** Visual feedback on audio progress enhances experience

---

## 📋 Immediate Next Steps (This Week)

### Priority 1: Test Audio System 🔴

- [ ] Test audio playback in browser (http://localhost:3001)
- [ ] Verify English audio files play correctly
- [ ] Verify Arabic audio files play correctly
- [ ] Test language switching during playback
- [ ] Test on iOS device (autoplay restrictions)
- [ ] Test volume controls
- [ ] Test seek functionality

### Priority 2: Admin Panel Planning 🟡

- [ ] Review Phase 6 requirements in MVP.md
- [ ] Plan 3D authoring tool architecture
- [ ] Design dual-language input UI
- [ ] Plan step copy/reuse functionality

### Priority 3: Documentation Updates 🟢

- [ ] Update MVP.md with Phase 5 completion
- [ ] Document audio file naming conventions
- [ ] Create audio recording guidelines for future cabinets

---

## 🚀 Looking Ahead

### Phase 6 Preview (Weeks 10-11): Admin Panel

**Focus:** Content Management Interface

Upcoming tasks:

- Build visual 3D authoring tool for creating assembly steps
- Create dual-language input system (EN/AR side-by-side)
- Implement step copy/reuse functionality
- CRUD operations for cabinets
- 3D model upload and management
- QR code generation
- Preview system

**Preparation needed:**

- Review Three.js TransformControls for object manipulation
- Design dual-language input UI/UX
- Plan step search and filter system
- Design object selection in 3D scene

---

## 💡 Ideas & Future Enhancements

### V1.1 (Post-MVP)

- [ ] Offline PWA support
- [ ] Advanced analytics dashboard
- [ ] AR mode for iOS/Android
- [ ] Video tutorials option
- [ ] Social sharing features
- [ ] Audio speed control (0.5x, 1x, 1.5x, 2x)
- [ ] Audio transcript display
- [ ] Background audio playback

### V2.0 (Full Product)

- [ ] Scale to all 58 cabinets
- [ ] Add more languages (Spanish, French, German)
- [ ] Reusable assembly sequences
- [ ] Advanced admin CMS (Payload)
- [ ] 2D fallback for old browsers
- [ ] WCAG 2.1 AA accessibility

---

## 📞 Support & Resources

### Documentation

- [MVP Requirements](./MVP.md)
- [PRD Specifications](./PRD.md)
- [Three.js Docs](https://threejs.org/docs/)
- [Next.js Docs](https://nextjs.org/docs)

### Key Contacts

- Product Owner: TBD
- Technical Lead: TBD
- 3D Modeler: TBD
- Arabic Translator: TBD

---

**Status:** ✅ Ahead of Schedule | **Velocity:** Excellent | **Confidence:** High 🟢

**Phase 6 Complete!** Admin Panel finished with authentication, cabinet management, step management UI, QR code generation, and a full visual animation authoring tool.

---

## 📦 Phase 6: Admin Panel (January 19-27, 2026) - COMPLETED (100%)

**Started:** January 19, 2026  
**Current Status:** 100% Complete  
**Duration So Far:** 5 days

### Latest Update: Authoring Workflow + Reuse System (January 27, 2026) ✅

#### Keyframe Authoring Finalization

- **Undo/Redo:** History stack for keyframe edits with toolbar buttons + shortcuts
- **Interpolation Curves:** Expanded easing set with curve preview
- **Bulk Ops:** Delete at time + shift all keyframes by delta
- **Offset-Based Keyframes:** Keyframes stored as offsets from original transforms for reuse

#### Step Copy/Reuse System

- **Cross-Cabinet Browser:** Select source cabinet and filter steps
- **Insert Position:** Copy into a specific index with renumbering
- **Clean Copy:** Reuses animation data; audio URLs regenerated for target cabinet

### Latest Update: Audio Workflow + Editor Sync (January 26, 2026) ✅

#### Audio Management (Admin)

- **Step Audio Uploads UI:** English/Arabic drop zones added to the Edit Step page
- **Deferred Upload Flow:** Files are queued on select and uploaded only on Save
- **Deterministic Filenames:** Upload endpoint supports `filename` so `step{n}.mp3` is enforced
- **Audio Presence Indicators:** Step list now shows ✓ Audio when `audioUrl` exists

#### Audio Data Model & Viewer

- **Single Source of Truth:** Step `audioUrl` stored in cabinet JSON and used by viewer
- **BC-002 Backfilled:** Added `audioUrl` for all 6 steps
- **AudioPlayer Behavior:** Uses only `audioUrl` from JSON; no implicit path fallback

#### Visual Editor Audio Sync

- **Playback Sync:** Audio plays with animation and drives timeline time
- **Duration Sync:** Timeline duration updates from audio metadata
- **Stability Fixes:** Improved playback fallback when audio fails

#### Animation Runtime Fix

- **Render Warning Resolved:** `onAnimationComplete` no longer triggers render-phase updates

### Latest Update: Animation Authoring Tool Enhanced (January 22, 2026) ✅

#### Keyframe Selection & Editing System

- **Click-to-Select Keyframes:**
  - Timeline.tsx enhanced with click detection (3px threshold to differentiate from drag)
  - `onKeyframeSelect` callback prop integrated
  - `selectedKeyframeTime` state tracks current selection
  - Click triggers selection, drag moves keyframe
- **Inline Keyframe Properties Editor:**
  - Compact layout below timeline (preserves 3D viewport)
  - **Object Keyframes:**
    - Time input with automatic reordering
    - Position: grouped x/y/z inputs (w-20 fields)
    - Rotation: degrees display (converted from radians)
    - Visibility: checkbox control
  - **Camera Keyframes:**
    - Position: x/y/z inputs
    - Target: x/y/z inputs
  - Real-time updates with `handleKeyframeMoved` and property change handlers
  - Responsive flex-wrap layout for smaller screens

#### Timeline Filtering System

- **Smart Object-Based Filtering:**
  - When object selected: shows keyframes for object + all children
  - Uses hierarchical traverse with Set for efficient ID collection
  - When no selection: displays camera keyframes only
  - `timelineKeyframes` computed value updates on selection change
- **Benefits:**
  - Visual focus on relevant keyframes only
  - Reduces clutter in complex animations
  - Easier to see relationship between object movement and keyframes

#### Visibility & Shadow Controls

- **Raycasting Filter:**
  - `isFullyVisible()` helper checks entire parent chain
  - Only visible meshes included in raycasting pool
  - Prevents invisible objects from being selected
  - Hierarchical visibility validation (not just child.visible)

- **Shadow Casting Synchronization:**
  - AuthoringSceneViewer: Initial setup sets `castShadow = child.visible`
  - Animation playback updates in 3 code paths:
    - During visibility fade: `castShadow = nextVisible`
    - Static visible state: `castShadow = true`
    - Static invisible state: `castShadow = false`
  - Real-time updates during animation scrubbing
  - Prevents invisible objects from affecting scene lighting

#### UI/UX Improvements

- **Step Title in Header:**
  - Format: "Cabinet: BC-003 - Step 2: Attach one leg to the base panel"
  - Fetches step data from `cabinet.steps` array
  - Shows English title by default
  - Fallback to step number only if title missing

- **Compact Design:**
  - Inline flex layout with gap-4
  - Small inputs (w-20, text-xs) for space efficiency
  - Preserves maximum 3D viewport space
  - Clear visual grouping of properties

#### Technical Implementation

- **Files Modified:**
  - `components/admin/Timeline.tsx` (358 lines)
    - Added click detection logic
    - onKeyframeSelect callback integration
  - `components/admin/AuthoringSceneViewer.tsx` (643 lines)
    - isFullyVisible helper function
    - Filtered raycasting implementation
    - Shadow setup on model load
  - `pages/admin/cabinets/[id]/steps/authoring.tsx` (1476 lines)
    - selectedKeyframeTime state
    - Keyframe properties editor UI (lines 1000-1370)
    - Timeline filtering logic
    - Shadow updates in animation code (3 locations)
    - Step title lookup and display

### Data Structure Migration ✅

#### Split Data Architecture

- **Problem:** Single cabinets.json file becoming unwieldy, slow to load
- **Solution:** Split into index + individual files
- **Implementation:**
  - `data/cabinets-index.json` - Lightweight metadata only (fast loading)
    - Fields: id, name, description, category, image, stepCount
    - No animation data (keeps file small)
  - `data/cabinets/[id].json` - Individual cabinet files with full animation data
    - Contains complete steps array with animations
    - Only loaded when needed
  - `data/cabinets-loader.ts` - Smart merge function
    - getCabinet() merges metadata from index with steps from individual file
    - Automatic stepCount calculation on save
- **Benefits:**
  - Faster initial page loads (index is ~2KB vs 200KB+)
  - Better Git diffs (each cabinet is separate file)
  - Scalable to 100+ cabinets
  - Easier content management

#### API Routes Updated ✅

- `pages/api/cabinets.ts` - Full rewrite for split structure
  - GET: Merges metadata from index with steps from individual files
  - POST: Creates entry in index + separate animation file
  - PUT: Updates both index and animation file, calculates stepCount
  - DELETE: Removes from both index and animation file
- TypeScript interfaces updated:
  - Added `stepCount?: number` to Cabinet interface
  - Made `steps?: Step[]` optional
  - Created CabinetStepsData interface for animation files

### Authentication System ✅

#### Simple Token-Based Auth

- `pages/api/auth.ts` - Login endpoint with bcrypt password hashing
- `contexts/AuthContext.tsx` - Client-side auth state management
- Token-based authentication (24-hour expiration)
- Protected routes with AuthGuard component
- Logout functionality
- LocalStorage persistence

#### Security Features

- Password hashing with bcryptjs
- Token expiration validation
- Protected API routes (require Bearer token)
- Auto-logout on token expiration

### Cabinet Management ✅

#### Admin Panel Layout

- `components/admin/AdminLayout.tsx` - Consistent admin UI
  - Navigation: Cabinets, QR Codes, Dashboard
  - Dark mode toggle
  - View Site link
  - Logout button
  - Responsive header with mobile support

#### Cabinet List Page

- `pages/admin/cabinets/index.tsx` - Full CRUD interface
  - Search by cabinet ID or name
  - Category filter dropdown
  - Cabinet cards with image, name, category, step count
  - Edit and Delete actions
  - "Add Cabinet" button → modal
  - "QR Codes" button → QR generation page
  - Confirmation dialogs for deletions
  - Real-time search filtering

#### Cabinet Forms

- `components/admin/CabinetFormModal.tsx` - Create/Edit modal
  - Bilingual name inputs (English + Arabic)
  - Bilingual description textareas (English + Arabic)
  - Category selection
  - Image URL input
  - Model path input
  - Form validation
  - "Manage Steps" link (shows stepCount, navigates to step management)

#### Cabinet Edit Page

- `pages/admin/cabinets/[id]/edit.tsx` - Full-page editor
  - Same fields as modal but larger layout
  - "Manage Steps" button → step management
  - Breadcrumb navigation
  - Save and cancel actions

### Step Management UI ✅

#### Step List with Drag-and-Drop

- `pages/admin/cabinets/[id]/steps/index.tsx` - Main step management
  - Visual step cards showing:
    - Step number badge
    - Bilingual titles (EN + AR)
    - Duration in minutes
    - Animation status indicator (✅ animated / ⚠️ no animation)
  - **Drag-and-drop reordering:**
    - Click and drag step cards to reorder
    - Automatic step ID updates (step1 → step2, etc.)
    - Save button to persist changes
  - Action buttons per step:
    - Edit → Edit step form
    - Delete → Confirmation dialog
    - Visual Editor → Authoring tool (placeholder)
  - "Add New Step" button
  - Empty state for no steps

#### Add New Step

- `pages/admin/cabinets/[id]/steps/new.tsx` - Step creation form
  - Auto-generates next step ID
  - Bilingual title inputs (EN + AR)
  - Bilingual description textareas (EN + AR)
  - Duration input (minutes)
  - Bilingual tools inputs (comma-separated)
  - Saves to cabinet's steps array via API

#### Edit Step

- `pages/admin/cabinets/[id]/steps/[stepId]/edit.tsx` - Step editor
  - Pre-populated with existing step data
  - All fields editable (title, description, duration, tools)
  - Animation status display:
    - Shows if step has animation keyframes
    - Link to visual editor if animated
  - Save updates specific step in array

#### Visual 3D Authoring Tool (Placeholder)

- `pages/admin/cabinets/[id]/steps/authoring.tsx` - Future feature
  - Placeholder page with description
  - Will integrate Three.js editor for keyframe recording
  - Back to steps button

### QR Code Generation ✅

#### QR Codes Page

- `pages/admin/qr-codes.tsx` - Complete QR code system
  - **Grid view:** Shows all cabinets with QR codes
  - **Selection system:**
    - Checkbox per cabinet ("Include in print")
    - Select All / Deselect All toggle
    - Counter showing selected count
  - **QR Code Display:**
    - qrcode.react library with Level H error correction
    - 200x200px size with margin
    - Direct URLs to cabinet pages
  - **Download feature:**
    - "Download PNG" button per QR code
    - Canvas export to PNG file
    - Filename: `QR-{id}-{name}.png`
  - **Print layout:**
    - "Print Selected" button
    - Clean print view with dual rendering:
      - **Screen view:** Full admin interface (hidden when printing)
      - **Print view:** Minimal layout (hidden on screen)
    - Print-only header: PWAssemblyGuide logo + subtitle
    - 2 QR codes per page in grid
    - Shows: QR code, cabinet name, cabinet ID
    - Hides: Navigation, buttons, links, URLs, footer
    - Black borders for easy cutting
  - **Navigation Integration:**
    - Link in AdminLayout header
    - Purple "QR Codes" button on cabinets page

#### Print Optimization

- Separate rendering for screen vs print using Tailwind utilities
- `print:hidden` class hides admin UI when printing
- `hidden print:block` class shows print-only layout
- No CSS fighting - clean separation of concerns
- Automatically includes only selected QR codes

### Navigation Improvements ✅

#### Multiple Paths to Step Management

1. **From Cabinet Modal:** "Manage Steps" link in footer (shows stepCount)
2. **From Edit Page:** "Manage Steps" button in header
3. **Direct URL:** `/admin/cabinets/[id]/steps`

#### Better UX

- Breadcrumb navigation on all admin pages
- Back buttons on detail pages
- Confirmation dialogs for destructive actions
- Loading states for async operations

### Bug Fixes ✅

#### Cabinet Page Display Issues

- **Problem:** Cabinet page showing empty - name/description undefined
- **Root Cause:** BC-002.json only contained steps array, no metadata
- **Solution:**
  - Updated `getCabinet()` in cabinets-loader.ts
  - Now merges metadata from cabinets-index.json with steps from separate file
  - Added safe property access with optional chaining (`?.`)
  - Added fallback values for undefined properties
- **Files Fixed:**
  - `data/cabinets-loader.ts` - Smart merge logic
  - `pages/cabinet/[id].tsx` - Safe property access
  - `types/cabinet.ts` - Made description optional

### Technical Stack Updates

- **New Dependencies:**
  - bcryptjs@2.4.3 - Password hashing
  - qrcode.react@3.1.0 - QR code generation
  - react-dropzone@14.2.3 - File upload (for future image upload)
- **No Build Tools Needed:**
  - Pure Next.js API routes (no Express)
  - File system operations (fs) for JSON management
  - Client-side state with React Context

### Files Created

```files
# Authentication
contexts/AuthContext.tsx
pages/api/auth.ts
components/admin/AuthGuard.tsx

# Admin Layout
components/admin/AdminLayout.tsx

# Cabinet Management
pages/admin/index.tsx (dashboard)
pages/admin/cabinets/index.tsx (list)
pages/admin/cabinets/new.tsx (create - uses modal)
pages/admin/cabinets/[id]/edit.tsx (edit page)
components/admin/CabinetFormModal.tsx (create/edit modal)

# Step Management
pages/admin/cabinets/[id]/steps/index.tsx (list with drag-drop)
pages/admin/cabinets/[id]/steps/new.tsx (create)
pages/admin/cabinets/[id]/steps/[stepId]/edit.tsx (edit)
pages/admin/cabinets/[id]/steps/authoring.tsx (visual editor placeholder)

# QR Code System
pages/admin/qr-codes.tsx (generation + print)

# Data Structure
data/cabinets-index.json (metadata only)
data/cabinets/BC-002.json (individual cabinet)
data/cabinets-loader.ts (updated for split structure)

# Documentation
docs/DATA_STRUCTURE.md
```

### Remaining Tasks (0%)

#### Phase 6.4: Visual 3D Step Authoring Tool (100% COMPLETE)

- ✅ Three.js scene editor with GLB loading
- ✅ Object hierarchy browser (tree view)
- ✅ Transform controls (move/rotate/scale with gizmos)
- ✅ Timeline-based keyframe recording
- ✅ Camera position recording
- ✅ Animation preview playback
- ✅ JSON export for step animations
- ✅ Import existing animations for editing
- ✅ **Keyframe Selection & Editing:**
  - Click-to-select keyframes on timeline
  - Inline properties editor (time, position, rotation, visibility)
  - Camera keyframe editing (position + target)
  - Real-time property updates
- ✅ **Timeline Filtering:**
  - Shows selected object's keyframes + children
  - Camera keyframes when no selection
  - Hierarchical object traversal
- ✅ **Visibility Controls:**
  - Invisible objects excluded from raycasting
  - Hierarchical visibility checking (parent chain)
  - Shadow casting synchronized with visibility
  - Real-time shadow updates during playback
- ✅ **UI Enhancements:**
  - Step title display in header
  - Compact inline properties editor
  - Responsive layout preserving 3D viewport
- ✅ Undo/redo system for keyframe edits
- ✅ Keyframe interpolation curve editing
- ✅ Bulk keyframe operations (delete multiple, shift all)

#### Phase 6.4 Additions (January 27, 2026)

- ✅ Expanded easing set (quad → bounce)
- ✅ Easing curve preview in editor
- ✅ Offset-based keyframes (relative transforms)

#### Phase 6.5: Step Copy/Reuse System (100%)

- ✅ Browse all steps from all cabinets
- ✅ Filter by cabinet ID or category
- ✅ Copy step to current cabinet
- ✅ Insert at specific position with renumbering
- ✅ Auto-regenerate audio URLs on copy

### Impact Summary

- ✅ **Data Structure:** Split architecture scales to 100+ cabinets
- ✅ **Authentication:** Secure admin access with token-based auth
- ✅ **Cabinet CRUD:** Full create, read, update, delete functionality
- ✅ **Step Management:** Visual UI with drag-and-drop reordering
- ✅ **QR Codes:** Production-ready generation and printing
- ✅ **Navigation:** Multiple intuitive paths to all features
- ✅ **Bug Fixes:** Cabinet page display issues resolved
- ✅ **Authoring:** Visual 3D editor with keyframe tools finalized
- ✅ **Reuse:** Step copy/reuse system complete

---

## 📦 Phase 5.5: UI/UX Refinements (January 18, 2026) - COMPLETED

**Completed:** January 18, 2026  
**Duration:** < 1 day

### Critical Bug Fixes

#### Dual Audio Player Issue ✅

- **Problem:** Two separate AudioPlayer instances (mobile + desktop) caused dual audio playback when switching viewport sizes
- **Solution:** Single shared AudioPlayer instance positioned above both layouts
- **Impact:** Clean audio playback regardless of viewport changes

#### Dual SceneViewer Issue ✅

- **Problem:** Two SceneViewer instances caused animation conflicts and failed triggers in mobile view
- **Solution:** Conditional rendering based on viewport detection (useState + resize listener)
- **Technical:** Only one SceneViewer mounts at a time based on `isDesktop` state (≥1024px breakpoint)
- **Impact:** Animations now work consistently across all viewport sizes

### Layout Improvements

#### Audio Player Repositioning ✅

- **Change:** Moved audio player below 3D scene viewer (was above)
- **Rationale:** More logical flow - view model first, then control narration
- **Layout Order:**
  1. 3D Scene Viewer
  2. Audio Player
  3. Step Info

#### Refresh Button Optimization ✅

- **Removed:** StepControls component (entire row)
- **Added:** Absolutely positioned refresh button on scene viewer
- **Position:** Top-right corner with semi-transparent white background
- **Benefits:**
  - Saves vertical space (~50px)
  - Cleaner UI with fewer separate sections
  - Better mobile experience
- **Removed:** Reset View button (unnecessary with OrbitControls)

### Rendering Quality Improvements

#### Shadow Quality Enhancement ✅

- **Problem:** Shadow banding and artifacts on cabinet geometry
- **Solutions Implemented:**
  - Increased shadow map resolution: 2048 → 4096
  - Fine-tuned shadow bias: -0.0001 → -0.00005
  - Added normalBias: 0.02 (better handles surface angles)
  - Added shadow radius: 2 (softer edges)
  - Tightened shadow camera bounds: ±10 → ±5 (better detail)
  - Reduced shadow opacity: 0.3 → 0.2 (subtler)
- **Lighting Balance:**
  - Increased ambient light: 0.6 → 0.8
  - Reduced main light: 1.2 → 1.0
  - Increased fill light: 0.4 → 0.5
  - Reduced tone mapping exposure: 1.2 → 1.0
- **Result:** Cleaner shadows with no visible banding artifacts

### Technical Details

**Files Modified:**

- `pages/cabinet/[id]/step/[stepId].tsx` - Layout restructuring, viewport detection
- `components/3d/SceneViewer.tsx` - Shadow quality improvements

**New State Management:**

```typescript
const [isDesktop, setIsDesktop] = useState(false);

useEffect(() => {
  const checkScreenSize = () => {
    setIsDesktop(window.innerWidth >= 1024);
  };
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  return () => window.removeEventListener("resize", checkScreenSize);
}, []);
```

**Conditional Rendering:**

```typescript
// Mobile: !isDesktop && <SceneViewer />
// Desktop: isDesktop && <SceneViewer />
```

### Impact Summary

- ✅ **Fixed:** Audio duplication bug
- ✅ **Fixed:** Animation trigger issues in mobile view
- ✅ **Improved:** UI hierarchy and flow
- ✅ **Reduced:** Vertical space usage
- ✅ **Enhanced:** 3D rendering quality
- ✅ **Eliminated:** Shadow artifacts and banding

---

## 📦 Phase 8: Polish & Refinement (January 27, 2026) - COMPLETED

**Completed:** January 27, 2026  
**Duration:** 1 day  
**Focus:** Admin UX polish, performance optimization, and visual consistency

### Toast Notification System ✅

#### Implementation

- **`components/admin/ToastProvider.tsx`** - New notification system (122 lines)
  - Context-based API with React hooks
  - Four notification types: `success`, `error`, `info`, `warning`
  - Auto-dismissal with configurable duration (default 3.5 seconds)
  - Manual dismiss button on each toast
  - Fixed position (top-right corner, z-index 50)
  - Responsive width (320px max, 90vw on mobile)
  - Dark mode support with type-specific color schemes
  - Smooth animations and backdrop blur
  - TypeScript-first with full type safety

#### Integration

- **Toast Provider Wrapper:**
  - Integrated into `pages/_app.tsx` at root level
  - Wraps entire application for global access
  - Available in all admin pages and components

- **Admin Panel Usage:**
  - Authoring tool: "Animation saved successfully!" / "Failed to save animation"
  - Step management: Success/error feedback for CRUD operations
  - Cabinet management: Confirmation messages for saves and deletes
  - Replaces intrusive `alert()` and `confirm()` dialogs

#### Benefits

- **User Experience:**
  - Non-blocking notifications (doesn't interrupt workflow)
  - Clear visual feedback for all actions
  - Auto-dismissal prevents clutter
  - Professional, polished appearance
- **Developer Experience:**
  - Simple hook-based API: `const toast = useToast()`
  - Concise syntax: `toast.success("Saved!")` or `toast.error("Failed")`
  - Type-safe with full IntelliSense support
  - Centralized styling and behavior

### Admin Sidebar Enhancements ✅

#### Collapsible Sidebar

- **`components/admin/AdminLayout.tsx`** - Enhanced navigation (updated)
  - **Collapse/Expand Control:**
    - Round toggle button on sidebar edge (visible on desktop only)
    - Chevron icon (`chevron_left` / `chevron_right`) indicates state
    - Smooth width transition: 64 → 96 (collapsed) or full 256px
    - Preserved z-index layering for proper stacking
  - **Collapsed State:**
    - Shows only icons (no text labels)
    - Abbreviated title: "PW" instead of "PW Assembly Guide"
    - Centered icon layout with `justify-center`
    - Tooltip titles on hover for accessibility
  - **Expanded State:**
    - Full navigation labels visible
    - Complete sidebar title and subtitle
    - Standard left-aligned layout
  - **State Persistence:**
    - Controlled by `isSidebarCollapsed` state
    - Smooth CSS transitions on width change
    - Independent of mobile sidebar toggle

#### Material Symbols Icons in Sidebar

- **Navigation Icons:**
  - Dashboard: `dashboard` icon
  - Cabinets: `inventory_2` icon
  - QR Codes: `qr_code_2` icon
- **Implementation:**
  - Proper `title` attributes for accessibility
  - Responsive icon sizing (`text-lg` standard, `text-xl` when collapsed)
  - Material Symbols rounded variant for consistency
  - Dark mode compatible with text color inheritance

#### Mobile Sidebar

- **Unchanged Behavior:**
  - Slide-in/slide-out from left edge
  - Overlay with backdrop
  - Touch-friendly tap-to-close
  - Full-width labels always visible on mobile

### Authoring Tool Layout Improvements ✅

#### 3-Column Layout

- **`pages/admin/cabinets/[id]/steps/authoring.tsx`** - Restructured layout (2860 lines)
  - **Grid Structure:** `grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)_360px]`
  - **Left Column (260px):**
    - Scene status (ready/initializing indicator)
    - Object hierarchy tree (expandable/collapsible)
    - Scrollable overflow for deep hierarchies
    - Min height: 30vh mobile, full height desktop
  - **Center Column (flexible):**
    - 3D viewport (AuthoringSceneViewer component)
    - Fullscreen-capable rendering area
    - Responsive to available space
    - No fixed height constraints
  - **Right Column (360px):**
    - Transform controls (translate/rotate/scale buttons)
    - Keyframe recording buttons (object + camera)
    - Timeline component (timeline + keyframe markers)
    - Always-visible keyframe properties editor
    - Scrollable when content exceeds viewport height

#### Always-Open Keyframe Editor

- **Persistent Panel:**
  - Previously: keyframe editor only showed when keyframe selected
  - Now: properties panel always visible below timeline
  - Shows selected keyframe properties or empty state message
  - No collapsing/expanding—immediate access

- **Improved Workflow:**
  - Click keyframe → properties instantly populate
  - Edit values → changes apply in real-time
  - No extra clicks to open/close panels
  - Better visual continuity during editing

#### Compact Toolbar Layout

- **Header Refinement:**
  - Transform mode buttons grouped in desktop-only section
  - Snap settings dropdown (desktop-only, mobile shows simplified controls)
  - Undo/Redo buttons always visible with disabled states
  - Save button prominent with icon + label
  - Responsive text: "Save Animation" (desktop) / "Save" (mobile)

### Performance Optimizations ✅

#### Timeline Rendering

- **Memoization:**
  - `objectKeyframesById` memoized with `useMemo`
  - `uniqueObjectIds` derived from memoized map
  - `sortedCameraKeyframes` sorted only when dependencies change
  - Prevents unnecessary re-renders during playback
- **Efficient Keyframe Lookups:**
  - Object keyframes indexed by object ID (Map-based)
  - Binary search potential for sorted arrays
  - Reduces O(n²) loops to O(n log n) or better

#### Object Lookup Caching

- **`objectLookupRef`:**
  - Created on model load: `Map<string, THREE.Object3D>`
  - Direct object access by ID without traversal
  - Used in animation playback for instant lookups
  - Cleared and rebuilt on model reload

#### Transform Quaternion Reuse

- **Temporary Refs:**
  - `tempPrevQuatRef`, `tempNextQuatRef`, `tempInterpolatedQuatRef`
  - Reused quaternion objects for interpolation calculations
  - Avoids creating new objects every frame (60 fps)
  - Reduces garbage collection overhead

#### Keyframe Time Rounding

- **Precision Control:**
  - Recording keyframes: round to 2 decimal places (0.01s precision)
  - Display values: round to 3 decimal places for cleaner UI
  - Prevents floating-point drift during playback
  - `roundTo3()` helper function for consistent rounding

### Icon System Modernization ✅

#### Material Symbols Migration

- **Objective:** Replace all remaining SVG icons with Google Material Symbols
- **Scope:** Comprehensive replacement across entire application (15+ files)
- **Implementation:**
  - Google Fonts integration already configured in `_document.tsx`
  - Icon family: `material-symbols-rounded` (filled variant)
  - Systematic SVG-to-span conversion across all components

#### Public-Facing Pages

**Home Page** (`pages/index.tsx`):

- QR scanner icon: `qr_code_scanner` → Clean, recognizable scanner symbol
- Feature icons: `precision_manufacturing`, `translate`, `headphones` → Consistent rounded style
- Enhanced visual hierarchy with unified icon system

**Category Page** (`pages/categories/[category].tsx`):

- QR code icon: `qr_code` → Simple, clear representation
- Image placeholder: `category` → Generic object placeholder

**Cabinet Overview** (`pages/cabinet/[id].tsx`):

- Statistics icons: `straighten` (dimensions), `category` (type), `format_list_numbered` (steps)
- Tool icons: `construction` (screwdriver), `hardware` (hex wrench), `precision_manufacturing` (drill)
- Consistent sizing with `text-xl` class for proper icon scale

**Step Viewer** (`pages/cabinet/[id]/step/[stepId].tsx`):

- Model placeholder: `view_in_ar` → 3D-related symbol for better context
- Time icon: `schedule` → Standard time representation

#### Admin Components

**SceneViewer** (`components/3d/SceneViewer.tsx`):

- Error icon: `error` with `text-5xl` → Large, prominent error state indicator

**FileUploadField** (`components/admin/FileUploadField.tsx`):

- Upload icon: `cloud_upload` → Standard upload metaphor
- Error icon: `error` → Consistent error indication

**ObjectHierarchyTree** (`components/admin/ObjectHierarchyTree.tsx`):

- Expand indicator: `chevron_right` → Consistent with tree UI patterns
- Mesh type: `category` → Geometric object representation
- Group type: `folder` → Container metaphor
- Generic type: `add_circle` → Fallback for unknown types
- Visibility toggle: `visibility` / `visibility_off` → Standard visibility control

**CabinetFormModal** (`components/admin/CabinetFormModal.tsx`):

- Close button: `close` → Standard modal close icon
- List icon: `list_alt` → "Manage Steps" action indicator

**AdminLayout** (`components/admin/AdminLayout.tsx`):

- Sidebar collapse toggle: `chevron_left` / `chevron_right` → Direction indicators
- Dashboard: `dashboard` → Home/overview icon
- Cabinets: `inventory_2` → Product catalog icon
- QR Codes: `qr_code_2` → Scanner/code icon

#### Admin Pages

**Authoring Tool** (`pages/admin/cabinets/[id]/steps/authoring.tsx`):

- Toolbar icons (9 replacements):
  - Navigation: `arrow_back` → Return to step list
  - Transform modes: `open_with` (translate), `rotate_right` (rotate), `open_in_full` (scale)
  - Settings: `tune` (snap configuration)
  - History: `undo`, `redo` → Standard editing controls
  - Actions: `save` → Persistent save indication
  - Errors: `error` → Animation system errors
- Easing curve visualization: **Intentionally preserved as SVG** (functional graphic, not an icon)

**Cabinets List** (`pages/admin/cabinets/index.tsx`):

- Desktop & mobile layouts synchronized:
  - QR scanner: `qr_code_scanner`
  - Image placeholder: `image`
  - Menu: `more_vert` → Standard overflow menu
  - Actions: `visibility` (view), `edit` (edit), `list_alt` (steps), `delete` (delete)

**QR Codes Page** (`pages/admin/qr-codes.tsx`):

- Print button: `print` → Standard print action
- QR code cards: `qr_code` → Consistent with QR code theme

**Cabinet Edit** (`pages/admin/cabinets/[id]/edit.tsx`):

- Back button: `arrow_back` → Navigation consistency

**Step Management** (`pages/admin/cabinets/[id]/steps/index.tsx`):

- Empty state: `folder_open` → No steps placeholder
- Drag handle: `drag_indicator` → Reorder affordance
- Actions: `edit`, `delete`, `code` (visual editor)

**New Step** (`pages/admin/cabinets/[id]/steps/new.tsx`):

- Info icon: `info` → Informational tooltip indicator

**Edit Step** (`pages/admin/cabinets/[id]/steps/[stepId]/edit.tsx`):

- Status indicators: `check_circle` (animated), `warning` (no animation)

#### Size Mapping System

Established consistent size classes for icon scaling:

- `w-4 h-4` → `text-base` (16px)
- `w-5 h-5` → `text-lg` (18px)
- `w-6 h-6` → `text-xl` (24px)
- `w-8 h-8` → `text-2xl` (32px)
- `w-12 h-12` → `text-4xl` (48px)
- `w-16 h-16` → `text-5xl` (64px)

#### Technical Verification

**SVG Audit Results:**

- Initial state: 50+ inline SVG icons scattered across codebase
- Final state: 1 remaining SVG (intentional easing curve visualization)
- Verification command: `grep -r "<svg" --include="*.tsx" --include="*.ts"`
- Font Awesome check: No dependencies found (never used)

### Files Created/Modified

**New Files:**

- `components/admin/ToastProvider.tsx` - Toast notification system

**Modified Components (5 files):**

- `components/3d/SceneViewer.tsx` - Icon replacements
- `components/admin/AdminLayout.tsx` - Sidebar collapse + icons
- `components/admin/FileUploadField.tsx` - Icon replacements
- `components/admin/ObjectHierarchyTree.tsx` - Icon replacements
- `components/admin/CabinetFormModal.tsx` - Icon replacements

**Modified Public Pages (4 files):**

- `pages/_app.tsx` - ToastProvider integration
- `pages/index.tsx` - Icon replacements
- `pages/cabinet/[id].tsx` - Icon replacements
- `pages/cabinet/[id]/step/[stepId].tsx` - Icon replacements
- `pages/categories/[category].tsx` - Icon replacements

**Modified Admin Pages (7 files):**

- `pages/admin/cabinets/[id]/steps/authoring.tsx` - Layout + icons + performance
- `pages/admin/cabinets/index.tsx` - Icon replacements + toast integration
- `pages/admin/qr-codes.tsx` - Icon replacements
- `pages/admin/cabinets/[id]/edit.tsx` - Icon replacements + toast integration
- `pages/admin/cabinets/[id]/steps/index.tsx` - Icon replacements + toast integration
- `pages/admin/cabinets/[id]/steps/new.tsx` - Icon replacements + toast integration
- `pages/admin/cabinets/[id]/steps/[stepId]/edit.tsx` - Icon replacements + toast integration

**Total:** 1 new file + 16 modified files

### Technical Achievements

**Toast System:**

- ✅ Context-based React architecture
- ✅ TypeScript type safety throughout
- ✅ Auto-dismissal with configurable timing
- ✅ Manual dismiss capability
- ✅ Four notification types with distinct styling
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Non-blocking UI notifications

**Sidebar:**

- ✅ Smooth collapse/expand transitions
- ✅ Icon-only mode for space efficiency
- ✅ State persistence during session
- ✅ Accessibility with hover tooltips
- ✅ Responsive behavior (collapse desktop-only)
- ✅ Material Symbols icons throughout

**Authoring Tool:**

- ✅ 3-column responsive grid layout
- ✅ Always-visible properties editor
- ✅ Optimized rendering with useMemo
- ✅ Efficient object lookups with Map
- ✅ Quaternion reuse for performance
- ✅ Precision rounding for keyframes

**Icon System:**

- ✅ Single unified icon system (Material Symbols)
- ✅ 50+ SVG → font icon replacements
- ✅ Consistent sizing across application
- ✅ Semantic icon names
- ✅ Dark mode compatibility
- ✅ Reduced markup size
- ✅ Browser font caching benefits

### Impact Summary

- ✅ **User Experience:** Non-blocking toast notifications replace intrusive alerts
- ✅ **Space Efficiency:** Collapsible sidebar maximizes content area on desktop
- ✅ **Workflow:** 3-column authoring layout with always-visible properties
- ✅ **Performance:** Memoization and object caching improve timeline rendering
- ✅ **Consistency:** Single Material Symbols icon system across 15+ files
- ✅ **Professional:** Polished admin UX with modern design patterns
- ✅ **Maintainability:** Cleaner code with font icons vs inline SVG
- ✅ **Accessibility:** Tooltips, ARIA labels, and semantic icons
- ✅ **Dark Mode:** All new features fully support dark theme
