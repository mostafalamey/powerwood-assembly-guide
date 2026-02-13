export interface ObjectKeyframe {
  time: number;
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
  time: number;
  easing?: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  zoom?: number;
}

/**
 * Annotation instance in the scene.
 * Can be a GLB model (arrow, circle, etc.) or 3D text.
 */
export interface AnnotationInstance {
  id: string; // Unique identifier (UUID)
  type: string; // GLB filename without extension (e.g., "arrows") or "text"
  color: string; // Hex color string (e.g., "#ff0000")
  name?: string; // Display name for the annotation
  text?: { en: string; ar: string }; // For text annotations only
}

/**
 * Annotation catalog item representing an available annotation type.
 */
export interface AnnotationCatalogItem {
  id: string; // Filename without extension
  name: string; // Display name
  filename: string; // Full filename with extension
  type: "glb" | "text";
  thumbnail?: string; // Path to thumbnail image (e.g., "/models/annotations/arrow.png")
}

export interface LightingSettings {
  hemisphere: {
    skyColor: string;
    groundColor: string;
    intensity: number;
  };
  main: {
    color: string;
    intensity: number;
    position: { x: number; y: number; z: number };
  };
  fill: {
    color: string;
    intensity: number;
  };
  rim: {
    color: string;
    intensity: number;
  };
}

export interface StepAnimation {
  duration: number;
  isOffset?: boolean;
  objectKeyframes: ObjectKeyframe[];
  cameraKeyframes: CameraKeyframe[];
  annotationInstances?: AnnotationInstance[]; // Annotations in this step
  lightingSettings?: LightingSettings;
}
