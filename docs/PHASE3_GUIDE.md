# Phase 3 Implementation Guide

**Phase:** Step System (Weeks 5-6)  
**Status:** 🚧 In Progress  
**Started:** January 14, 2026  
**Target Completion:** January 25, 2026

---

## 📋 Overview

Phase 3 focuses on completing the step navigation system with enhanced animations, visual feedback, and mobile gestures. While basic navigation is working, we need to implement the animation system that shows/hides parts and smoothly transitions between assembly steps.

---

## ✅ Completed (60%)

### Navigation Infrastructure

- ✅ URL-based routing (`/cabinet/BC-001/step/1`)
- ✅ `cabinets.json` data structure
- ✅ StepNavigation component with progress bar
- ✅ Previous/Next buttons
- ✅ Step list with active highlighting
- ✅ Mobile-optimized layout
- ✅ Collapsible description UI

### Current Capabilities

- Users can navigate between steps via URL
- Progress bar shows completion percentage
- Step list displays all steps with click-to-jump
- UI is responsive and mobile-friendly
- 3D viewer loads and displays models

---

## 🔄 Week 5 Tasks - Animation System

### 1. Define Animation Data Format

**Goal:** Create a flexible JSON structure for step-based animations

**Data Structure:**

```typescript
// types/cabinet.ts - Add to Step interface
interface StepAnimation {
  objects: AnimatedObject[];
  camera?: CameraPosition;
  duration?: number;
}

interface AnimatedObject {
  name: string; // Object name in GLB file
  visible: boolean; // Show or hide
  position?: [number, number, number]; // [x, y, z]
  rotation?: [number, number, number]; // [x, y, z] in radians
  scale?: [number, number, number]; // [x, y, z]
  duration?: number; // Animation duration in ms (default: 1000)
  delay?: number; // Delay before animation starts
  easing?: "linear" | "easeInOut" | "easeOut" | "easeIn";
}

interface CameraPosition {
  position: [number, number, number];
  target: [number, number, number];
  duration?: number;
}

// Update Step interface
interface Step {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  model: string;
  animation?: StepAnimation; // Add this
  audioUrl?: { en: string; ar: string };
  tools?: string[];
  duration?: string;
  warnings?: { en: string; ar: string }[];
}
```

**Example Step Data:**

```json
{
  "id": "step-1",
  "title": {
    "en": "Attach Back Panel",
    "ar": "تركيب اللوح الخلفي"
  },
  "description": {
    "en": "Align the back panel with the cabinet frame and secure with screws",
    "ar": "قم بمحاذاة اللوح الخلفي مع إطار الخزانة وثبته بالمسامير"
  },
  "model": "/models/BC-001.glb",
  "animation": {
    "objects": [
      {
        "name": "BackPanel",
        "visible": true,
        "position": [0, 0, 0],
        "rotation": [0, 0, 0],
        "duration": 1500,
        "easing": "easeOut"
      },
      {
        "name": "Screw_1",
        "visible": true,
        "delay": 500
      },
      {
        "name": "Screw_2",
        "visible": true,
        "delay": 700
      },
      {
        "name": "Arrow_Back",
        "visible": true,
        "scale": [1.2, 1.2, 1.2],
        "duration": 500
      }
    ],
    "camera": {
      "position": [2, 1, 3],
      "target": [0, 0.5, 0],
      "duration": 1000
    }
  },
  "tools": ["Phillips Screwdriver", "Level"],
  "duration": "5 minutes"
}
```

**Implementation Steps:**

1. Update `types/cabinet.ts` with new interfaces
2. Update sample data in `data/cabinets.json`
3. Create at least 2 complete animation examples

---

### 2. Implement Object Visibility & Animation

**Goal:** Control which 3D objects are visible and animate them

**File:** `components/3d/SceneViewer.tsx`

**Add Animation Logic:**

```typescript
// Import animation utilities
import { Vector3, Euler } from "three";

// Add to SceneViewer component
const [currentAnimation, setCurrentAnimation] = useState<StepAnimation | null>(
  null
);

// Function to apply step animation
const applyStepAnimation = (animation: StepAnimation) => {
  if (!modelRef.current) return;

  animation.objects.forEach((animObj) => {
    // Find the object in the loaded model
    const object = modelRef.current.getObjectByName(animObj.name);
    if (!object) {
      console.warn(`Object not found: ${animObj.name}`);
      return;
    }

    // Apply visibility
    object.visible = animObj.visible;

    // If visible, apply transformations
    if (animObj.visible) {
      // Position
      if (animObj.position) {
        const targetPos = new Vector3(...animObj.position);
        // TODO: Add smooth animation using GSAP or custom interpolation
        object.position.copy(targetPos);
      }

      // Rotation
      if (animObj.rotation) {
        const targetRot = new Euler(...animObj.rotation);
        object.rotation.copy(targetRot);
      }

      // Scale
      if (animObj.scale) {
        const targetScale = new Vector3(...animObj.scale);
        object.scale.copy(targetScale);
      }
    }
  });

  // Apply camera animation
  if (animation.camera && cameraRef.current) {
    const { position, target } = animation.camera;
    // TODO: Smooth camera transition
    cameraRef.current.position.set(...position);
    // Update controls target if using OrbitControls
    if (controlsRef.current) {
      controlsRef.current.target.set(...target);
      controlsRef.current.update();
    }
  }
};

// Effect to apply animation when step changes
useEffect(() => {
  if (currentStep?.animation) {
    applyStepAnimation(currentStep.animation);
  }
}, [currentStep]);
```

**Tasks:**

- [ ] Add animation state management
- [ ] Implement `applyStepAnimation` function
- [ ] Handle object visibility toggling
- [ ] Add basic position/rotation/scale application
- [ ] Test with simple show/hide animations

---

### 3. Add Smooth Transitions

**Goal:** Animate transitions instead of instant changes

**Option A: Use GSAP** (Recommended)

```bash
npm install gsap @types/gsap
```

```typescript
import gsap from "gsap";

const applyStepAnimation = (animation: StepAnimation) => {
  animation.objects.forEach((animObj) => {
    const object = modelRef.current?.getObjectByName(animObj.name);
    if (!object) return;

    const duration = (animObj.duration || 1000) / 1000; // Convert to seconds
    const delay = (animObj.delay || 0) / 1000;

    // Visibility with fade
    if (animObj.visible !== object.visible) {
      if (animObj.visible) {
        object.visible = true;
        gsap.fromTo(
          object.material,
          { opacity: 0 },
          {
            opacity: 1,
            duration,
            delay,
            ease: animObj.easing || "power2.out",
          }
        );
      } else {
        gsap.to(object.material, {
          opacity: 0,
          duration,
          delay,
          ease: animObj.easing || "power2.in",
          onComplete: () => {
            object.visible = false;
          },
        });
      }
    }

    // Position animation
    if (animObj.position) {
      gsap.to(object.position, {
        x: animObj.position[0],
        y: animObj.position[1],
        z: animObj.position[2],
        duration,
        delay,
        ease: animObj.easing || "power2.out",
      });
    }

    // Rotation animation
    if (animObj.rotation) {
      gsap.to(object.rotation, {
        x: animObj.rotation[0],
        y: animObj.rotation[1],
        z: animObj.rotation[2],
        duration,
        delay,
        ease: animObj.easing || "power2.out",
      });
    }

    // Scale animation
    if (animObj.scale) {
      gsap.to(object.scale, {
        x: animObj.scale[0],
        y: animObj.scale[1],
        z: animObj.scale[2],
        duration,
        delay,
        ease: animObj.easing || "power2.out",
      });
    }
  });

  // Camera animation
  if (animation.camera) {
    const duration = (animation.camera.duration || 1000) / 1000;
    gsap.to(cameraRef.current.position, {
      x: animation.camera.position[0],
      y: animation.camera.position[1],
      z: animation.camera.position[2],
      duration,
      ease: "power2.inOut",
    });
    gsap.to(controlsRef.current.target, {
      x: animation.camera.target[0],
      y: animation.camera.target[1],
      z: animation.camera.target[2],
      duration,
      ease: "power2.inOut",
      onUpdate: () => controlsRef.current.update(),
    });
  }
};
```

**Tasks:**

- [ ] Install GSAP
- [ ] Implement smooth transitions for position/rotation/scale
- [ ] Add fade in/out for visibility changes
- [ ] Implement camera smooth transitions
- [ ] Test easing functions (easeOut for appearing, easeIn for disappearing)

---

### 4. Test Multi-Step Assembly

**Goal:** Verify animations work across multiple steps

**Test Cases:**

1. **BC-001 Complete Assembly (5 steps):**

   - Step 1: Show cabinet frame only
   - Step 2: Add back panel with arrows
   - Step 3: Add shelves with positioning
   - Step 4: Add doors with rotation animation
   - Step 5: Add hardware (handles, hinges)

2. **Camera Movement:**

   - Each step should show optimal viewing angle
   - Smooth transitions between camera positions

3. **Object Sequencing:**
   - Parts appear in logical order
   - Arrows indicate direction/position
   - Previously added parts remain visible

**Tasks:**

- [ ] Create complete animation data for BC-001 (5 steps)
- [ ] Test step 1 → 2 transition
- [ ] Test step 2 → 3 transition
- [ ] Test jumping from step 1 → 5 directly
- [ ] Test reverse navigation (step 5 → 1)
- [ ] Verify no flickering or position glitches

---

## 🔄 Week 6 Tasks - UI Polish

### 5. Step Thumbnails (Auto-generated)

**Goal:** Create 3D preview images for each step

**Approach:**

```typescript
// utils/thumbnailGenerator.ts
import { WebGLRenderer, Scene, Camera } from "three";

export const generateThumbnail = async (
  scene: Scene,
  camera: Camera,
  width: number = 200,
  height: number = 150
): Promise<string> => {
  // Create offscreen renderer
  const renderer = new WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(width, height);

  // Render scene
  renderer.render(scene, camera);

  // Convert to data URL
  const dataUrl = renderer.domElement.toDataURL("image/png");

  // Cleanup
  renderer.dispose();

  return dataUrl;
};
```

**Integration in SceneViewer:**

```typescript
const captureThumbnail = async () => {
  if (!sceneRef.current || !cameraRef.current) return;

  const thumbnail = await generateThumbnail(
    sceneRef.current,
    cameraRef.current,
    200,
    150
  );

  // Save or return thumbnail
  return thumbnail;
};
```

**Tasks:**

- [ ] Create thumbnail generator utility
- [ ] Capture thumbnail when step loads
- [ ] Display thumbnails in StepNavigation
- [ ] Add loading state for thumbnails
- [ ] Cache thumbnails to avoid re-rendering

---

### 6. Swipe Gestures for Mobile

**Goal:** Allow users to swipe left/right to navigate steps

**Install:**

```bash
npm install react-swipeable
```

**Implementation:**

```typescript
// pages/cabinet/[id]/step/[stepId].tsx
import { useSwipeable } from "react-swipeable";

const handlers = useSwipeable({
  onSwipedLeft: () => {
    // Go to next step
    if (currentStepIndex < cabinet.steps.length - 1) {
      router.push(
        `/cabinet/${id}/step/${cabinet.steps[currentStepIndex + 1].id}`
      );
    }
  },
  onSwipedRight: () => {
    // Go to previous step
    if (currentStepIndex > 0) {
      router.push(
        `/cabinet/${id}/step/${cabinet.steps[currentStepIndex - 1].id}`
      );
    }
  },
  trackMouse: false, // Only touch, not mouse
  trackTouch: true,
  delta: 50, // Minimum swipe distance
});

// Apply to main container
<div {...handlers} className="relative">
  <SceneViewer />
</div>;
```

**Tasks:**

- [ ] Install react-swipeable
- [ ] Add swipe handlers to step viewer
- [ ] Test swipe left/right navigation
- [ ] Add visual feedback during swipe
- [ ] Prevent swipe conflicts with 3D controls

---

### 7. Step Completion Tracking

**Goal:** Show which steps are completed

**State Management:**

```typescript
// Use localStorage to persist completion
const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

// Load from localStorage
useEffect(() => {
  const saved = localStorage.getItem(`cabinet-${id}-completed`);
  if (saved) {
    setCompletedSteps(new Set(JSON.parse(saved)));
  }
}, [id]);

// Mark current step as completed
const markStepComplete = (stepId: string) => {
  const updated = new Set(completedSteps);
  updated.add(stepId);
  setCompletedSteps(updated);
  localStorage.setItem(`cabinet-${id}-completed`, JSON.stringify([...updated]));
};

// Auto-mark as complete when leaving step (after X seconds)
useEffect(() => {
  const timer = setTimeout(() => {
    markStepComplete(stepId);
  }, 5000); // Mark complete after 5 seconds

  return () => clearTimeout(timer);
}, [stepId]);
```

**Visual Indicator:**

```tsx
// In StepNavigation
<div className="step-item">
  {completedSteps.has(step.id) && (
    <svg className="w-4 h-4 text-green-500">{/* Checkmark icon */}</svg>
  )}
  <span>{step.title}</span>
</div>
```

**Tasks:**

- [ ] Add completion state management
- [ ] Persist to localStorage
- [ ] Add checkmark icons to completed steps
- [ ] Update progress bar to show completion
- [ ] Add "Reset Progress" button

---

### 8. Loading States

**Goal:** Show feedback during model and animation loading

**Implementation:**

```typescript
const [loading, setLoading] = useState(true);
const [loadingProgress, setLoadingProgress] = useState(0);

// GLTFLoader with progress
loader.load(
  modelUrl,
  (gltf) => {
    // Success
    setLoading(false);
  },
  (xhr) => {
    // Progress
    setLoadingProgress((xhr.loaded / xhr.total) * 100);
  },
  (error) => {
    // Error
    console.error(error);
    setLoading(false);
  }
);

// Loading UI
{
  loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="spinner" />
        <p className="mt-2 text-sm text-gray-600">
          Loading model... {Math.round(loadingProgress)}%
        </p>
      </div>
    </div>
  );
}
```

**Tasks:**

- [ ] Add loading state to SceneViewer
- [ ] Show progress during model load
- [ ] Add spinner animation
- [ ] Show loading during step transitions
- [ ] Add skeleton UI for step list while loading

---

## 🧪 Testing Checklist

### Functional Tests

- [ ] Navigate from step 1 to last step
- [ ] Navigate backwards from last to first
- [ ] Jump to random step (e.g., step 1 → step 4)
- [ ] Refresh page on any step (URL persistence)
- [ ] Swipe left/right to change steps (mobile)
- [ ] Click step in navigation list
- [ ] Previous/Next buttons work correctly
- [ ] Progress bar updates accurately

### Animation Tests

- [ ] Objects appear/disappear smoothly
- [ ] Position animations are smooth
- [ ] Rotation animations work correctly
- [ ] Camera transitions are smooth
- [ ] No flickering or glitches
- [ ] Animations complete before next step
- [ ] Multiple objects animate in sequence

### UI/UX Tests

- [ ] Step list shows current step highlighted
- [ ] Progress bar fills correctly
- [ ] Completed steps show checkmarks
- [ ] Thumbnails load and display
- [ ] Loading states appear during transitions
- [ ] Collapsible description works
- [ ] Mobile layout is comfortable
- [ ] Touch controls don't conflict with swipes

### Performance Tests

- [ ] Smooth 30+ fps during animations
- [ ] No memory leaks when changing steps
- [ ] Quick step switching (<500ms)
- [ ] Thumbnail generation doesn't lag
- [ ] Works on iPhone 11 / Galaxy S10

### Edge Cases

- [ ] Handle missing animation data gracefully
- [ ] Handle missing 3D objects (console warning, no crash)
- [ ] Handle invalid step IDs (404)
- [ ] Handle corrupted GLB files
- [ ] Handle offline mode (TBD for Phase 5)

---

## 📦 Deliverables

### End of Week 5

- ✅ Animation data format defined
- ✅ Object visibility control working
- ✅ Smooth transitions implemented
- ✅ Complete BC-001 animation (5 steps)
- ✅ Camera animations working
- ✅ All tests passing

### End of Week 6

- ✅ Step thumbnails generating
- ✅ Swipe gestures working
- ✅ Completion tracking implemented
- ✅ Loading states polished
- ✅ All Phase 3 tests passing
- ✅ Ready for Phase 4 (Content Creation)

---

## 🎯 Success Criteria

1. **User can navigate all steps smoothly**

   - No lag or stuttering
   - Animations enhance understanding

2. **Visual feedback is clear**

   - User knows current step
   - User knows completed steps
   - User knows progress percentage

3. **Mobile experience is excellent**

   - Swipe gestures feel natural
   - Touch doesn't interfere with 3D rotation
   - All controls reachable with one hand

4. **System is robust**
   - Handles missing data gracefully
   - No crashes on edge cases
   - Performance maintained across devices

---

## 💡 Tips & Best Practices

### Animation Timing

- Keep animations short (500-1500ms)
- Use delays for sequential reveals
- Ease out for appearing objects
- Ease in for disappearing objects

### Camera Movement

- Smooth camera transitions (1000ms+)
- Show objects from best viewing angle
- Don't rotate camera too aggressively
- Return to stable position, not mid-rotation

### Performance

- Dispose old animations before starting new ones
- Limit number of simultaneous animations
- Use RAF (requestAnimationFrame) for smooth updates
- Avoid updating every frame if not needed

### UX

- Always show loading feedback
- Disable navigation during transitions
- Provide clear visual hierarchy
- Test on real devices early

---

## 📚 Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [Three.js Animation](https://threejs.org/docs/#manual/en/introduction/Animation-system)
- [React Swipeable](https://github.com/FormidableLabs/react-swipeable)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)

---

**Ready to start? Let's build Phase 3!** 🚀
