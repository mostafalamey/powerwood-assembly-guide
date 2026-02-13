// Animation data structures - Unified format for editor and viewer
import { AnnotationInstance, LightingSettings } from "./animation";

export interface ObjectKeyframe {
  time: number; // Time in seconds from start
  objectId: string; // Object name or path in hierarchy
  easing?: string;
  transform: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  };
  visible?: boolean;
}

export interface CameraKeyframe {
  time: number; // Time in seconds from start
  easing?: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  zoom?: number;
}

export interface StepAnimation {
  duration: number; // Total animation duration in seconds
  isOffset?: boolean;
  objectKeyframes: ObjectKeyframe[];
  cameraKeyframes: CameraKeyframe[];
  annotationInstances?: AnnotationInstance[]; // Annotations in this step
  lightingSettings?: LightingSettings;
}

export interface Step {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  model?: string; // Optional - can inherit from assembly
  cameraPosition?: { x: number; y: number; z: number };
  animation?: StepAnimation; // Optional animation data
  audioUrl?: { en?: string; ar?: string };
  tools?: string[];
  toolsRequired?: string[]; // Legacy field
  duration?: string | number;
  warnings?: { en: string; ar: string }[];
}

export interface Assembly {
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

// Separate file structure for assembly steps/animations
export interface AssemblyStepsData {
  id: string; // Assembly ID
  steps: Step[];
}
