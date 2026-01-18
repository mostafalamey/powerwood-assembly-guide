# Keyframe Animation System Documentation

**Last Updated:** January 17, 2026  
**Status:** ✅ Production Ready

---

## 🎯 Overview

The PWAssemblyGuide uses a **keyframe-based animation system** powered by GSAP, allowing precise control over object animations through JSON data. Each step can define multiple keyframes with exact timing, creating smooth transitions between assembly states.

---

## 📐 Architecture

### Core Components

#### 1. **SceneViewer.tsx**

The main animation engine that:

- Loads and stores 3D models
- Manages GSAP timeline animations
- Handles animation state with React hooks
- Applies keyframe transformations

#### 2. **Animation Data Structure**

```json
{
  "animation": {
    "keyframes": [
      {
        "time": 0,
        "objects": [
          {
            "name": "Bottom_Panel",
            "position": [0, -0.5, 0],
            "visible": true
          }
        ]
      },
      {
        "time": 1000,
        "objects": [
          {
            "name": "Bottom_Panel",
            "position": [0, 0, 0],
            "rotation": [0, 0, 0],
            "scale": [1, 1, 1]
          }
        ]
      }
    ],
    "camera": {
      "keyframes": [
        {
          "time": 0,
          "position": [2, 1.5, 2],
          "target": [0, 0.3, 0]
        }
      ]
    }
  }
}
```

---

## 🔧 Key Concepts

### 1. Keyframe Timing

Each keyframe has a `time` property in **milliseconds**:

- `time: 0` - Initial state (start of step)
- `time: 1000` - 1 second into animation
- `time: 5000` - 5 seconds into animation

**Important:** Keyframes are sorted by time and animations transition smoothly between consecutive keyframes.

### 2. GSAP Timeline Positioning

Animations are positioned at the **start time** (previous keyframe):

```typescript
// For keyframe at time=1000 following time=0
const startTime = 0; // Previous keyframe time
const endTime = 1000; // Current keyframe time
const duration = endTime - startTime; // 1000ms

tl.to(target, vars, startTime); // Position at 0, duration 1s
```

This ensures smooth transitions without jumps between keyframes.

### 3. Additive Transforms

All transforms are **offsets from original position**:

```json
{
  "name": "Leg_FR",
  "position": [0, 0.3, 0] // Move UP 0.3 units from original
}
```

**Benefits:**

- Reusable animations (symmetric parts like legs)
- Works with parent-child hierarchies
- Simpler to author (no need to calculate absolute positions)

**Original transforms** are stored when the model loads and preserved throughout the session.

### 4. Animation Trigger Mechanism

Uses **React state** to trigger re-renders:

```typescript
const [animationTrigger, setAnimationTrigger] = useState(0);

// Global function to restart animation
window.restartStepAnimation = () => {
  setAnimationTrigger((prev) => prev + 1);
};

// Effect watches for changes
useEffect(() => {
  if (animationTrigger > 0) {
    applyStepAnimation(animation);
  }
}, [animationTrigger, currentStep]);
```

**Why state instead of ref?**

- Refs (`useRef`) don't trigger re-renders when `.current` changes
- State changes trigger `useEffect` to re-run
- Animation plays on step navigation without page refresh

### 5. Duration Calculation

Total animation duration is calculated from the **maximum keyframe time**:

```typescript
const maxKeyframeTime = Math.max(
  ...animation.keyframes.map((kf) => kf.time),
  ...(animation.camera?.keyframes.map((kf) => kf.time) || [])
);
```

This ensures the Next button stays disabled for the entire animation.

### 6. Visibility Management

Objects can be shown/hidden at specific keyframes:

```json
{
  "name": "Side_Panel_L",
  "visible": true // or false
}
```

Visibility is applied **immediately** at each keyframe time.

---

## 📝 Data Structure Reference

### Step Animation Schema

```typescript
interface Animation {
  keyframes: AnimationKeyframe[];
  camera?: {
    keyframes: CameraKeyframe[];
  };
}

interface AnimationKeyframe {
  time: number; // Milliseconds from start
  objects: KeyframeObject[];
}

interface KeyframeObject {
  name: string; // Object name in 3D model
  position?: [number, number, number]; // [x, y, z] offset
  rotation?: [number, number, number]; // [x, y, z] radians
  scale?: [number, number, number]; // [x, y, z] multiplier
  visible?: boolean; // Show/hide object
}

interface CameraKeyframe {
  time: number;
  position: [number, number, number]; // Camera position
  target: [number, number, number]; // Look-at target
}
```

---

## 🎬 Animation Workflow

### On Step Load

1. Model is loaded and original transforms are stored
2. **Initial state** is applied from keyframe at `time: 0`
3. Animation trigger is reset to 0
4. Step waits for user to click play

### On Play Button Click

1. Audio player triggers `handleAudioPlayPause(true)`
2. Global function `restartStepAnimation()` is called
3. Animation trigger state increments: `setAnimationTrigger(prev => prev + 1)`
4. `useEffect` detects state change and runs animation
5. GSAP timeline animates all objects between keyframes
6. Next button is disabled for calculated duration
7. Animation completes, Next button re-enables

### On Step Navigation

1. New step data loads
2. Animation trigger resets to 0
3. Initial state (keyframe 0) is applied **without animation**
4. User clicks play to start animation

---

## 🛠️ Implementation Details

### applyInitialState()

Applies the first keyframe (`time: 0`) instantly:

- Sets positions, rotations, scales immediately
- No GSAP animation
- Used when loading a step or clicking previous/next

### applyStepAnimation()

Creates GSAP timeline for smooth transitions:

1. Kill all existing GSAP animations
2. Group keyframes by object name
3. For each object, create animation between consecutive keyframes
4. Position animations at previous keyframe time
5. Calculate duration as `endTime - startTime`
6. Apply camera animations if defined
7. Call `onAnimationComplete` after max duration

### Animation Cleanup

```typescript
// Kill all animations on object before starting new ones
gsap.killTweensOf(object);
gsap.killTweensOf(object.position);
gsap.killTweensOf(object.rotation);
gsap.killTweensOf(object.scale);
```

Prevents conflicts and double animations.

---

## 📋 Best Practices

### 1. Keyframe Authoring

- **Start at 0:** Always include a keyframe at `time: 0`
- **Smooth timing:** Space keyframes evenly for natural motion
- **Visibility first:** Set visibility at `time: 0` to control initial state

### 2. Object Naming

- Use descriptive names: `Bottom_Panel`, `Leg_FR`, `Side_Panel_L`
- Match exact names from 3D model
- Names are case-sensitive

### 3. Transform Values

- **Position:** Meters in 3D space (1.0 = 1 meter)
- **Rotation:** Radians (Math.PI = 180°)
- **Scale:** Multipliers (1.0 = original size)

### 4. Camera Positioning

- Position camera for optimal part visibility
- Animate camera for complex steps
- Keep target near assembly center

### 5. Performance

- Limit keyframes to essential transformations
- Use visibility instead of scale/position for instant changes
- Keep animation durations reasonable (2-10 seconds per step)

---

## 🐛 Troubleshooting

### Animation Not Playing After Step Navigation

**Issue:** Only audio plays, 3D model doesn't animate  
**Cause:** Using `useRef` instead of `useState` for animation trigger  
**Solution:** Use state to trigger re-renders (already implemented)

### Objects Jumping Between Keyframes

**Issue:** Animations jump instead of smooth transitions  
**Cause:** GSAP positioning at wrong time  
**Solution:** Position at `startTime` (previous keyframe), not `endTime`

### Next Button Enables Too Early

**Issue:** Button re-enables before animation finishes  
**Cause:** Duration calculation using old `animation.duration` field  
**Solution:** Calculate from max keyframe time (already implemented)

### Objects Not Found Warning

**Issue:** Console shows object name not found  
**Cause:** Name mismatch between JSON and 3D model  
**Solution:** Check exact object names in model (case-sensitive)

---

## 🔄 Migration from Old System

### Old Format (GSAP Object-Based)

```json
{
  "objects": [
    {
      "name": "Part",
      "position": [0, 0.3, 0],
      "duration": 800,
      "delay": 500
    }
  ],
  "duration": 2000
}
```

### New Format (Keyframe-Based)

```json
{
  "keyframes": [
    {
      "time": 0,
      "objects": [{ "name": "Part", "position": [0, 0, 0] }]
    },
    {
      "time": 500,
      "objects": [{ "name": "Part", "position": [0, 0, 0] }]
    },
    {
      "time": 1300,
      "objects": [{ "name": "Part", "position": [0, 0.3, 0] }]
    }
  ]
}
```

**Conversion:**

- `delay` → first keyframe time
- `delay + duration` → second keyframe time
- Start position goes in first keyframe
- End position goes in second keyframe

---

## 📊 File Structure

```folders
data/
├── cabinets-index.json       # Metadata only (fast loading)
├── cabinets-loader.ts         # Load individual cabinets
└── cabinets/
    ├── BC-002.json           # Full cabinet with animations
    └── [ID].json             # More cabinets...

scripts/
├── split-cabinets.js         # Extract cabinets to individual files
└── generate-cabinet-index.js # Rebuild index from individual files
```

**Benefits:**

- Individual cabinet files easier to edit
- Faster page loads (metadata vs. full data)
- Better version control (smaller diffs)
- Static export compatible (uses `require()`)

---

## ✅ Current Status

- ✅ Keyframe animation system fully implemented
- ✅ GSAP timeline positioning fixed
- ✅ Animation trigger using state (not ref)
- ✅ Duration calculated from keyframes
- ✅ Cabinet data split into individual files
- ✅ All console logs removed for clean console
- ✅ Production ready

---

## 📚 Related Documentation

- [Phase 3 Summary](./PHASE_3_SUMMARY.md) - Original GSAP implementation
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Overall project status
- [Getting Started Phase 3](./GETTING_STARTED_PHASE3.md) - Setup guide
- [GSAP Documentation](https://greensock.com/docs/) - Official GSAP docs
