# Changelog

All notable changes to the PWAssemblyGuide project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-02-13 - Project Complete 🎉

### 🎨 Added - "Neutral Papyrus" Design Language (2026-02-13)

Comprehensive visual redesign implementing the "Neutral Papyrus" design system across the entire application — both public-facing pages and admin panel.

**Design System:**

- Created [DESIGN_LANGUAGE.md](docs/DESIGN_LANGUAGE.md) — full design specification document (725 lines)
- Defined 5-color neutral palette: Papyrus (#F6F2EE), Silver (#CACBCD), Pewter (#B3B9C1), Stone (#77726E), Charcoal (#323841)
- Added semantic status colors: success, error, warning, info (muted tones)
- Defined accent color system: sky (assemblies), emerald (create actions), violet (visual editor/QR), amber (categories/time), rose (branding)
- Extended neutral shade scale (50–950) in Tailwind config
- Updated CSS custom properties in globals.css (foreground/background RGB, scrollbar colors)

**Public Pages — Full Restyle:**

- Homepage: Papyrus background, neutral header, glassmorphic QR card, neutral category grid
- Category listing: Neutral cards with silver borders, charcoal/papyrus text hierarchy
- Assembly detail: Neutral stat cards, warm step list items with hover transitions
- Step viewer: Papyrus canvas bg, neutral control buttons, neutral step sidebar
- 404 page: Neutral palette buttons and text

**Admin Panel — Full Restyle:**

- Dashboard: Charcoal welcome banner, tinted stat card icons (sky/violet/emerald/amber), neutral quick action cards
- Login page: Papyrus background, charcoal/papyrus inverted button, neutral input focus rings
- Assemblies list: Neutral glassmorphic cards, category tag pills with amber accent
- Categories list: Neutral cards with amber accent icons
- QR codes: Violet accent for QR theme, neutral selection checkboxes
- Steps management: Emerald Add button, sky Copy button, purple Visual Editor gradient, sky step number badges
- Admin sidebar: Neutral nav items, charcoal/papyrus active state inversion, tinted section icons

**Modals — Unified Style:**

- `AssemblyFormModal`: Glassmorphic with sky header icon accent
- `CategoryFormModal`: Glassmorphic with amber header icon accent
- `FileUploadField`: Neutral drag-drop zones, charcoal/papyrus upload button

**Shared Components:**

- `Header.tsx`: Papyrus background with subtle blur, neutral text colors
- `ToastProvider`: Neutral toast styling with charcoal/papyrus scheme
- `LoadingSpinner`: Neutral spinner colors
- `AdminLayout`: Neutral sidebar with tinted section icons

**Brand Assets:**

- Updated `Logo.svg`: Charcoal-to-stone gradient fill replacing blue, papyrus lettering
- Updated `favicon.svg`: Matching gradient treatment
- Updated `BrandingContext` defaults to use Neutral Papyrus tokens

**Tailwind Config Changes:**

- Added papyrus, silver, pewter, stone, charcoal as top-level colors
- Extended neutral palette (50–950) mapped to Papyrus-to-Charcoal scale
- Added semantic colors (success, error, warning, info) with light/dark/bg variants
- Remapped primary alias to neutral scale for backward compatibility

### 🔧 Added - UX Consistency Improvements (2026-02-13)

**Modal-Based Workflows:**

- Dashboard "Add New Assembly" now opens `AssemblyFormModal` instead of navigating to a dedicated page
- Step add/edit now uses new `StepFormModal` instead of navigating to separate pages
- All create/edit operations across the admin use modals for consistent UX

**New Component — StepFormModal:**

- Created `components/admin/StepFormModal.tsx` (595 lines)
- Bilingual title and description inputs (English + Arabic)
- Duration field with clock icon
- Drag-and-drop audio upload zones for English and Arabic narration
- Animation info note directing to Visual Editor
- Portal-rendered with escape key close, body scroll lock, focus management
- Styled with Neutral Papyrus palette + accent colors

**Removed Redundancy:**

- Removed QR Codes button from assemblies page header (already accessible via sidebar tab)
- Deleted `components/admin/CabinetFormModal.tsx` — legacy component with zero usage

**Files added:**

- `components/admin/StepFormModal.tsx` — Step create/edit modal
- `docs/DESIGN_LANGUAGE.md` — Neutral Papyrus design language specification

**Files deleted:**

- `components/admin/CabinetFormModal.tsx` — Unused legacy modal from old "Cabinet" system

**Files modified (20+):**

- `tailwind.config.js` — Neutral Papyrus color tokens
- `styles/globals.css` — CSS custom properties, scrollbar colors
- `public/Logo.svg` — Charcoal gradient logo
- `public/favicon.svg` — Matching gradient favicon
- `pages/index.tsx` — Homepage full restyle
- `pages/categories/[category].tsx` — Category page restyle
- `pages/assembly/[id].tsx` — Assembly detail restyle
- `pages/assembly/[id]/step/[stepId].tsx` — Step viewer restyle
- `pages/admin/login.tsx` — Login page restyle
- `pages/admin/index.tsx` — Dashboard restyle + AssemblyFormModal integration
- `pages/admin/qr-codes.tsx` — QR codes page restyle
- `pages/admin/categories/index.tsx` — Categories admin restyle
- `pages/admin/assemblies/index.tsx` — Assemblies list restyle + QR button removal
- `pages/admin/assemblies/[id]/edit.tsx` — Edit page restyle
- `pages/admin/assemblies/[id]/steps/index.tsx` — Steps page accent colors + StepFormModal wiring
- `pages/admin/assemblies/[id]/steps/new.tsx` — Restyle
- `pages/admin/assemblies/[id]/steps/authoring.tsx` — Restyle
- `components/admin/AdminLayout.tsx` — Sidebar neutral redesign
- `components/admin/ToastProvider.tsx` — Neutral toast styling
- `components/admin/CategoryFormModal.tsx` — Neutral palette
- `components/admin/LoadingSpinner.tsx` — Neutral spinner

### ✨ Added - Admin UI/UX Overhaul (2026-02-13)

Comprehensive UI/UX audit and improvement pass across all admin panel pages.

**Accessibility:**

- Added focus trap (Tab/Shift+Tab cycling) to `AssemblyFormModal` and `CategoryFormModal`
- Added ESC key to close all modals and confirm dialogs
- Added `role="dialog"`, `aria-modal="true"`, `aria-label` to all modal/dialog components
- Added `aria-live="polite"` and `role="status"` to toast notification container
- Fixed ARIA roles on light position pads in authoring tool (`role="slider"` → `role="application"`)
- Fixed toast and confirm dialog `z-index` from `z-50`/`z-[100]` to `z-[9999]` for proper stacking

**Design Consistency:**

- Unified `CategoryFormModal` to match glassmorphism design system (rounded-2xl, gradient header, backdrop-blur)
- Unified categories page with glassmorphic cards, gradient button, and consistent spacing
- Updated `FileUploadField` styling (rounded-xl, gradient upload button, smaller icon)
- Created shared `LoadingSpinner` component (`components/admin/LoadingSpinner.tsx`) with sm/md/lg sizes
- Replaced 10+ identical inline SVG spinners across admin pages with `LoadingSpinner`

**Functionality:**

- Replaced hardcoded category `<option>` elements with dynamic API-fetched categories in assembly new/edit forms
- Added XHR-based upload progress bar with gradient fill to `FileUploadField`
- Added client-side file size validation with auto-inferred limits (GLB: 50MB, audio: 5MB, image: 2MB)
- Added success state (checkmark) display after file upload completion
- Added error banner with retry button to admin dashboard instead of silent `console.error`

**Responsive & Mobile:**

- Fixed `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` in `AssemblyFormModal` for mobile form layout
- Added desktop-recommended overlay on authoring tool for mobile/tablet screens (`lg:hidden`)
- Main authoring editor content now wrapped in `hidden lg:flex` to prevent unusable mobile experience

**Security:**

- Removed default credentials hint (`admin`/`admin123`) from login page
- Replaced with neutral "Contact your administrator" message

**Dark Mode:**

- Fixed AuthGuard loading screen white flash by adding `dark:bg-gray-900` and dark border/text variants

**Terminology & Code Quality:**

- Fixed 22+ instances of outdated "cabinet" terminology → "assembly" across 6 admin pages
- Fixed 4 dead route links from `/admin/cabinets` → `/admin/assemblies`
- Fixed variable naming in QR codes page (`setCabinets` → `setAssemblies`, `fetchAssemblys` → `fetchAssemblies`, `Cabinet` interface → `Assembly`)
- Fixed "cabinet assembly guides" → "assembly guides" in QR page description

**Files added:**

- `components/admin/LoadingSpinner.tsx` - Reusable loading spinner (sm/md/lg, message, centered)

**Files modified (18):**

- `components/admin/AssemblyFormModal.tsx` - Focus trap, ESC key, ARIA, responsive grid
- `components/admin/CategoryFormModal.tsx` - Focus trap, ESC key, ARIA, glassmorphism redesign
- `components/admin/FileUploadField.tsx` - Progress bar, file size validation, design update
- `components/admin/ToastProvider.tsx` - ARIA attributes, z-index, ESC key on confirm
- `components/admin/AuthGuard.tsx` - Dark mode loading state
- `pages/admin/login.tsx` - Removed credentials, LoadingSpinner
- `pages/admin/index.tsx` - Error banner with retry
- `pages/admin/branding.tsx` - LoadingSpinner
- `pages/admin/qr-codes.tsx` - Terminology, naming, LoadingSpinner
- `pages/admin/categories/index.tsx` - Design unification, LoadingSpinner
- `pages/admin/assemblies/index.tsx` - LoadingSpinner
- `pages/admin/assemblies/new.tsx` - Dynamic categories, terminology, LoadingSpinner
- `pages/admin/assemblies/[id]/edit.tsx` - Dynamic categories, terminology, LoadingSpinner
- `pages/admin/assemblies/[id]/steps/index.tsx` - Terminology, LoadingSpinner
- `pages/admin/assemblies/[id]/steps/new.tsx` - Terminology, LoadingSpinner
- `pages/admin/assemblies/[id]/steps/[stepId]/edit.tsx` - Terminology, LoadingSpinner
- `pages/admin/assemblies/[id]/steps/authoring.tsx` - Mobile overlay, ARIA fix

### ⚡ Changed - Icon Library Migration (2026-02-06)

**Migrated from Material Symbols to Lucide React icons**

- **Performance**: Reduced initial load time by eliminating external Google Fonts CDN dependency
- **Bundle size**: Icons are now tree-shaken and only used icons are included in the bundle (~5-15KB vs ~150-200KB)
- **Offline-first**: All icons load instantly without network requests, improving PWA offline capability
- **TypeScript-native**: Better type safety and IDE autocomplete with Lucide React components
- **Consistent sizing**: All icons now use Tailwind utility classes (w-4 h-4, w-5 h-5, etc.) instead of text-\* sizing

**Files updated:**

- Removed Google Fonts CDN link from `_document.tsx`
- Updated 50+ component and page files across the app
- Common icon mappings:
  - `view_in_ar` → `Box`
  - `qr_code_scanner` → `ScanLine`
  - `error` → `AlertCircle`
  - `check_circle` → `CheckCircle`
  - `arrow_forward` / `arrow_back` → `ArrowRight` / `ArrowLeft`
  - `delete` → `Trash2`
  - `edit` → `Edit` or `Pencil`
  - And 100+ more icon replacements

**Dependencies:**

- Added: `lucide-react` (^0.x)
- Removed: Material Symbols Google Fonts dependency

### In Progress

- Device testing (Phase 9)
- Export/import animation templates (Phase 6.6)
- Re-enable authentication in animation.php endpoint

---

## [0.15.0] - 2026-02-05

### ✨ Added - Annotation System

Complete annotation system for adding visual aids (arrows, callouts, text) to assembly animations.

**Core Features:**

- **GLB-based annotations** - Load custom arrow and indicator models from `/models/annotations/`
- **Text annotations** - Canvas-based 3D text sprites with bilingual support (EN/AR)
- **Color customization** - Predefined color swatches + custom hex color picker
- **Per-step annotations** - Annotations are saved with each step's animation data
- **Full animation support** - Animate position, rotation, scale, and visibility like regular objects

**Authoring Tool:**

- **Floating toolbar** (`AnnotationToolbar.tsx`) - Grid of annotation types with thumbnails
- **Thumbnail support** - PNG previews for annotation GLBs displayed in toolbar
- **Object hierarchy integration** - Annotations section with color editing and delete buttons
- **Timeline integration** - Annotations appear in object tracks with keyframe recording

**Assembly Viewer:**

- **Annotation playback** - Annotations load and animate in the public viewer
- **Initial state fix** - Fixed issue where hidden objects/annotations showed until play button was pressed

**New Files:**

- `types/animation.ts` - Added `AnnotationInstance`, `AnnotationCatalogItem` interfaces
- `lib/annotations.ts` - Annotation loader, color utilities, text sprite creation
- `components/admin/AnnotationToolbar.tsx` - Floating UI for adding annotations
- `pages/api/annotations.ts` - API endpoint listing available annotation GLBs

**Modified Files:**

- `components/admin/AuthoringSceneViewer.tsx` - forwardRef with annotation management methods
- `components/admin/ObjectHierarchyTree.tsx` - Annotations section with color picker
- `pages/admin/cabinets/[id]/steps/authoring.tsx` - Annotation state, handlers, save/load
- `components/3d/SceneViewer.tsx` - Annotation loading for playback, initial state fix

### 🔧 Fixed

- **Initial frame rendering** - Scene now correctly applies keyframes at time=0 on page load
- **Annotation validation** - Filter out malformed annotations (missing type/id) during load
- **Duplicate loading prevention** - Removed redundant animation loading useEffect

---

## [0.14.2] - 2026-01-30

### ✨ Added - View Transitions & 404 Page

- **View Transitions API:**
  - Created `TransitionLink` component for smooth page transitions
  - Integrated View Transitions API with Next.js client-side routing
  - Added crossfade animation (0.3s) between page navigations
  - Applied to all navigation in admin sidebar (Dashboard, Cabinets, QR Codes)
  - Applied to public site: Header, StepNavigation, category cards, cabinet cards
  - Graceful fallback for unsupported browsers

- **Custom 404 Page:**
  - New visually appealing 404 error page with cabinet-themed image
  - Full-screen background image with content overlay on right side
  - "Page Not Found" title and descriptive message
  - "Go Back Home" button using app's primary color
  - Responsive layout for all screen sizes

### 🔧 Changed

- Updated `globals.css` with View Transitions API styles
- Replaced `@view-transition { navigation: auto }` with JavaScript-based transitions for SPA compatibility

---

## [0.14.1] - 2026-01-30

### 🔧 Fixed - Authoring Tool UX Improvements

- **Snap Settings Dropdown:**
  - Fixed z-index issue where snap popup menu was covered by 3D scene
  - Added `relative z-20` to toolbar for proper stacking context

- **Camera Controls:**
  - Reduced orbit and pan sensitivity (from 1.0 to 0.25) for finer control
  - Increased damping factor for smoother camera movements

- **Object Selection:**
  - Fixed issue where objects were unintentionally selected when releasing mouse after orbiting/panning
  - Added drag threshold detection (5px) to distinguish between clicks and drags
  - Camera orbit/pan no longer triggers object selection on mouse up

### ✨ Changed - Toast Notifications

- **Confirmation Dialogs:**
  - Replaced browser `confirm()` dialogs with toast-based confirmations
  - Cabinet deletion now uses danger-styled toast confirmation
  - Step deletion now uses danger-styled toast confirmation
  - Logout now uses warning-styled toast confirmation
  - Improved UX consistency across all admin actions

---

## [0.14.0] - 2026-01-29

### ✨ Added - Admin Dashboard

- **Dashboard Overview Page:**
  - New dedicated dashboard at `/admin` replacing redirect to cabinets
  - Welcome header with gradient banner and quick-add cabinet button
  - Real-time statistics cards: Total Cabinets, Total Steps, 3D Models coverage, Categories count
  - Progress bars showing model completion percentage
  - Average steps per cabinet calculation

- **Dashboard Widgets:**
  - **Cabinets by Category** - Visual breakdown with progress bars
  - **Needs Attention** - Lists cabinets missing 3D models or steps
  - **Quick Actions** - Add Cabinet, Manage Cabinets, QR Codes, View Site links
  - **Recent Cabinets** - Quick access to recently added cabinets with thumbnails

- **Enhanced Admin Layout:**
  - Modernized sidebar with glass-morphism effects and gradient active states
  - Animated collapse button with improved hover states
  - Logo section with branded icon and gradient background
  - Full-height layout with overflow handling
  - Improved navigation item styling with shadows and transitions

### 🔧 Changed

- Admin sidebar width reduced when collapsed (24px → 20px)
- Navigation items now use rounded-xl corners with gradient active states
- Production warning page redesigned with gradient header and modern card layout
- Sidebar toggle button refined with subtle shadow and hover effects

---

## [0.13.0] - 2026-01-29

### ✨ Added - UI/UX Improvements & Dark Mode Polish

- **Dark Mode Enhancements:**
  - Added dedicated `ThemeToggle` component with animated sun/moon icons
  - Theme toggle now appears on home page header alongside language switcher
  - Smooth CSS transitions for theme switching (background, text colors)
  - Custom scrollbar styling for dark mode (semi-transparent, rounded)
  - Added CSS variables for foreground/background RGB in dark mode

- **Home Page Redesign:**
  - Modern card-based UI with gradient backgrounds
  - Glass-morphism effects with backdrop blur
  - Responsive header with app icon and title
  - Improved category grid layout

- **PHP API Path Resolution:**
  - Dynamic path resolution supporting multiple deployment layouts
  - `resolvePath()` helper function checks multiple candidate paths
  - Supports both development (`/data`) and Hostinger production paths
  - More robust JSON reading with error handling for `json_decode`

- **GitHub Copilot Instructions:**
  - Added `.github/copilot-instructions.md` with comprehensive project guidelines
  - Documents tech stack, coding standards, animation system, and i18n patterns

### 🔧 Changed

- **htaccess Routing:**
  - Added optional trailing slash support to all API routes (`/?$`)
  - Asset rewrite rules simplified for static export structure

- **Component Updates:**
  - `AudioPlayer`: Improved dark mode styling
  - `Header`: Enhanced dark mode contrast
  - `LanguageSwitcher`: Dark mode button styles
  - `StepNavigation`: Dark mode panel styling with proper borders
  - `AdminLayout`: Refined sidebar transitions and dark mode colors
  - `ObjectHierarchyTree`: Dark mode tree node styling
  - `Timeline`: Dark mode track and scrubber colors
  - `ToastProvider`: Enhanced toast notifications with better dark mode support

- **Admin Pages:**
  - All admin pages updated with consistent dark mode theming
  - Improved form inputs with dark backgrounds and borders
  - Better contrast for text and interactive elements

- **Viewer Pages:**
  - Cabinet viewer with dark mode gradient backgrounds
  - Step viewer with improved dark mode panel styling
  - Category pages with dark mode card designs

### 🐛 Fixed

- Removed duplicate/backup `.gitignore` file (`- Copy.gitignore`)
- CSS `overflow-y: auto` removed from body to prevent scroll issues
- More defensive authorization header checking in PHP config

### 📝 Documentation

- Added Copilot instructions for consistent AI-assisted development

---

## [0.12.0] - 2026-01-28

### 🚀 Changed - Deployment Architecture Migration

- **Hostinger Deployment:**
  - Migrated from planned Vercel deployment to Hostinger Premium hosting
  - Reason: Vercel serverless filesystem is read-only, cannot save animation JSON files
  - Static Next.js export (`output: 'export'`) deployed to https://mlextensions.com
  - Account valid until February 13, 2028

- **PHP API Backend:**
  - Created complete PHP 8.3 API layer replacing Next.js API routes
  - 6 standalone endpoints: auth, cabinets, categories, upload, config, admin/animation
  - All endpoints independent (no shared dependencies) for maximum reliability
  - Data storage via JSON files with write access
  - Token-based authentication with bcryptjs password hashing

- **Data Flow Improvements:**
  - Fixed browser caching: Added no-cache headers to all PHP endpoints
  - Cache-busting: Timestamp query parameters on all fetch calls (`?_=${Date.now()}`)
  - Fixed data wrapper structure: PHP returns `{'cabinets': [...]}` to match JS expectations
  - Authorization header pass-through via .htaccess rewrite rules

- **Step Viewer Enhancement:**
  - Converted from build-time bundled data to runtime API fetches
  - Removed `getCabinet()` import from `cabinets-loader.ts`
  - Now fetches fresh data from PHP API on every page load
  - Ensures animations always display latest saved version

- **Authoring Tool Fix:**
  - Added useEffect to load existing animations on component mount
  - Properly initializes duration, keyframes, and offset settings from saved data
  - Fixed issue where authoring tool showed empty state despite saved animations

### 📝 Added

- **Documentation:**
  - Created comprehensive [HOSTINGER_DEPLOYMENT.md](docs/HOSTINGER_DEPLOYMENT.md) guide
  - Covers deployment architecture, PHP API endpoints, Apache configuration
  - Includes troubleshooting checklist and debugging tips
  - Documents migration timeline from Vercel to Hostinger

### 🐛 Fixed

- LiteSpeed browser cache serving stale data (7-day max-age)
- Apache not passing Authorization header to PHP scripts
- Animation authoring tool not loading existing animations
- Step viewer using outdated build-time data instead of API
- Data format mismatch (PHP array vs JavaScript object)

### ⚠️ Known Issues

- Animation endpoint has authentication temporarily disabled for debugging
- Needs re-enablement before final production deployment

---

## [0.11.0] - 2026-01-27

### ✨ Added - Phase 8: Polish & Refinement

- **Toast Notification System:**
  - Context-based toast provider with React hooks
  - Four types: success, error, info, warning
  - Auto-dismissal with configurable duration (default 3.5s)
  - Manual dismiss button, dark mode support
  - Replaces intrusive alert() dialogs across admin panel

- **Collapsible Admin Sidebar:**
  - Toggle button to collapse/expand sidebar on desktop
  - Icon-only mode (96px) vs full mode (256px)
  - LocalStorage state persistence across sessions
  - Smooth CSS transitions with proper z-index layering
  - Material Symbols icons (dashboard, inventory_2, qr_code_2)

- **Authoring Tool Layout:**
  - 3-column responsive grid: 260px | flexible | 360px
  - Always-visible keyframe properties editor
  - Compact toolbar with grouped transform controls
  - Desktop-only snap settings dropdown
  - Improved visual hierarchy and space efficiency

- **Performance Optimizations:**
  - Timeline rendering memoization (useMemo for keyframe maps)
  - Object lookup caching with Map data structure
  - Quaternion reuse for rotation interpolation (reduced GC)
  - Keyframe time rounding (2 decimals) for precision control

- **Material Symbols Icon Migration:**
  - Replaced 50+ inline SVG icons with Google Material Symbols
  - Font-based icons across all 15+ files (components + pages)
  - Consistent sizing system: text-base to text-5xl
  - Dark mode compatible, browser cacheable
  - Single remaining SVG: easing curve visualization (intentional)

- **3D Viewport Resize:**
  - Window resize event dispatch on sidebar collapse/expand
  - Three.js canvas adapts to newly available space
  - 300ms delay matches CSS transition duration

### 🔧 Technical Improvements

- Toast API: `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()`
- Sidebar state: `admin_sidebar_collapsed` in localStorage
- Authoring layout: `grid-cols-[260px_minmax(0,1fr)_360px]`
- Icon system: material-symbols-rounded font variant

### 📝 Documentation

- Updated PROGRESS.md with comprehensive Phase 8 details
- Updated IMPLEMENTATION_STATUS.md with Phase 8 summary
- Updated README.md progress badges (75% overall)

---

## [0.10.0] - 2026-01-27

### ✨ Added - Phase 6 Completion

- **Offset-Based Keyframes:** Authoring now records transforms as offsets for cross-cabinet reuse
- **Undo/Redo System:** History stack with toolbar buttons and keyboard shortcuts
- **Expanded Easing Set:** Quad → bounce, with curve preview in editor
- **Bulk Keyframe Ops:** Delete at time + shift all keyframes by delta
- **Step Copy/Reuse:** Browse steps across cabinets, filter, and copy into target cabinet
- **Insert Position:** Copy step into a specific index with automatic renumbering

### 🐛 Fixed

- Prevented accidental keyframe movement on selection

### 📝 Documentation

- Updated progress and implementation status for Phase 6 completion

---

## [0.9.0] - 2026-01-26

### ✨ Added - Audio Workflow & Editor Sync

- **Audio URLs in Step JSON:** `audioUrl` stored per step and used as the single source of truth
- **Admin Audio Uploads:** EN/AR drop zones with deferred upload until Save
- **Upload Endpoint:** Supports `filename` for deterministic `step{n}.mp3` names
- **Step List Indicator:** ✓ Audio badge in step manager when audio exists
- **Visual Editor Audio Sync:** Audio plays with animation; timeline follows audio time
- **Timeline Duration Sync:** Duration updates from audio metadata

### 🐛 Fixed

- Animation completion warning caused by render-phase state updates
- Audio player recovery when the first step lacks audio but later steps have it

---

## [0.8.0] - 2026-01-22

### ✨ Added - Animation Authoring Tool Enhancements

- **Keyframe Selection & Editing System:**
  - Click-to-select keyframes on timeline (with drag/click differentiation)
  - Inline keyframe properties editor below timeline
  - Compact layout: time, position (x/y/z), rotation (degrees), visibility
  - Camera keyframe editor: position and target properties
  - Real-time property updates with input fields
  - Rotation conversion between radians (storage) and degrees (UI)
  - Keyframe time editing with automatic reordering

- **Timeline Filtering System:**
  - Smart filtering based on object selection
  - Shows selected object's keyframes + all child objects
  - Camera keyframes displayed when no object selected
  - Hierarchical object traversal for complete filtering
  - Visual focus on relevant keyframes only

- **Visibility & Interaction Controls:**
  - Invisible objects excluded from raycasting (not selectable)
  - Hierarchical visibility checking (parent chain validation)
  - Shadow casting synchronized with object visibility
  - Real-time shadow updates during animation playback
  - Prevents invisible objects from affecting scene lighting

- **UI/UX Improvements:**
  - Step title display in authoring page header
  - Format: "Step 2: Attach one leg to the base panel"
  - Compact inline properties editor preserves 3D viewport
  - Responsive layout with flex-wrap for smaller screens
  - Small input fields (w-20) with text-xs for space efficiency

### 🔧 Technical Implementation

- **AuthoringSceneViewer.tsx:**
  - `isFullyVisible()` helper for hierarchical visibility checking
  - Filtered raycasting pool (only visible meshes)
  - Initial shadow setup based on object visibility

- **authoring.tsx:**
  - `selectedKeyframeTime` state for tracking selection
  - `handleKeyframeSelect()` callback system
  - `timelineKeyframes` computed filtering with Set and traverse
  - Shadow casting updates in 3 animation code paths:
    - During visibility fade transitions
    - When holding at static visible/invisible state
    - When holding at final keyframe
  - Step data lookup from cabinet.steps for title display

- **Timeline.tsx:**
  - `onKeyframeSelect` prop and callback integration
  - Click vs drag detection (3px threshold with hasMoved flag)
  - Keyframe selection on mouse up without movement

### 🐛 Fixed

- Keyframe properties not displaying (nested transform data access)
- Properties editor taking excessive vertical space
- Invisible objects still selectable in 3D scene
- Invisible objects casting shadows during animation
- Timeline showing all keyframes regardless of selection

---

## [0.7.0] - 2026-01-20

### ✨ Added - Phase 6: Admin Panel (80% Complete)

- **QR Code Generation System:**
  - Grid view of all cabinets with QR codes
  - Selection system (checkboxes, select all/deselect all)
  - Download PNG feature (canvas export with filename)
  - **Advanced Print Layout:**
    - Dual rendering architecture (screen vs print)
    - Print-only header with PWAssemblyGuide logo
    - Clean 2-column grid (2 QR codes per page)
    - Shows: QR code + cabinet name + ID
    - Hides: navigation, buttons, links, URLs, footer
    - Selection-based printing (only checked codes)
  - Navigation integration (admin header + cabinets page button)
  - Level H error correction for durability
  - 200x200px QR codes with margins

- **Step Management UI:**
  - Visual step list with drag-and-drop reordering
  - Step cards showing:
    - Step number badge
    - Bilingual titles (EN + AR)
    - Duration in minutes
    - Animation status indicator (✅/⚠️)
  - Add new step form with auto-generated step IDs
  - Edit step form with all fields editable
  - Delete step with confirmation dialog
  - Visual editor placeholder page
  - Multiple navigation paths to step management

- **Cabinet Management:**
  - Cabinet list page with search and category filter
  - Cabinet cards with image, name, category, step count
  - Create cabinet modal with bilingual inputs
  - Edit cabinet page with full-page layout
  - Delete cabinet with confirmation
  - "Manage Steps" link showing stepCount

- **Authentication System:**
  - Login page with password hashing (bcryptjs)
  - Token-based authentication (24-hour expiration)
  - AuthContext for client-side state management
  - Protected routes with AuthGuard component
  - Logout functionality
  - LocalStorage persistence

- **Admin Layout:**
  - Consistent navigation (Cabinets, QR Codes, Dashboard)
  - Dark mode toggle
  - View Site link
  - Responsive header

- **API Routes:**
  - `pages/api/auth.ts` - Login endpoint
  - `pages/api/cabinets.ts` - Full CRUD for split data structure
    - GET: Merges metadata from index with steps
    - POST: Creates entries in both files
    - PUT: Updates both files, calculates stepCount
    - DELETE: Removes from both locations
  - Token validation middleware

### 🔄 Changed - Data Structure Migration

- **Split Architecture:**
  - Migrated from single `cabinets.json` to split structure
  - `data/cabinets-index.json` - Lightweight metadata only (~2KB)
  - `data/cabinets/[id].json` - Individual animation files
  - Benefits: Faster loads, better Git diffs, scales to 100+ cabinets

- **Smart Data Loading:**
  - Updated `cabinets-loader.ts` with merge function
  - getCabinet() combines metadata from index with steps from individual files
  - Automatic stepCount calculation on save

- **TypeScript Interfaces:**
  - Added `stepCount?: number` to Cabinet interface
  - Made `steps?: Step[]` optional
  - Made `description` optional
  - Created CabinetStepsData interface

### 🐛 Fixed

- Cabinet page display issue (name/description undefined)
- Property access errors with safe navigation (`?.`)
- Print layout showing navigation buttons
- QR code selection not filtering print output

### 📦 Dependencies Added

- bcryptjs@2.4.3 - Password hashing
- qrcode.react@3.1.0 - QR code generation
- react-dropzone@14.2.3 - File upload support

### 📚 Documentation

- Updated [PROGRESS.md](./docs/PROGRESS.md) with Phase 6 details
- Updated [IMPLEMENTATION_STATUS.md](./docs/IMPLEMENTATION_STATUS.md)
- Created [DATA_STRUCTURE.md](./docs/DATA_STRUCTURE.md)
- Updated [README.md](./README.md) to reflect current status

---

## [0.6.0] - 2026-01-18

### ✨ Added - Phase 5.5: UI/UX Refinements

- Single shared AudioPlayer instance (prevents dual playback)
- Conditional SceneViewer rendering based on viewport
- Viewport detection with resize listener
- Refresh button positioned absolutely on scene viewer

### 🐛 Fixed - Critical Bugs

- **Dual Audio Player Issue:**
  - Problem: Two AudioPlayer instances causing dual playback
  - Solution: Single shared instance above both layouts
- **Dual SceneViewer Issue:**
  - Problem: Two SceneViewer instances causing animation conflicts
  - Solution: Conditional rendering (one instance at a time)
- **Shadow Quality:**
  - Increased shadow map resolution: 2048 → 4096
  - Fine-tuned shadow bias and normal bias
  - Reduced shadow opacity for subtler effect
  - Eliminated shadow banding artifacts

### 🔄 Changed

- Audio player moved below 3D scene viewer
- Removed StepControls component row
- Removed Reset View button (unnecessary with OrbitControls)
- Balanced lighting for better rendering quality

---

## [0.5.0] - 2026-01-17

### ✨ Added - Phase 5: Audio Integration

- **AudioPlayer Component:**
  - Play/pause controls
  - Volume slider (0-100%)
  - Progress bar with time display
  - Seek functionality (click to jump)
  - Auto-switch audio on step change
  - Bilingual audio support (EN/AR)
  - Mobile-optimized controls
  - Dark mode support

- **Audio Files:**
  - Organized by language and cabinet: `/public/audio/[lang]/[category]/[cabinet]/`
  - MP3 format for broad compatibility
  - Sample audio for BC_002 cabinet

- **Audio Context:**
  - Preloading system for smooth playback
  - Error handling for missing files
  - State management for current audio

### 🔄 Changed

- Step viewer layout adjusted to accommodate audio player
- Audio player positioned above step info panel

---

## [0.4.0] - 2026-01-15

### ✨ Added - Phase 3: Step System with GSAP Animations

- **GSAP Animation System:**
  - Keyframe-based animations with JSON definitions
  - Additive transform system (position/rotation offsets)
  - Hierarchical model support (parent-child relationships)
  - Visibility control (show/hide objects at specific times)
  - Camera animations per step
  - Smooth easing with customizable timing

- **Animation Controls:**
  - Play/pause/restart functionality
  - Animation completion detection
  - Disabled navigation during animations
  - Click step to restart current animation
  - Original transform preservation

- **Step Data Structure:**
  - Keyframe-based animation format
  - Camera position keyframes
  - Object visibility keyframes
  - Duration calculated from max keyframe time

- **Completion Tracking:**
  - Mark steps as completed
  - Progress indicator
  - Completion screen on final step
  - LocalStorage persistence

### 📚 Documentation

- Created [KEYFRAME_ANIMATION_SYSTEM.md](./docs/KEYFRAME_ANIMATION_SYSTEM.md)
- Created [KEYFRAME_ANIMATION.md](./docs/KEYFRAME_ANIMATION.md)
- Updated all phase documentation

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

| Version | Date       | Phase     | Status      | Highlights                             |
| ------- | ---------- | --------- | ----------- | -------------------------------------- |
| 0.7.0   | 2026-01-20 | Phase 6   | 🚧 80%      | Admin panel, QR codes, step management |
| 0.6.0   | 2026-01-18 | Phase 5.5 | ✅ Complete | UI/UX refinements, bug fixes           |
| 0.5.0   | 2026-01-17 | Phase 5   | ✅ Complete | Audio integration                      |
| 0.4.0   | 2026-01-15 | Phase 3   | ✅ Complete | GSAP animations, completion tracking   |
| 0.3.0   | 2026-01-14 | Phase 2   | ✅ Complete | Enhanced 3D rendering, collapsible UI  |
| 0.2.0   | 2026-01-13 | Phase 1   | ✅ Complete | Foundation, routing, i18n              |
| 0.1.0   | 2026-01-13 | Planning  | ✅ Complete | Project initialization                 |

---

## Upcoming Releases

### [0.8.0] - TBD (Planned)

**Phase 6.4: Visual 3D Authoring Tool**

- Three.js scene editor with GLB loading
- Object hierarchy browser (tree view)
- Transform controls (move/rotate/scale)
- Timeline-based keyframe recording
- Camera position recording
- Animation preview playback
- JSON export for step animations

### [0.9.0] - TBD (Planned)

**Phase 6.5: Step Copy/Reuse System**

- Browse all steps from all cabinets
- Filter by cabinet ID or category
- 3D preview of step animations
- Copy step to current cabinet
- Adjust copied step parameters

### [1.0.0] - March 2026 (Planned)

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
- Phase 3: 1 day (planned: 2 weeks) - 93% faster ⚡
- Phase 5: 1 day (planned: 1 week) - 86% faster ⚡
- Phase 5.5: <1 day (unplanned) - Critical fixes
- Phase 6: 2 days (planned: 2 weeks, 80% complete) - On track 🎯
- **Overall:** Significantly ahead of schedule

### Key Metrics

- **Lines of Code:** ~10,000+ (TypeScript/TSX)
- **Components:** 15+ (3D, UI, admin, context, layout)
- **Pages:** 15+ (public + admin routes)
- **API Routes:** 2 (auth, cabinets)
- **Data Files:** 3+ (index + individual cabinets)
- **3D Models:** 2 (BC-001, Arrows)
- **Languages:** 2 (EN, AR)
- **Documentation:** 10+ files, ~8,000+ lines
- **Admin Features:** Auth, CRUD, step management, QR generation
- **Progress:** 58% complete (8.5 of 16 weeks equivalent)

---

**Maintained by:** PowerWood Development Team  
**Last Updated:** January 20, 2026
