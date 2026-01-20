// Animation data structures for Phase 3 - Keyframe-based
export interface KeyframeObject {
  name: string; // Object name in GLB file
  visible?: boolean; // Show or hide this object
  position?: [number, number, number]; // Position [x, y, z]
  rotation?: [number, number, number]; // Rotation [x, y, z] in radians
  scale?: [number, number, number]; // Scale [x, y, z]
}

export interface AnimationKeyframe {
  time: number; // Time in milliseconds from start
  easing?: string; // Easing function (e.g., "power2.out", "linear")
  objects: KeyframeObject[]; // Object states at this keyframe
}

export interface CameraKeyframe {
  time: number; // Time in milliseconds from start
  position: [number, number, number]; // Camera position [x, y, z]
  target: [number, number, number]; // Camera look-at target [x, y, z]
  easing?: string; // Easing function
}

export interface StepAnimation {
  duration: number; // Total animation duration in milliseconds
  keyframes: AnimationKeyframe[]; // Array of keyframes
  camera?: {
    keyframes: CameraKeyframe[]; // Camera animation keyframes
  };
}

export interface Step {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  model?: string; // Optional - can inherit from cabinet
  cameraPosition?: { x: number; y: number; z: number };
  animation?: StepAnimation; // Optional animation data
  audioUrl?: { en: string; ar: string };
  tools?: string[];
  toolsRequired?: string[]; // Legacy field
  duration?: string | number;
  warnings?: { en: string; ar: string }[];
}

export interface Cabinet {
  id: string;
  name: { en: string; ar: string };
  category: string;
  model: string;
  description?: { en: string; ar: string };
  steps?: Step[]; // Optional since steps can be in separate file
  stepCount?: number; // Number of steps (for index view)
  tools?: { en: string[]; ar: string[] };
  estimatedTime?: string | number;
  image?: string;
}

// Separate file structure for cabinet steps/animations
export interface CabinetStepsData {
  id: string; // Cabinet ID
  steps: Step[];
}
