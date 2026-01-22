export interface ObjectKeyframe {
  time: number;
  objectId: string; // Object name or path in hierarchy
  transform: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  };
  visible?: boolean;
}

export interface CameraKeyframe {
  time: number;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  zoom?: number;
}

export interface StepAnimation {
  duration: number;
  objectKeyframes: ObjectKeyframe[];
  cameraKeyframes: CameraKeyframe[];
}
