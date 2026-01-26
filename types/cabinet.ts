// Animation data structures - Unified format for editor and viewer
export interface ObjectKeyframe {
  time: number; // Time in seconds from start
  objectId: string; // Object name or path in hierarchy
  transform: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  };
  visible?: boolean;
}

export interface CameraKeyframe {
  time: number; // Time in seconds from start
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  zoom?: number;
}

export interface StepAnimation {
  duration: number; // Total animation duration in seconds
  objectKeyframes: ObjectKeyframe[];
  cameraKeyframes: CameraKeyframe[];
}

export interface Step {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  model?: string; // Optional - can inherit from cabinet
  cameraPosition?: { x: number; y: number; z: number };
  animation?: StepAnimation; // Optional animation data
  audioUrl?: { en?: string; ar?: string };
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
