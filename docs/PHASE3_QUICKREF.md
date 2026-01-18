# Phase 3 - Quick Reference

> Quick reference for implementing the Step System animation features

---

## 🎯 What We're Building

**Goal:** Complete step navigation with smooth 3D animations that show/hide parts as users progress through assembly steps.

**Status:** 60% complete - Navigation works, need to add animations

---

## ✅ What's Already Done

- ✅ URL-based step routing (`/cabinet/BC-001/step/1`)
- ✅ StepNavigation component (progress bar, step list)
- ✅ Previous/Next buttons
- ✅ Step data structure in `cabinets.json`
- ✅ SceneViewer component with 3D rendering
- ✅ Mobile-optimized UI

---

## 🔨 What's Left To Do

### Week 5: Animation System

1. ✅ Define animation data format (TypeScript interfaces)
2. 🔄 Implement object visibility control
3. 🔄 Add smooth transitions (GSAP)
4. 🔄 Test with BC-001 multi-step assembly

### Week 6: UI Polish

5. 🔄 Generate step thumbnails from 3D
6. 🔄 Add swipe gestures for mobile
7. 🔄 Implement step completion tracking
8. 🔄 Add loading states

---

## 📋 Animation Data Format

### TypeScript Interfaces

```typescript
// Add to types/cabinet.ts

interface StepAnimation {
  objects: AnimatedObject[];
  camera?: CameraPosition;
  duration?: number;
}

interface AnimatedObject {
  name: string; // Object name in GLB
  visible: boolean; // Show/hide
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  duration?: number; // ms
  delay?: number; // ms
  easing?: "linear" | "easeInOut" | "easeOut" | "easeIn";
}

interface CameraPosition {
  position: [number, number, number];
  target: [number, number, number];
  duration?: number;
}
```

### Example JSON

```json
{
  "id": "step-1",
  "title": { "en": "Attach Back Panel", "ar": "..." },
  "description": { "en": "...", "ar": "..." },
  "model": "/models/BC-001.glb",
  "animation": {
    "objects": [
      {
        "name": "BackPanel",
        "visible": true,
        "position": [0, 0, 0],
        "duration": 1500,
        "easing": "easeOut"
      },
      {
        "name": "Screw_1",
        "visible": true,
        "delay": 500
      }
    ],
    "camera": {
      "position": [2, 1, 3],
      "target": [0, 0.5, 0],
      "duration": 1000
    }
  }
}
```

---

## 🔧 Key Code Changes

### 1. Install GSAP

```bash
npm install gsap @types/gsap
```

### 2. Update SceneViewer.tsx

```typescript
import gsap from "gsap";

// Add animation function
const applyStepAnimation = (animation: StepAnimation) => {
  animation.objects.forEach((animObj) => {
    const object = modelRef.current?.getObjectByName(animObj.name);
    if (!object) return;

    // Visibility with fade
    if (animObj.visible) {
      object.visible = true;
      gsap.fromTo(
        object.material,
        { opacity: 0 },
        { opacity: 1, duration: animObj.duration / 1000 }
      );
    }

    // Position animation
    if (animObj.position) {
      gsap.to(object.position, {
        x: animObj.position[0],
        y: animObj.position[1],
        z: animObj.position[2],
        duration: (animObj.duration || 1000) / 1000,
      });
    }
  });

  // Camera animation
  if (animation.camera) {
    gsap.to(cameraRef.current.position, {
      x: animation.camera.position[0],
      y: animation.camera.position[1],
      z: animation.camera.position[2],
      duration: 1,
    });
  }
};

// Apply on step change
useEffect(() => {
  if (currentStep?.animation) {
    applyStepAnimation(currentStep.animation);
  }
}, [currentStep]);
```

### 3. Add Swipe Gestures

```bash
npm install react-swipeable
```

```typescript
// In pages/cabinet/[id]/step/[stepId].tsx
import { useSwipeable } from "react-swipeable";

const handlers = useSwipeable({
  onSwipedLeft: () => goToNextStep(),
  onSwipedRight: () => goToPreviousStep(),
  delta: 50,
});

<div {...handlers}>
  <SceneViewer />
</div>;
```

---

## 🧪 Testing Checklist

### Navigation

- [ ] Step 1 → 2 → 3 forward navigation works
- [ ] Step 3 → 2 → 1 backward navigation works
- [ ] Jump from step 1 → 5 works
- [ ] URL changes on navigation
- [ ] Refresh page maintains current step

### Animations

- [ ] Objects appear/disappear smoothly
- [ ] Position animations are smooth (no jumps)
- [ ] Camera transitions are smooth
- [ ] No flickering
- [ ] Animations complete before next step

### Mobile

- [ ] Swipe left/right works
- [ ] Touch doesn't conflict with 3D rotation
- [ ] Progress bar updates
- [ ] UI fits on screen

### Performance

- [ ] 30+ fps during animations
- [ ] No memory leaks
- [ ] Quick step switching (<500ms)

---

## 📦 Deliverables

### End of Week 5

- ✅ Animation system working
- ✅ BC-001 has complete animation data
- ✅ Smooth transitions implemented
- ✅ Tests passing

### End of Week 6

- ✅ Swipe gestures working
- ✅ Step thumbnails generating
- ✅ Completion tracking implemented
- ✅ Loading states polished
- ✅ Ready for Phase 4

---

## 💡 Quick Tips

### Animation Timing

- Appearing objects: 1000-1500ms with easeOut
- Disappearing: 500-1000ms with easeIn
- Camera moves: 1000-2000ms with easeInOut
- Delay between sequential objects: 200-500ms

### Object Naming

- Use clear names in Blender: `BackPanel`, `Screw_1`, `Leg_FL`
- Avoid spaces, use underscores
- Group related objects: `Screw_1`, `Screw_2`, etc.

### Performance

- Keep animations short (total <3s per step)
- Limit simultaneous animations (max 3-5 objects)
- Test on real mobile devices
- Use loading states for model switching

---

## 📞 Need Help?

1. Check [PHASE3_GUIDE.md](./PHASE3_GUIDE.md) for detailed instructions
2. Review [PROGRESS.md](./PROGRESS.md) for current status
3. Consult [Three.js Animation Docs](https://threejs.org/docs/#manual/en/introduction/Animation-system)
4. Check [GSAP Docs](https://greensock.com/docs/)

---

**Next Step:** Install GSAP and implement animation system in SceneViewer.tsx 🚀
