# Keyframe-Based Animation Architecture

## Overview

The animation system has been restructured from an object-based approach to a keyframe-based approach. This makes animations easier to read, maintain, and understand.

## Old Format (Object-Based)

Previously, animations were defined as an array of objects, where each object could appear multiple times with different delays and durations:

```json
{
  "animation": {
    "duration": 4500,
    "objects": [
      {
        "name": "BasePanel",
        "visible": true,
        "position": [0, -0.07, 0],
        "rotation": [0, 0, 0],
        "duration": 100,
        "delay": 0
      },
      {
        "name": "BasePanel",
        "position": [0, 0.2, 0],
        "duration": 1800,
        "delay": 500
      },
      {
        "name": "Leg_FR",
        "visible": false,
        "position": [0, -0.2, 0],
        "duration": 0,
        "delay": 0
      },
      {
        "name": "Leg_FR",
        "position": [0, 0, 0],
        "duration": 800,
        "delay": 500
      }
    ],
    "camera": {
      "position": [2.5, 0.8, 2.5],
      "target": [0, 0.2, 0],
      "duration": 1500
    }
  }
}
```

### Problems with Object-Based Approach

1. **Difficult to read** - The same object appears multiple times
2. **Hard to understand timing** - Have to calculate delay + duration for each entry
3. **Initial state unclear** - Hard to see what the scene looks like at t=0
4. **Redundant** - delay and duration on every object

## New Format (Keyframe-Based)

Animations are now defined as an array of keyframes, where each keyframe has a time and a list of object states:

```json
{
  "animation": {
    "duration": 4500,
    "keyframes": [
      {
        "time": 0,
        "objects": [
          {
            "name": "BasePanel",
            "visible": true,
            "position": [0, -0.07, 0],
            "rotation": [0, 0, 0]
          },
          {
            "name": "Leg_FR",
            "visible": false,
            "position": [0, -0.2, 0]
          },
          {
            "name": "Leg_FL",
            "visible": false
          }
        ]
      },
      {
        "time": 500,
        "easing": "power2.out",
        "objects": [
          {
            "name": "BasePanel",
            "position": [0, 0.2, 0]
          },
          {
            "name": "Leg_FR",
            "position": [0, 0, 0]
          }
        ]
      }
    ],
    "camera": {
      "keyframes": [
        {
          "time": 0,
          "position": [2.5, 0.8, 2.5],
          "target": [0, 0.2, 0]
        }
      ]
    }
  }
}
```

### Benefits of Keyframe-Based Approach

1. **Clear timeline** - Each keyframe has an explicit time value
2. **Easy initial state** - Keyframe 0 shows exactly what the scene looks like
3. **Better organization** - All objects at a given time are grouped together
4. **Simpler** - No need to calculate delay + duration
5. **Easing per keyframe** - Can specify different easing for each transition

## TypeScript Types

```typescript
export interface AnimationKeyframe {
  time: number; // Time in milliseconds
  easing?: string; // GSAP easing function (default: "power2.out")
  objects: KeyframeObject[];
}

export interface KeyframeObject {
  name: string;
  visible?: boolean;
  position?: [number, number, number]; // Additive offset from original
  rotation?: [number, number, number]; // Additive offset from original
  scale?: [number, number, number]; // Absolute scale
}

export interface CameraKeyframe {
  time: number; // Time in milliseconds
  easing?: string; // GSAP easing function
  position?: [number, number, number]; // Absolute camera position
  target?: [number, number, number]; // Absolute camera target (look-at point)
}

export interface StepAnimation {
  duration: number; // Total animation duration in milliseconds
  keyframes: AnimationKeyframe[];
  camera?: {
    keyframes: CameraKeyframe[];
  };
}
```

## How It Works

### 1. Initial State (applyInitialState)

When a step loads, the `applyInitialState` function is called, which:

- Takes the first keyframe (time: 0)
- Sets object visibility
- Sets object positions/rotations/scales instantly (no animation)
- Sets camera position/target if camera keyframes exist

This ensures the scene appears correctly before any animation plays.

### 2. Animation Playback (applyStepAnimation)

When the play button is clicked, the `applyStepAnimation` function:

- Groups objects by name across all keyframes
- Creates a GSAP timeline for each object
- Animates objects through their keyframes in order
- Calculates duration as the time difference between consecutive keyframes
- Applies easing per-keyframe

### 3. Camera Animation

Camera keyframes work the same way:

- Each keyframe defines camera position and/or target at a specific time
- Duration is calculated from time differences
- Easing can be specified per-keyframe

## Conversion from Old Format

The `scripts/convert-animations.js` script converts old object-based animations to keyframe-based:

1. Groups objects by their delay time (initial keyframe)
2. Creates end keyframes at delay + duration
3. Sorts keyframes by time
4. Handles camera animation

## Animation Behavior

- **Transforms are additive** - position/rotation offsets are added to original model transforms
- **Scale is absolute** - scale values replace the original scale
- **Visibility is instant** - visibility changes happen immediately at keyframe time
- **Duration calculated** - animation duration between keyframes is automatic based on time difference
- **Easing per transition** - each keyframe can specify easing for the transition TO that keyframe

## Example: Step 1 Animation

**Initial State (t=0)**:

- BasePanel visible at offset position [0, -0.07, 0]
- Leg_FR invisible at offset position [0, -0.2, 0]
- All other parts invisible

**At t=500ms**:

- BasePanel animates to position [0, 0.2, 0] (1.8s animation from t=0 to t=500 - wait that's wrong...)
- Actually: duration = 500 - 0 = 500ms
- Leg_FR animates to position [0, 0, 0]
- Both use "power2.out" easing

This is much clearer than the old format!

## Files Modified

1. **types/cabinet.ts** - Updated TypeScript interfaces
2. **components/3d/SceneViewer.tsx** - Rewrote animation functions to use keyframes
3. **data/cabinets.json** - Converted animation data to keyframe format
4. **scripts/convert-animations.js** - Created conversion utility

## Testing

1. Load a step - verify initial state shows correctly
2. Click play button - verify animation plays through all keyframes
3. Switch steps - verify initial state loads for new step
4. Restart animation - verify it plays from beginning

## Future Improvements

- Add keyframe editor UI for easier animation authoring
- Support visibility fade-in/fade-out animations
- Add animation preview in step editor
- Support animation loops/repeats
