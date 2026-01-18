# Getting Started with Phase 3

**Ready to implement the animation system? Let's go!** 🚀

---

## 🎯 What You'll Build

By the end of Phase 3, you'll have:

- ✅ Smooth 3D animations showing parts appearing in sequence
- ✅ Camera movements that highlight assembly areas
- ✅ Swipe gestures for mobile navigation
- ✅ Step completion tracking with visual indicators
- ✅ Auto-generated 3D thumbnails for each step

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- ✅ Phases 1 & 2 completed (already done!)
- ✅ Development server running (`npm run dev` on port 3000)
- ✅ Basic understanding of Three.js
- ✅ Familiarity with React hooks
- ✅ Test device or mobile emulator

---

## 🚀 Step-by-Step Workflow

### Step 1: Install Dependencies (5 minutes)

```bash
# Animation library
npm install gsap @types/gsap

# Swipe gestures
npm install react-swipeable

# Optional: Animation easing utilities
npm install @types/three
```

**Verify installation:**

```bash
npm list gsap react-swipeable
```

---

### Step 2: Update TypeScript Interfaces (10 minutes)

**File:** `types/cabinet.ts`

Add these interfaces at the end of the file:

```typescript
// Animation data structures
export interface AnimatedObject {
  name: string; // Object name in GLB file
  visible: boolean; // Show or hide this object
  position?: [number, number, number]; // Target position [x, y, z]
  rotation?: [number, number, number]; // Target rotation [x, y, z] in radians
  scale?: [number, number, number]; // Target scale [x, y, z]
  duration?: number; // Animation duration in milliseconds (default: 1000)
  delay?: number; // Delay before animation starts (ms)
  easing?: "linear" | "easeInOut" | "easeOut" | "easeIn"; // Easing function
}

export interface CameraPosition {
  position: [number, number, number]; // Camera position [x, y, z]
  target: [number, number, number]; // Camera look-at target [x, y, z]
  duration?: number; // Transition duration (ms)
}

export interface StepAnimation {
  objects: AnimatedObject[]; // Array of objects to animate
  camera?: CameraPosition; // Optional camera movement
  duration?: number; // Total animation duration (ms)
}

// Update the Step interface to include animation
export interface Step {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  model: string;
  animation?: StepAnimation; // ADD THIS LINE
  audioUrl?: { en: string; ar: string };
  tools?: string[];
  duration?: string;
  warnings?: { en: string; ar: string }[];
}
```

**Test:** TypeScript should compile without errors

```bash
npx tsc --noEmit
```

---

### Step 3: Create Animation Function (30 minutes)

**File:** `components/3d/SceneViewer.tsx`

Add GSAP import at the top:

```typescript
import gsap from "gsap";
```

Add this function inside the `SceneViewer` component (after the existing functions):

```typescript
// Apply step animation
const applyStepAnimation = useCallback((animation: StepAnimation) => {
  if (!modelRef.current) {
    console.warn("No model loaded, cannot apply animation");
    return;
  }

  console.log("Applying animation with", animation.objects.length, "objects");

  // Animate each object
  animation.objects.forEach((animObj) => {
    const object = modelRef.current!.getObjectByName(animObj.name);

    if (!object) {
      console.warn(`Object not found: ${animObj.name}`);
      return;
    }

    const duration = (animObj.duration || 1000) / 1000; // Convert to seconds
    const delay = (animObj.delay || 0) / 1000;
    const easing = animObj.easing || "power2.out";

    // Handle visibility changes with fade
    if (animObj.visible !== object.visible) {
      if (animObj.visible) {
        // Fade in
        object.visible = true;
        if (object.material) {
          gsap.fromTo(
            object.material,
            { opacity: 0 },
            {
              opacity: 1,
              duration,
              delay,
              ease: easing,
            }
          );
        }
      } else {
        // Fade out
        if (object.material) {
          gsap.to(object.material, {
            opacity: 0,
            duration,
            delay,
            ease: "power2.in",
            onComplete: () => {
              object.visible = false;
            },
          });
        }
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
        ease: easing,
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
        ease: easing,
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
        ease: easing,
      });
    }
  });

  // Camera animation
  if (animation.camera && cameraRef.current && controlsRef.current) {
    const duration = (animation.camera.duration || 1500) / 1000;

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
      onUpdate: () => controlsRef.current?.update(),
    });
  }
}, []);
```

**Add props to accept current step:**

```typescript
interface SceneViewerProps {
  modelUrl: string;
  currentStep?: Step; // ADD THIS
}

export default function SceneViewer({
  modelUrl,
  currentStep,
}: SceneViewerProps) {
  // ... existing code
}
```

**Add effect to trigger animation when step changes:**

```typescript
// Apply animation when step changes
useEffect(() => {
  if (currentStep?.animation) {
    console.log("Step changed, applying animation for:", currentStep.id);
    applyStepAnimation(currentStep.animation);
  }
}, [currentStep, applyStepAnimation]);
```

---

### Step 4: Update Step Viewer to Pass Current Step (10 minutes)

**File:** `pages/cabinet/[id]/step/[stepId].tsx`

Update the SceneViewer usage:

```typescript
<SceneViewer
  modelUrl={currentStep.model}
  currentStep={currentStep}  {/* ADD THIS */}
/>
```

---

### Step 5: Create Test Animation Data (20 minutes)

**File:** `data/cabinets.json`

Update BC-001's first step with animation data:

```json
{
  "id": "BC-001",
  "name": {
    "en": "2-Door Base Cabinet",
    "ar": "خزانة قاعدة بابين"
  },
  "category": "base",
  "model": "/models/BC-001.glb",
  "steps": [
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
            "name": "Frame",
            "visible": true,
            "duration": 500
          },
          {
            "name": "BackPanel",
            "visible": true,
            "position": [0, 0, 0],
            "duration": 1500,
            "delay": 500,
            "easing": "easeOut"
          }
        ],
        "camera": {
          "position": [2, 1.5, 3],
          "target": [0, 0.5, 0],
          "duration": 1000
        }
      },
      "tools": ["Phillips Screwdriver", "Level"],
      "duration": "5 minutes"
    }
  ]
}
```

**Note:** Object names (`"Frame"`, `"BackPanel"`) must match names in your GLB file.  
Use Blender or a GLB viewer to find exact object names.

---

### Step 6: Test Animation (15 minutes)

1. **Start dev server:**

   ```bash
   npm run dev
   ```

2. **Navigate to step:**

   ```url
   http://localhost:3001/cabinet/BC-001/step/step-1
   ```

3. **Check browser console:**

   - Look for "Applying animation with X objects"
   - Check for "Object not found" warnings
   - Verify no errors

4. **Visual verification:**

   - Objects should appear with fade-in
   - Camera should move smoothly
   - No flickering or jumps

5. **Test navigation:**
   - Click Next/Previous
   - Verify smooth transitions
   - Check URL updates

**Troubleshooting:**

- **"Object not found":** Check GLB object names in Blender
- **No animation:** Verify `currentStep.animation` exists
- **Jerky animation:** Check duration values (should be 1000-2000ms)

---

### Step 7: Add Swipe Gestures (15 minutes)

**File:** `pages/cabinet/[id]/step/[stepId].tsx`

Import swipeable:

```typescript
import { useSwipeable } from "react-swipeable";
```

Add swipe handlers (before the return statement):

```typescript
const handlers = useSwipeable({
  onSwipedLeft: () => {
    // Go to next step
    if (currentStepIndex < cabinet.steps.length - 1) {
      const nextStep = cabinet.steps[currentStepIndex + 1];
      router.push(`/cabinet/${id}/step/${nextStep.id}`);
    }
  },
  onSwipedRight: () => {
    // Go to previous step
    if (currentStepIndex > 0) {
      const prevStep = cabinet.steps[currentStepIndex - 1];
      router.push(`/cabinet/${id}/step/${prevStep.id}`);
    }
  },
  trackMouse: false, // Only touch, not mouse drag
  trackTouch: true,
  delta: 50, // Minimum swipe distance (pixels)
  preventScrollOnSwipe: true,
});
```

Apply to the main container (find the outer div and add `{...handlers}`):

```typescript
<div {...handlers} className="min-h-screen flex flex-col">
  {/* existing content */}
</div>
```

**Test on mobile device or Chrome DevTools mobile emulator:**

- Swipe left → Next step
- Swipe right → Previous step
- Verify no conflict with 3D rotation

---

### Step 8: Add Loading State (10 minutes)

**File:** `components/3d/SceneViewer.tsx`

Add loading state:

```typescript
const [loading, setLoading] = useState(true);
```

Update loader to track loading:

```typescript
loader.load(
  modelUrl,
  (gltf) => {
    // ... existing code
    setLoading(false); // ADD THIS
  },
  undefined,
  (error) => {
    console.error("Error loading model:", error);
    setLoading(false); // ADD THIS
  }
);
```

Add loading UI (before the canvas):

```tsx
{
  loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-600">Loading 3D model...</p>
      </div>
    </div>
  );
}
```

---

## ✅ Verification Checklist

After completing all steps, verify:

### Functionality

- [ ] Objects appear/disappear with smooth fade
- [ ] Position animations are smooth (no jumps)
- [ ] Camera moves smoothly between steps
- [ ] Swipe left goes to next step (mobile)
- [ ] Swipe right goes to previous step (mobile)
- [ ] Loading spinner shows while model loads
- [ ] No console errors

### Performance

- [ ] Maintains 30+ fps during animations
- [ ] No lag when switching steps
- [ ] Smooth on mobile device
- [ ] Memory doesn't grow on repeated navigation

### User Experience

- [ ] Animations feel natural and helpful
- [ ] Timing is appropriate (not too fast/slow)
- [ ] Camera angle shows relevant parts
- [ ] Swipe doesn't conflict with 3D rotation

---

## 🐛 Common Issues & Solutions

### Issue: "Object not found" warnings

**Solution:**

1. Open GLB in Blender
2. Check object names in outliner
3. Update `animation.objects[].name` to match exactly
4. Object names are case-sensitive!

### Issue: Animations are too fast/slow

**Solution:**

- Adjust `duration` values (1000ms = 1 second)
- Typical values: 500ms (quick), 1500ms (normal), 2500ms (slow)

### Issue: Swipe conflicts with 3D rotation

**Solution:**

- Reduce `delta` in swipe config (try 75 or 100)
- Set `preventScrollOnSwipe: true`
- Consider disabling swipe during active 3D interaction

### Issue: Camera doesn't move

**Solution:**

- Verify `cameraRef.current` exists
- Check `controlsRef.current` exists
- Ensure camera positions are valid numbers
- Check browser console for errors

---

## 📚 Next Steps

Once Phase 3 is complete:

1. **Phase 4: Content Creation**

   - Model remaining 9 cabinets
   - Create animations for all steps
   - Write complete descriptions

2. **Phase 5: Audio Integration**

   - Add AudioPlayer component
   - Record narrations
   - Sync with steps

3. **Phase 6: Admin Panel**
   - Build content management UI
   - 3D authoring tools
   - QR code generation

---

## 💡 Pro Tips

1. **Start Simple:** Test with 1-2 objects before adding complex sequences
2. **Use Console Logs:** Temporarily log object names to debug
3. **Test on Device:** Real mobile feels different than emulator
4. **Keep Animations Short:** Total <3 seconds per step
5. **Sequence Carefully:** Use `delay` to create nice reveals

---

## 🎉 You're Ready

Start with Step 1 and work through systematically. Don't skip the verification checklist!

**Estimated Time:** 2-3 hours for first implementation

**Questions?** Check [PHASE3_GUIDE.md](./PHASE3_GUIDE.md) for detailed explanations.

---

**Good luck!** 🚀
