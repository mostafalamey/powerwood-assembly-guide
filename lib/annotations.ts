import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnnotationCatalogItem, AnnotationInstance } from "@/types/animation";

// Cache for loaded annotation geometries
const annotationCache = new Map<string, THREE.Group>();

// Loader instance (reused)
let gltfLoader: GLTFLoader | null = null;

/**
 * Get or create the GLTF loader instance
 */
function getLoader(): GLTFLoader {
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();
  }
  return gltfLoader;
}

/**
 * Predefined annotation colors
 */
export const ANNOTATION_COLORS = [
  { name: "Red", hex: "#ef4444" },
  { name: "Orange", hex: "#f97316" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Green", hex: "#22c55e" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Pink", hex: "#ec4899" },
  { name: "White", hex: "#ffffff" },
  { name: "Gray", hex: "#6b7280" },
  { name: "Black", hex: "#1f2937" },
];

/**
 * Default annotation color
 */
export const DEFAULT_ANNOTATION_COLOR = "#ef4444"; // Red

/**
 * Fetch available annotation types from the API
 */
export async function fetchAnnotationCatalog(): Promise<
  AnnotationCatalogItem[]
> {
  try {
    const response = await fetch("/api/annotations");
    if (!response.ok) {
      throw new Error(`Failed to fetch annotations: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching annotation catalog:", error);
    // Return a default catalog with text type
    return [{ id: "text", name: "Text", filename: "", type: "text" }];
  }
}

/**
 * Load an annotation GLB model
 * Returns a cloned group that can be added to the scene
 */
export async function loadAnnotationModel(type: string): Promise<THREE.Group> {
  // Validate type parameter
  if (!type || type === "undefined") {
    throw new Error("Invalid annotation type: type must be a non-empty string");
  }

  // Check cache first
  const cached = annotationCache.get(type);
  if (cached) {
    return cached.clone();
  }

  // Load the GLB file
  const loader = getLoader();
  const path = `/models/annotations/${type}.glb`;

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf: GLTF) => {
        const model = gltf.scene;

        // Prepare model for annotation use
        model.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            // Ensure material can be colored
            if (child.material) {
              // Clone material to avoid affecting cached version
              child.material = (child.material as THREE.Material).clone();
            }
          }
        });

        // Cache the original
        annotationCache.set(type, model.clone());

        resolve(model);
      },
      undefined,
      (error: unknown) => {
        console.error(`Error loading annotation model ${type}:`, error);
        reject(error);
      },
    );
  });
}

/**
 * Apply a color to an annotation model
 */
export function applyAnnotationColor(
  object: THREE.Object3D,
  hexColor: string,
): void {
  const color = new THREE.Color(hexColor);

  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const material = child.material as THREE.MeshStandardMaterial;
      if (material.color) {
        material.color.copy(color);
      }
      // Also set emissive for better visibility
      if (material.emissive) {
        material.emissive.copy(color).multiplyScalar(0.2);
      }
    }
  });
}

/**
 * Create a 3D text annotation using a canvas sprite
 * This creates a billboard-style text that always faces the camera
 */
export function createTextAnnotation(
  text: string,
  color: string,
  _font: unknown = null, // Reserved for future font support
): THREE.Group {
  const group = new THREE.Group();

  // Create a canvas-based sprite for text
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    // Higher resolution for crisp text
    canvas.width = 512;
    canvas.height = 128;

    // Clear canvas with transparent background
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw text with background for visibility
    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    const padding = 16;
    context.font = "bold 48px Arial, sans-serif";
    const metrics = context.measureText(text);
    const textWidth = Math.min(metrics.width + padding * 2, canvas.width);
    const textHeight = 64;
    const x = (canvas.width - textWidth) / 2;
    const y = (canvas.height - textHeight) / 2;

    // Rounded rectangle background
    const radius = 8;
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + textWidth - radius, y);
    context.quadraticCurveTo(x + textWidth, y, x + textWidth, y + radius);
    context.lineTo(x + textWidth, y + textHeight - radius);
    context.quadraticCurveTo(
      x + textWidth,
      y + textHeight,
      x + textWidth - radius,
      y + textHeight,
    );
    context.lineTo(x + radius, y + textHeight);
    context.quadraticCurveTo(x, y + textHeight, x, y + textHeight - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.fill();

    // Draw text
    context.fillStyle = color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      sizeAttenuation: true,
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1, 0.25, 1);
    sprite.name = "textSprite";
    group.add(sprite);
  }

  return group;
}

/**
 * Generate a unique annotation ID
 */
export function generateAnnotationId(): string {
  return `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create annotation object ID for use in keyframes
 */
export function getAnnotationObjectId(annotationId: string): string {
  return annotationId.startsWith("annotation-")
    ? annotationId
    : `annotation-${annotationId}`;
}

/**
 * Check if an object ID is an annotation
 */
export function isAnnotationObjectId(objectId: string): boolean {
  return objectId.startsWith("annotation-");
}

/**
 * Create a new annotation instance
 */
export function createAnnotationInstance(
  type: string,
  name?: string,
  color?: string,
  text?: { en: string; ar: string },
): AnnotationInstance {
  return {
    id: generateAnnotationId(),
    type,
    color: color || DEFAULT_ANNOTATION_COLOR,
    name:
      name ||
      (type === "text" ? "Text" : type.charAt(0).toUpperCase() + type.slice(1)),
    text: type === "text" ? text || { en: "Text", ar: "نص" } : undefined,
  };
}

/**
 * Clear the annotation cache (useful for cleanup)
 */
export function clearAnnotationCache(): void {
  annotationCache.clear();
}
