# GitHub Copilot Instructions for PWAssemblyGuide

This file provides guidelines for GitHub Copilot to ensure consistent, clean, and performant code generation for the PWAssemblyGuide kitchen cabinet assembly guide web application.

---

## Project Overview

**PWAssemblyGuide** is a mobile-first, multilingual 3D web application that provides step-by-step interactive assembly instructions for kitchen cabinets. Users scan a QR code on their cabinet box to access immersive 3D animations with voice narration in multiple languages.

### Key Features

- **58 cabinet models** across 7 categories
- **Mobile-first** 3D experience with Three.js/WebGL
- **QR code direct access** from product packaging
- **Multilingual support** (English, Arabic with RTL)
- **Offline PWA capability** for workshop use
- **Admin panel** with 3D animation authoring tool
- **Keyframe-based animation system** with custom lerp/slerp interpolation

### Deployment Architecture

- **Frontend:** Next.js 14 static export (`output: 'export'`)
- **Backend:** PHP API layer (Hostinger Premium hosting)
- **Data Storage:** JSON files (no database)
- **Hosting:** Hostinger Premium at `https://mlextensions.com`

---

## General Principles

- **Clean Code:** Prioritize **readability, maintainability, and reusability**
- **Mobile-First:** Design all UI components for mobile devices first, then scale up
- **Performance:** Target 30fps minimum on mid-range mobile devices, <3 second load times
- **Offline Capability:** Consider PWA requirements when implementing features
- **Bilingual First:** Always include both English and Arabic translations for user-facing content
- **TypeScript First:** All new code must be written in **TypeScript** with strict mode
- **Package Management:** This project uses **npm** for managing dependencies
- **Documentation:** All principal documentation should be created in the `docs/` folder

### Code Organization Guidelines

- **Co-locate logic that changes together**
- **Group code by feature, not by type**
- **Separate UI, logic, and data fetching**
- **Clear product logic vs infrastructure separation**
- **Design code to be easy to replace and delete**
- **Minimize API interface and expose only what's necessary**
- **Favor pure functions for testable logic**
- **Long, clear names over short, vague names**

---

## Technology Stack

### Core Technologies

| Technology         | Version | Purpose                        |
| ------------------ | ------- | ------------------------------ |
| Next.js            | 14.x    | React framework (Pages Router) |
| React              | 18.x    | UI library                     |
| TypeScript         | 5.x     | Type safety                    |
| Three.js           | 0.160   | 3D rendering & animation       |
| @react-three/fiber | 8.x     | React renderer for Three.js    |
| @react-three/drei  | 9.x     | Three.js helpers               |
| Tailwind CSS       | 3.x     | Styling                        |
| Zustand            | 4.x     | State management               |

### Important Notes

- **Pages Router:** This project uses Next.js Pages Router (not App Router)
- **Static Export:** Production builds use `output: 'export'` for static HTML
- **No Server-Side Rendering:** All data fetching happens client-side or at build time
- **PHP Backend:** API routes are handled by PHP on Hostinger, not Next.js API routes

---

## Project Structure

```folder
├── components/          # React components
│   ├── 3d/             # Three.js/3D viewer components
│   └── admin/          # Admin panel components
├── contexts/           # React Context providers
├── data/               # JSON data files
│   ├── cabinets-index.json    # Cabinet metadata
│   └── cabinets/              # Individual cabinet step files
├── docs/               # Project documentation
├── lib/                # Utility functions and helpers
├── pages/              # Next.js pages (file-based routing)
│   ├── admin/          # Admin panel pages
│   ├── api/            # Development API routes (not used in production)
│   ├── cabinet/        # Cabinet viewer pages
│   └── categories/     # Category listing pages
├── php-api/            # PHP backend for Hostinger
├── public/             # Static assets
│   ├── audio/          # Narration audio files
│   ├── images/         # Images
│   ├── locales/        # i18n translation files
│   └── models/         # GLB 3D model files
├── scripts/            # Build and utility scripts
├── styles/             # Global CSS files
└── types/              # TypeScript type definitions
```

---

## TypeScript Guidelines

### Type Definitions

- **Always place types in `types/` folder** with descriptive filenames
- **Never define types inside components**
- Core types are in:
  - `types/cabinet.ts` - Cabinet, Step, StepAnimation interfaces
  - `types/animation.ts` - Keyframe animation types

### Key Interfaces

```typescript
// Cabinet metadata
interface Cabinet {
  id: string;
  name: { en: string; ar: string };
  category: string;
  model: string;
  description?: { en: string; ar: string };
  steps?: Step[];
  stepCount?: number;
  estimatedTime?: string | number;
}

// Assembly step
interface Step {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  animation?: StepAnimation;
  audioUrl?: { en?: string; ar?: string };
}

// Keyframe animation
interface StepAnimation {
  duration: number;
  isOffset?: boolean;
  objectKeyframes: ObjectKeyframe[];
  cameraKeyframes: CameraKeyframe[];
}
```

### Strict Mode

- `strict: true` is enabled in `tsconfig.json`
- Always provide accurate type definitions
- Avoid `any` type - use `unknown` if type is truly unknown

---

## React Component Guidelines

### Component Design

- **Functional Components & Hooks:** Always use functional components with React Hooks
- **Single Responsibility:** Each component should have one primary responsibility
- **Component Naming:** Use `PascalCase` (e.g., `SceneViewer`, `StepControls`)
- **Keep components small and focused**

### Props

- Use `camelCase` for prop names
- Destructure props in function signature
- Define `interface` for props in TypeScript
- For bilingual text props, use `{ en: string; ar: string }` pattern

### State Management

- **Local State:** Use `useState` for component-level state
- **Global State:** Use **Zustand** or **React Context** for shared state
- **Theme/Language:** Use existing `ThemeContext` and custom i18n system
- **Avoid prop drilling** - use context for deeply nested data

### Custom Hooks

Extract reusable logic into custom hooks:

- `useAuth` - Authentication state
- `useLanguage` - Current language/locale
- `useAnimation` - Animation playback control

---

## Next.js Specific Guidelines

### Pages Router

This project uses the **Pages Router** pattern:

```typescript
// pages/cabinet/[id].tsx
import { useRouter } from "next/router";

export default function CabinetPage() {
  const router = useRouter();
  const { id } = router.query;
  // ...
}
```

### Data Fetching

- **Client-side fetching:** Use `useEffect` + `fetch` for dynamic data
- **Static paths:** Use `getStaticPaths` + `getStaticProps` where applicable
- **API calls:** Target `/api/*` which rewrites to PHP in production

```typescript
// Fetching cabinet data
const response = await fetch(`/api/cabinets?id=${cabinetId}`);
const cabinet = await response.json();
```

### Dynamic Routes

- `[id]` for dynamic segments
- `[...slug]` for catch-all routes
- URL parameters via `router.query`

### Image Optimization

- Use `next/image` with `unoptimized: true` (required for static export)

```typescript
import Image from 'next/image';

<Image
  src="/images/cabinets/BC-002.png"
  alt="Cabinet thumbnail"
  width={200}
  height={200}
  unoptimized
/>
```

---

## 3D/Three.js Guidelines

### Scene Components

- Place 3D components in `components/3d/` folder
- Use `@react-three/fiber` for React integration
- Use `@react-three/drei` helpers (OrbitControls, useGLTF, etc.)

### GLB Model Loading

```typescript
import { useGLTF } from '@react-three/drei';

function CabinetModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} />;
}
```

### Performance Targets

- **60fps** on desktop, **30fps minimum** on mobile
- **<2MB** model file size
- Use `draco` compression for GLB files when possible
- Implement level-of-detail (LOD) for complex models

### Lighting & Shadows

- Use directional lights with shadows for realism
- Ground plane with shadow receiver
- Material customization for visibility (darker legs, brighter panels)

---

## Animation System Guidelines

### Keyframe-Based Architecture

This project uses a **custom keyframe-based animation system** with Three.js lerp/slerp interpolation:

```typescript
interface ObjectKeyframe {
  time: number; // Time in seconds
  objectId: string; // Object name in GLB hierarchy
  easing?: string; // Easing function name (e.g., "power2.out", "elastic.out")
  transform: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  };
  visible?: boolean;
}
```

### Animation Principles

- **Transforms are additive** - position/rotation offsets add to original model transforms
- **Time is in seconds** - stored in keyframes and used for interpolation
- **First keyframe (time: 0)** defines initial scene state
- **Easing per keyframe** - custom `applyEasing()` function supports many easing curves
- **No external animation library** - uses native Three.js + requestAnimationFrame

### Animation Playback Implementation

The animation system uses `requestAnimationFrame` with manual interpolation:

```typescript
// Position interpolation (lerp)
targetObj.position.set(
  prevPosition.x + (nextPosition.x - prevPosition.x) * t,
  prevPosition.y + (nextPosition.y - prevPosition.y) * t,
  prevPosition.z + (nextPosition.z - prevPosition.z) * t,
);

// Rotation interpolation (slerp via quaternions)
const prevQuat = new THREE.Quaternion();
const nextQuat = new THREE.Quaternion();
prevQuat.setFromEuler(
  new THREE.Euler(prevRotation.x, prevRotation.y, prevRotation.z),
);
nextQuat.setFromEuler(
  new THREE.Euler(nextRotation.x, nextRotation.y, nextRotation.z),
);
interpolatedQuat.slerpQuaternions(prevQuat, nextQuat, t);
targetObj.quaternion.copy(interpolatedQuat);
```

### Supported Easing Functions

The custom `applyEasing()` function supports these easing names:

- **Power easings:** `power2.in`, `power2.out`, `power2.inOut` (also power3, power4, power5)
- **Sine:** `sine.in`, `sine.out`, `sine.inOut`
- **Expo:** `expo.in`, `expo.out`, `expo.inOut`
- **Circ:** `circ.in`, `circ.out`, `circ.inOut`
- **Back:** `back.in`, `back.out`, `back.inOut`
- **Elastic:** `elastic.in`, `elastic.out`, `elastic.inOut`
- **Bounce:** `bounce.in`, `bounce.out`, `bounce.inOut`
- **Linear:** `linear` (default)

---

## Internationalization (i18n)

### Custom i18n System

This project uses a **custom i18n implementation** (not next-i18next in production):

```typescript
// lib/i18n.tsx
import { useLanguage } from "@/contexts/LanguageContext";

export function useTranslation() {
  const { language } = useLanguage();
  // Returns translation function
}
```

### Supported Languages

| Code | Language | Direction |
| ---- | -------- | --------- |
| `en` | English  | LTR       |
| `ar` | Arabic   | RTL       |

### Translation Files

Located in `public/locales/{lang}/common.json`:

```json
{
  "cabinet": {
    "title": "Assembly Guide",
    "step": "Step {{number}}"
  }
}
```

### RTL Support

- Use Tailwind's RTL utilities: `rtl:`, `ltr:`
- Use logical properties: `ms-4` (margin-start) instead of `ml-4`
- Test all UI in both LTR and RTL modes

```typescript
<div className="text-left rtl:text-right ms-4">
  {/* Content adapts to text direction */}
</div>
```

---

## Styling Guidelines

### Tailwind CSS

- Use **Tailwind CSS** for all styling
- Mobile-first responsive design: `sm:`, `md:`, `lg:` breakpoints
- Dark mode support via `dark:` variant

### Mobile-First Pattern

```typescript
<div className="
  p-2 text-sm           {/* Mobile base */}
  md:p-4 md:text-base   {/* Tablet+ */}
  lg:p-6 lg:text-lg     {/* Desktop+ */}
">
```

### Common Patterns

```typescript
// Buttons
<button className="
  px-4 py-2 rounded-lg
  bg-blue-600 hover:bg-blue-700
  text-white font-medium
  transition-colors
">

// Cards
<div className="
  bg-white dark:bg-gray-800
  rounded-lg shadow-md
  p-4
">
```

---

## API & Data Guidelines

### Split Data Structure

Cabinet data is split for performance:

1. **`data/cabinets-index.json`** - Metadata for all cabinets (quick loading)
2. **`data/cabinets/{id}.json`** - Full step/animation data per cabinet

### API Endpoints

In development, use Next.js API routes. In production, these map to PHP:

| Endpoint                            | Method | PHP File                      | Purpose            |
| ----------------------------------- | ------ | ----------------------------- | ------------------ |
| `/api/cabinets`                     | GET    | `php-api/cabinets.php`        | List all cabinets  |
| `/api/cabinets?id={id}`             | GET    | `php-api/cabinets.php`        | Get single cabinet |
| `/api/cabinets`                     | POST   | `php-api/cabinets.php`        | Create cabinet     |
| `/api/cabinets`                     | PUT    | `php-api/cabinets.php`        | Update cabinet     |
| `/api/categories`                   | GET    | `php-api/categories.php`      | List categories    |
| `/api/upload`                       | POST   | `php-api/upload.php`          | Upload files       |
| `/api/admin/cabinets/.../animation` | POST   | `php-api/admin/animation.php` | Save animation     |

### Fetch Pattern

```typescript
async function fetchCabinet(id: string): Promise<Cabinet | null> {
  try {
    const response = await fetch(`/api/cabinets?id=${id}`);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching cabinet:", error);
    return null;
  }
}
```

---

## Admin Panel Guidelines

### Authentication

- Token-based authentication stored in `localStorage`
- Protected routes wrapped with `AuthGuard` component
- Login via `/admin/login`

```typescript
import { AuthGuard } from '@/components/admin/AuthGuard';

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        {/* Admin content */}
      </AdminLayout>
    </AuthGuard>
  );
}
```

### Admin Components

Located in `components/admin/`:

- `AdminLayout.tsx` - Common admin page layout
- `AuthGuard.tsx` - Route protection
- `AuthoringSceneViewer.tsx` - 3D scene for animation authoring
- `Timeline.tsx` - Keyframe timeline component
- `ObjectHierarchyTree.tsx` - GLB object tree view
- `CabinetFormModal.tsx` - Cabinet CRUD forms
- `FileUploadField.tsx` - File upload with drag-drop
- `ToastProvider.tsx` - Toast notifications

### Animation Authoring Tool

The authoring tool (`pages/admin/cabinets/[id]/steps/authoring.tsx`) provides:

- Three.js scene with GLB model loading
- Object hierarchy tree view
- Transform gizmos (translate/rotate/scale)
- Timeline-based keyframe recording
- Camera position/target recording
- Animation preview with play/pause/scrub
- JSON export and import
- Undo/redo history

---

## File Upload Guidelines

### Supported File Types

| Type   | Extensions      | Max Size | Destination               |
| ------ | --------------- | -------- | ------------------------- |
| Models | `.glb`, `.gltf` | 10MB     | `public/models/`          |
| Audio  | `.mp3`, `.wav`  | 5MB      | `public/audio/{lang}/`    |
| Images | `.png`, `.jpg`  | 2MB      | `public/images/cabinets/` |

### Upload Pattern

```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("type", "model"); // or 'audio', 'image'

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});
```

---

## Performance Guidelines

### Load Time Targets

- **Initial page:** <3 seconds on 4G
- **3D model:** <5MB per cabinet
- **Total assets:** <10MB per cabinet (model + audio + textures)

### Optimization Techniques

- **Code splitting:** Use `next/dynamic` for heavy components
- **Lazy loading:** Load 3D models only when needed
- **Asset compression:** Draco-compressed GLB files
- **Caching:** Service worker for offline capability

```typescript
import dynamic from 'next/dynamic';

const SceneViewer = dynamic(
  () => import('@/components/3d/SceneViewer'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);
```

---

## Deployment Guidelines

### Build Commands

```bash
# Development
npm run dev

# Production build (static export)
npm run build

# Output: out/ folder with static HTML/CSS/JS
```

### Hostinger Deployment

1. Build locally: `npm run build`
2. Upload `out/` folder contents to `public_html/`
3. Ensure `php-api/` folder exists with PHP files
4. Verify `.htaccess` routing rules

### .htaccess Routing

Dynamic routes require Apache rewrite rules:

```apache
# Cabinet pages
RewriteRule ^cabinet/([^/]+)/?$ /cabinet/[id]/index.html [L]
RewriteRule ^cabinet/([^/]+)/step/([^/]+)/?$ /cabinet/[id]/step/[stepId]/index.html [L]

# API routing to PHP
RewriteRule ^api/(.*)$ /php-api/$1.php [L,QSA]
```

---

## Testing Guidelines

### Manual Testing Checklist

- [ ] All pages render correctly in English
- [ ] All pages render correctly in Arabic (RTL)
- [ ] 3D viewer loads and renders models
- [ ] Animations play correctly
- [ ] Audio synchronization works
- [ ] Mobile touch controls function
- [ ] Admin CRUD operations work
- [ ] File uploads succeed

### Browser Support

- Chrome 90+ (primary)
- Safari 14+ (iOS)
- Firefox 90+
- Edge 90+

---

## Error Handling

### API Errors

```typescript
try {
  const response = await fetch("/api/cabinets");
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
} catch (error) {
  console.error("API Error:", error);
  // Show user-friendly error message
}
```

### 3D Loading Errors

```typescript
const { scene, error } = useGLTF(modelPath);

if (error) {
  return <ErrorFallback message="Failed to load 3D model" />;
}
```

---

## Code Examples

### Creating a New Component

```typescript
// components/NewComponent.tsx
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface NewComponentProps {
  title: { en: string; ar: string };
  onAction: () => void;
}

export function NewComponent({ title, onAction }: NewComponentProps) {
  const { t, language } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onAction();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="text-lg font-semibold">
        {title[language]}
      </h2>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {isLoading ? t('common.loading') : t('common.submit')}
      </button>
    </div>
  );
}
```

### Creating a New Admin Page

```typescript
// pages/admin/new-feature.tsx
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AuthGuard } from '@/components/admin/AuthGuard';

export default function NewFeaturePage() {
  return (
    <AuthGuard>
      <AdminLayout title="New Feature">
        <div className="p-6">
          {/* Page content */}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
```

### Adding Animation Keyframes

```typescript
const newKeyframe: ObjectKeyframe = {
  time: 2.5, // 2.5 seconds
  objectId: "Leg_FR",
  easing: "power2.out",
  transform: {
    position: { x: 0, y: 0.1, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  },
  visible: true,
};
```

---

## Common Pitfalls to Avoid

1. **Don't use Next.js API routes in production** - They don't work with static export
2. **Don't forget Arabic translations** - All user-facing text needs both languages
3. **Don't use `ml-*`/`mr-*`** - Use logical properties `ms-*`/`me-*` for RTL support
4. **Don't hardcode URLs** - Use relative paths for API calls
5. **Don't skip TypeScript types** - Always define interfaces
6. **Don't mutate state directly** - Use immutable update patterns
7. **Don't forget mobile testing** - Primary audience is mobile users
8. **Don't use barrel files** - Import directly from specific files

---

## Quick Reference

### File Naming

- Components: `PascalCase.tsx` (e.g., `SceneViewer.tsx`)
- Pages: `kebab-case.tsx` or `[param].tsx`
- Types: `camelCase.ts` (e.g., `cabinet.ts`)
- Utils: `camelCase.ts` (e.g., `formatTime.ts`)

### Import Order

1. React/Next.js imports
2. Third-party libraries
3. Local components (`@/components/`)
4. Local utilities (`@/lib/`)
5. Types (`@/types/`)
6. Styles

### Commit Message Format

```text
feat: Add new animation easing options
fix: Correct RTL layout in step navigation
docs: Update deployment instructions
refactor: Simplify cabinet data loading
```
