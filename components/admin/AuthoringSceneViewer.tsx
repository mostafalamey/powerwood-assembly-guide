import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { AnnotationInstance } from "@/types/animation";
import {
  loadAnnotationModel,
  applyAnnotationColor,
  createTextAnnotation,
  isAnnotationObjectId,
} from "@/lib/annotations";

export interface AuthoringSceneViewerRef {
  addAnnotation: (
    annotation: AnnotationInstance,
  ) => Promise<THREE.Object3D | null>;
  removeAnnotation: (annotationId: string) => void;
  updateAnnotationColor: (annotationId: string, color: string) => void;
  getAnnotationObject: (annotationId: string) => THREE.Object3D | null;
  frameObject: (object?: THREE.Object3D | null) => void;
}

interface AuthoringSceneViewerProps {
  modelPath?: string;
  selectedObject?: THREE.Object3D | null;
  selectedObjects?: THREE.Object3D[];
  transformMode?: "translate" | "rotate" | "scale";
  translationSnap?: number | null;
  rotationSnap?: number | null;
  scaleSnap?: number | null;
  annotationInstances?: AnnotationInstance[];
  onSceneReady?: (scene: THREE.Scene, camera: THREE.Camera) => void;
  onModelLoaded?: (model: THREE.Group) => void;
  onLoadProgress?: (progress: number) => void;
  onLoadError?: (error: Error) => void;
  onObjectSelected?: (
    object: THREE.Object3D | null,
    options?: { toggle?: boolean },
  ) => void;
  onAnnotationLoaded?: (annotationId: string, object: THREE.Object3D) => void;
  onGetCameraState?: () => {
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null;
}

const AuthoringSceneViewer = forwardRef<
  AuthoringSceneViewerRef,
  AuthoringSceneViewerProps
>(function AuthoringSceneViewer(
  {
    modelPath,
    selectedObject,
    selectedObjects,
    transformMode = "translate",
    translationSnap = 0.1,
    rotationSnap = THREE.MathUtils.degToRad(15),
    scaleSnap = null,
    annotationInstances = [],
    onSceneReady,
    onModelLoaded,
    onLoadProgress,
    onLoadError,
    onObjectSelected,
    onAnnotationLoaded,
    onGetCameraState,
  },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const loadedModelRef = useRef<THREE.Group | null>(null);
  const annotationObjectsRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const annotationsGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const previousSelectedSetRef = useRef<Set<THREE.Object3D>>(new Set());
  const currentSelectionRef = useRef<THREE.Object3D | null>(null);
  const selectedObjectsRef = useRef<THREE.Object3D[]>([]);
  const selectionPivotRef = useRef<THREE.Object3D | null>(null);
  const multiSelectionStateRef = useRef<{
    pivotStartPosition: THREE.Vector3;
    pivotStartQuaternion: THREE.Quaternion;
    pivotStartScale: THREE.Vector3;
    objectStates: Map<
      string,
      {
        object: THREE.Object3D;
        worldPosition: THREE.Vector3;
        worldQuaternion: THREE.Quaternion;
        worldScale: THREE.Vector3;
        parent: THREE.Object3D | null;
      }
    >;
  } | null>(null);
  const translationSnapRef = useRef<number | null>(translationSnap);
  const rotationSnapRef = useRef<number | null>(rotationSnap);
  const scaleSnapRef = useRef<number | null>(scaleSnap);
  const [isReady, setIsReady] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);

  useEffect(() => {
    if (selectedObjects && selectedObjects.length > 0) {
      selectedObjectsRef.current = selectedObjects;
    } else if (selectedObject) {
      selectedObjectsRef.current = [selectedObject];
    } else {
      selectedObjectsRef.current = [];
    }
  }, [selectedObjects, selectedObject]);

  useEffect(() => {
    if (selectedObject) {
      currentSelectionRef.current = selectedObject;
      return;
    }
    if (selectedObjects && selectedObjects.length > 0) {
      currentSelectionRef.current = selectedObjects[selectedObjects.length - 1];
      return;
    }
    currentSelectionRef.current = null;
  }, [selectedObject, selectedObjects]);

  // Expose annotation methods via ref
  useImperativeHandle(
    ref,
    () => ({
      addAnnotation: async (
        annotation: AnnotationInstance,
      ): Promise<THREE.Object3D | null> => {
        if (!sceneRef.current || !annotationsGroupRef.current) return null;

        // Validate annotation has required fields
        if (!annotation || !annotation.type || !annotation.id) {
          console.warn("Invalid annotation - missing type or id:", annotation);
          return null;
        }

        try {
          let object: THREE.Object3D;

          if (annotation.type === "text") {
            // Create text annotation
            const text = annotation.text?.en || "Text";
            object = createTextAnnotation(text, annotation.color, null);
          } else {
            // Load GLB annotation
            object = await loadAnnotationModel(annotation.type);
            applyAnnotationColor(object, annotation.color);
          }

          // Set name and user data for identification
          object.name = annotation.id;
          object.userData.isAnnotation = true;
          object.userData.annotationType = annotation.type;
          object.userData.annotationId = annotation.id;
          object.userData.annotationColor = annotation.color;

          // Position at scene center initially
          object.position.set(0, 0.5, 0);

          // Add to annotations group
          annotationsGroupRef.current.add(object);
          annotationObjectsRef.current.set(annotation.id, object);

          // Notify parent
          if (onAnnotationLoaded) {
            onAnnotationLoaded(annotation.id, object);
          }

          return object;
        } catch (error) {
          console.error("Error adding annotation:", error);
          return null;
        }
      },

      removeAnnotation: (annotationId: string) => {
        const object = annotationObjectsRef.current.get(annotationId);
        if (object && annotationsGroupRef.current) {
          // Dispose geometry and materials
          object.traverse((child: any) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m: any) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          });

          annotationsGroupRef.current.remove(object);
          annotationObjectsRef.current.delete(annotationId);

          // Deselect if this was selected
          if (currentSelectionRef.current === object) {
            currentSelectionRef.current = null;
            if (onObjectSelected) onObjectSelected(null);
          }
        }
      },

      updateAnnotationColor: (annotationId: string, color: string) => {
        const object = annotationObjectsRef.current.get(annotationId);
        if (object) {
          applyAnnotationColor(object, color);
          object.userData.annotationColor = color;
        }
      },

      getAnnotationObject: (annotationId: string): THREE.Object3D | null => {
        return annotationObjectsRef.current.get(annotationId) || null;
      },

      frameObject: (object?: THREE.Object3D | null) => {
        if (!object || !cameraRef.current || !controlsRef.current) return;

        const camera = cameraRef.current;
        const controls = controlsRef.current;
        const box = new THREE.Box3().setFromObject(object);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();

        if (box.isEmpty()) {
          object.getWorldPosition(center);
          const fallbackDirection = camera.position
            .clone()
            .sub(controls.target)
            .normalize();
          const direction =
            fallbackDirection.lengthSq() > 0
              ? fallbackDirection
              : new THREE.Vector3(1, 1, 1).normalize();
          const distance = camera.position.distanceTo(controls.target) || 2;
          camera.position.copy(center).add(direction.multiplyScalar(distance));
          controls.target.copy(center);
          controls.update();
          return;
        }

        box.getCenter(center);
        box.getSize(size);

        const maxSize = Math.max(size.x, size.y, size.z);
        const fov = THREE.MathUtils.degToRad(camera.fov);
        const fitDistance = maxSize / 2 / Math.tan(fov / 2);
        const paddedDistance = fitDistance * 1.3;
        const fallbackDirection = camera.position
          .clone()
          .sub(controls.target)
          .normalize();
        const direction =
          fallbackDirection.lengthSq() > 0
            ? fallbackDirection
            : new THREE.Vector3(1, 1, 1).normalize();

        camera.position
          .copy(center)
          .add(direction.multiplyScalar(paddedDistance));
        controls.target.copy(center);
        controls.update();
      },
    }),
    [onAnnotationLoaded, onObjectSelected],
  );

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    scene.fog = new THREE.Fog(0xf0f0f0, 10, 50);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      12,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(4, 1, 4);
    camera.lookAt(0, 0.45, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting - Enhanced for better visual quality
    // Hemisphere light for natural ambient lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemisphereLight.position.set(0, 0, 0);
    scene.add(hemisphereLight);

    // Main directional light (sun) with improved shadows
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 10, 7.5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -5;
    mainLight.shadow.camera.right = 5;
    mainLight.shadow.camera.top = 5;
    mainLight.shadow.camera.bottom = -5;
    mainLight.shadow.bias = -0.00005;
    mainLight.shadow.normalBias = 0.02;
    mainLight.shadow.radius = 2;
    scene.add(mainLight);

    // Fill light from the side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Rim light for edge highlighting
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0xcccccc, 0xeeeeee);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    // Ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    const selectionPivot = new THREE.Object3D();
    selectionPivot.name = "__selection_pivot__";
    scene.add(selectionPivot);
    selectionPivotRef.current = selectionPivot;

    // Annotations group - container for all annotation objects
    const annotationsGroup = new THREE.Group();
    annotationsGroup.name = "__annotations__";
    scene.add(annotationsGroup);
    annotationsGroupRef.current = annotationsGroup;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;
    controls.rotateSpeed = 0.5; // Reduced from default 1.0
    controls.panSpeed = 0.8; // Reduced from default 1.0
    controls.minDistance = 0.5;
    controls.maxDistance = 30;
    controls.target.set(0, 0.45, 0);
    controlsRef.current = controls;

    // Track orbit controls dragging to prevent selection on camera orbit/pan
    // We need to track actual mouse movement, not just start/end events
    let mouseDownPos = { x: 0, y: 0 };
    let didOrbitDrag = false;
    const DRAG_THRESHOLD = 5; // pixels

    renderer.domElement.addEventListener(
      "pointerdown",
      (event: PointerEvent) => {
        mouseDownPos = { x: event.clientX, y: event.clientY };
        didOrbitDrag = false;
      },
    );

    renderer.domElement.addEventListener(
      "pointermove",
      (event: PointerEvent) => {
        if (event.buttons > 0) {
          const dx = event.clientX - mouseDownPos.x;
          const dy = event.clientY - mouseDownPos.y;
          if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
            didOrbitDrag = true;
          }
        }
      },
    );

    // Camera update function for animation playback
    (window as any).__updateCamera = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
    };

    // Camera setter for animation playback
    (window as any).__setCameraState = (
      position: { x: number; y: number; z: number },
      target: { x: number; y: number; z: number },
    ) => {
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(position.x, position.y, position.z);
        controlsRef.current.target.set(target.x, target.y, target.z);
        controlsRef.current.update();
      }
    };

    // TransformControls setup
    const transformControls = new TransformControls(
      camera,
      renderer.domElement,
    );
    transformControls.setMode(transformMode);
    transformControls.setSize(0.8);
    // Don't use built-in snapping - we'll do custom relative snapping
    transformControls.setTranslationSnap(null);
    transformControls.setRotationSnap(rotationSnap);
    transformControls.setScaleSnap(scaleSnap);
    scene.add(transformControls);
    transformControlsRef.current = transformControls;

    // Custom relative snapping for translation
    let startPosition: THREE.Vector3 | null = null;
    let startRotation: THREE.Euler | null = null;
    let isDragging = false;
    let justFinishedDragging = false;

    transformControls.addEventListener("dragging-changed", (event: any) => {
      controls.enabled = !event.value;
      isDragging = event.value;

      if (event.value && transformControls.object) {
        // Start dragging - store initial transform
        startPosition = transformControls.object.position.clone();
        startRotation = transformControls.object.rotation.clone();
        justFinishedDragging = false;

        const selectionPivot = selectionPivotRef.current;
        if (selectionPivot && transformControls.object === selectionPivot) {
          selectionPivot.updateWorldMatrix(true, false);
          const pivotStartPosition = new THREE.Vector3();
          const pivotStartQuaternion = new THREE.Quaternion();
          const pivotStartScale = new THREE.Vector3();
          selectionPivot.getWorldPosition(pivotStartPosition);
          selectionPivot.getWorldQuaternion(pivotStartQuaternion);
          selectionPivot.getWorldScale(pivotStartScale);

          const objectStates = new Map<
            string,
            {
              object: THREE.Object3D;
              worldPosition: THREE.Vector3;
              worldQuaternion: THREE.Quaternion;
              worldScale: THREE.Vector3;
              parent: THREE.Object3D | null;
            }
          >();

          selectedObjectsRef.current.forEach((object) => {
            object.updateWorldMatrix(true, false);
            const worldPosition = new THREE.Vector3();
            const worldQuaternion = new THREE.Quaternion();
            const worldScale = new THREE.Vector3();
            object.getWorldPosition(worldPosition);
            object.getWorldQuaternion(worldQuaternion);
            object.getWorldScale(worldScale);
            objectStates.set(object.uuid, {
              object,
              worldPosition,
              worldQuaternion,
              worldScale,
              parent: object.parent,
            });
          });

          multiSelectionStateRef.current = {
            pivotStartPosition,
            pivotStartQuaternion,
            pivotStartScale,
            objectStates,
          };
        } else {
          multiSelectionStateRef.current = null;
        }
      } else {
        // End dragging - clear stored values
        startPosition = null;
        startRotation = null;
        justFinishedDragging = true;
        multiSelectionStateRef.current = null;
        // Clear the flag after a short delay to allow click event to be blocked
        setTimeout(() => {
          justFinishedDragging = false;
        }, 100);
      }
    });

    transformControls.addEventListener("objectChange", () => {
      if (!transformControls.object) return;

      // Apply relative translation snapping
      if (
        transformControls.mode === "translate" &&
        translationSnapRef.current &&
        startPosition
      ) {
        const obj = transformControls.object;
        const offset = obj.position.clone().sub(startPosition);
        const snapValue = translationSnapRef.current;

        // Snap each axis offset independently
        offset.x = Math.round(offset.x / snapValue) * snapValue;
        offset.y = Math.round(offset.y / snapValue) * snapValue;
        offset.z = Math.round(offset.z / snapValue) * snapValue;

        // Apply snapped position
        obj.position.copy(startPosition).add(offset);
      }

      const multiState = multiSelectionStateRef.current;
      const selectionPivot = selectionPivotRef.current;
      if (!multiState || !selectionPivot) return;

      selectionPivot.updateWorldMatrix(true, false);
      const currentPivotPosition = new THREE.Vector3();
      const currentPivotQuaternion = new THREE.Quaternion();
      const currentPivotScale = new THREE.Vector3();
      selectionPivot.getWorldPosition(currentPivotPosition);
      selectionPivot.getWorldQuaternion(currentPivotQuaternion);
      selectionPivot.getWorldScale(currentPivotScale);

      const deltaQuaternion = currentPivotQuaternion
        .clone()
        .multiply(multiState.pivotStartQuaternion.clone().invert());
      const deltaScale = new THREE.Vector3(
        multiState.pivotStartScale.x
          ? currentPivotScale.x / multiState.pivotStartScale.x
          : 1,
        multiState.pivotStartScale.y
          ? currentPivotScale.y / multiState.pivotStartScale.y
          : 1,
        multiState.pivotStartScale.z
          ? currentPivotScale.z / multiState.pivotStartScale.z
          : 1,
      );
      const translation = currentPivotPosition
        .clone()
        .sub(multiState.pivotStartPosition);

      multiState.objectStates.forEach((state) => {
        const offset = state.worldPosition
          .clone()
          .sub(multiState.pivotStartPosition);
        offset.applyQuaternion(deltaQuaternion);
        offset.set(
          offset.x * deltaScale.x,
          offset.y * deltaScale.y,
          offset.z * deltaScale.z,
        );

        const newWorldPosition = multiState.pivotStartPosition
          .clone()
          .add(offset)
          .add(translation);
        const newWorldQuaternion = deltaQuaternion
          .clone()
          .multiply(state.worldQuaternion);
        const newWorldScale = state.worldScale.clone().multiply(deltaScale);

        if (state.parent) {
          state.parent.updateWorldMatrix(true, false);
          const parentWorldQuaternion = new THREE.Quaternion();
          const parentWorldScale = new THREE.Vector3();
          state.parent.getWorldQuaternion(parentWorldQuaternion);
          state.parent.getWorldScale(parentWorldScale);

          const localPosition = state.parent.worldToLocal(
            newWorldPosition.clone(),
          );
          const localQuaternion = parentWorldQuaternion
            .clone()
            .invert()
            .multiply(newWorldQuaternion);
          const localScale = new THREE.Vector3(
            parentWorldScale.x
              ? newWorldScale.x / parentWorldScale.x
              : newWorldScale.x,
            parentWorldScale.y
              ? newWorldScale.y / parentWorldScale.y
              : newWorldScale.y,
            parentWorldScale.z
              ? newWorldScale.z / parentWorldScale.z
              : newWorldScale.z,
          );

          state.object.position.copy(localPosition);
          state.object.quaternion.copy(localQuaternion);
          state.object.scale.copy(localScale);
        } else {
          state.object.position.copy(newWorldPosition);
          state.object.quaternion.copy(newWorldQuaternion);
          state.object.scale.copy(newWorldScale);
        }
      });
    });

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight,
      );
    };
    window.addEventListener("resize", handleResize);

    // Handle click for object selection
    const handleClick = (event: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current) return;

      // Don't select if we're currently dragging or just finished dragging (transform controls)
      // or if we dragged the camera (orbit/pan)
      if (isDragging || justFinishedDragging || didOrbitDrag) return;

      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      // Get all intersections to check what's in front
      const allIntersects = raycasterRef.current.intersectObjects(
        scene.children,
        true,
      );

      // If the closest intersection is with the gizmo, ignore click
      if (allIntersects.length > 0 && transformControls.object) {
        const firstHit = allIntersects[0].object;
        // Check if first hit is part of transform controls
        let isGizmo = false;
        let current = firstHit;
        while (current) {
          if (current === transformControls) {
            isGizmo = true;
            break;
          }
          current = current.parent as any;
        }
        if (isGizmo) {
          return;
        }
      }

      // Build list of raycastable objects (model + annotations)
      const raycastTargets: THREE.Object3D[] = [];
      if (loadedModelRef.current) {
        raycastTargets.push(loadedModelRef.current);
      }
      if (annotationsGroupRef.current) {
        raycastTargets.push(annotationsGroupRef.current);
      }

      if (raycastTargets.length === 0) return;

      const intersects = raycasterRef.current.intersectObjects(
        raycastTargets,
        true,
      );

      const firstVisibleHit = intersects.find(
        (hit) => hit.object instanceof THREE.Mesh && hit.object.visible,
      );

      if (firstVisibleHit) {
        const clickedMesh = firstVisibleHit.object;
        const currentlySelected = currentSelectionRef.current;

        // Check if clicked on an annotation
        let annotationRoot: THREE.Object3D | null = null;
        let checkObj: THREE.Object3D | null = clickedMesh;
        while (checkObj) {
          if (checkObj.userData.isAnnotation) {
            annotationRoot = checkObj;
            break;
          }
          if (
            checkObj.parent === annotationsGroupRef.current ||
            checkObj.parent === null
          )
            break;
          checkObj = checkObj.parent;
        }

        if (annotationRoot) {
          // Clicked on annotation - select the annotation root
          currentSelectionRef.current = annotationRoot;
          if (onObjectSelected) {
            onObjectSelected(annotationRoot, { toggle: event.ctrlKey });
          }
          return;
        }

        // Not an annotation - handle model selection
        if (!loadedModelRef.current) return;

        // Dig-down functionality:
        // If clicking on a child of the currently selected object, select that child
        if (currentlySelected && clickedMesh.parent === currentlySelected) {
          currentSelectionRef.current = clickedMesh;
          if (onObjectSelected) {
            onObjectSelected(clickedMesh, { toggle: event.ctrlKey });
          }
        } else if (currentlySelected === clickedMesh) {
          if (event.ctrlKey && onObjectSelected) {
            onObjectSelected(clickedMesh, { toggle: true });
          }
          return;
        } else {
          // First click - select the parent group if it exists and has a name
          let targetObject = clickedMesh;
          if (
            clickedMesh.parent &&
            clickedMesh.parent !== loadedModelRef.current &&
            clickedMesh.parent.name
          ) {
            targetObject = clickedMesh.parent;
          }
          currentSelectionRef.current = targetObject;
          if (onObjectSelected) {
            onObjectSelected(targetObject, { toggle: event.ctrlKey });
          }
        }
      } else {
        // Clicked on empty space, deselect
        currentSelectionRef.current = null;
        if (onObjectSelected) {
          onObjectSelected(null, { toggle: event.ctrlKey });
        }
      }
    };

    renderer.domElement.addEventListener("click", handleClick);

    // Notify parent component
    setIsReady(true);
    if (onSceneReady) {
      onSceneReady(scene, camera);
    }

    // Setup camera state getter
    if (onGetCameraState) {
      const getCameraState = () => {
        if (!cameraRef.current || !controlsRef.current) return null;
        return {
          position: cameraRef.current.position.clone(),
          target: controlsRef.current.target.clone(),
        };
      };
      // Call it once to set up the reference
      onGetCameraState();
      // Store the getter for external use
      (window as any).__getCameraState = getCameraState;
    }

    // Cleanup
    return () => {
      // Cancel animation loop
      cancelAnimationFrame(animationFrameId);

      // Remove event listeners
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleClick);

      // Dispose controls
      controls.dispose();
      if (transformControls) {
        transformControls.dispose();
      }

      // Dispose all geometries and materials in the scene
      scene.traverse((object: any) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material: any) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      // Dispose renderer
      renderer.dispose();
      renderer.forceContextLoss();

      // Remove canvas from DOM
      if (
        mountRef.current &&
        renderer.domElement.parentNode === mountRef.current
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }

      // Clear references
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      transformControlsRef.current = null;
      annotationsGroupRef.current = null;
      selectionPivotRef.current = null;
      annotationObjectsRef.current.clear();
    };
  }, [onSceneReady]);

  // Update transform mode when it changes
  useEffect(() => {
    if (transformControlsRef.current) {
      transformControlsRef.current.setMode(transformMode);
    }
  }, [transformMode]);

  // Update snap settings when they change
  useEffect(() => {
    translationSnapRef.current = translationSnap;
    rotationSnapRef.current = rotationSnap;
    scaleSnapRef.current = scaleSnap;

    if (transformControlsRef.current) {
      // Only apply rotation and scale snap to built-in (translation is custom)
      transformControlsRef.current.setRotationSnap(rotationSnap);
      transformControlsRef.current.setScaleSnap(scaleSnap);
    }
  }, [translationSnap, rotationSnap, scaleSnap]);

  // Attach TransformControls to selected object or selection pivot
  useEffect(() => {
    const transformControls = transformControlsRef.current;
    if (!transformControls) return;

    const selection = selectedObjects?.length
      ? selectedObjects
      : selectedObject
        ? [selectedObject]
        : [];

    if (selection.length === 0) {
      transformControls.detach();
      return;
    }

    if (selection.length === 1) {
      transformControls.attach(selection[0]);
      return;
    }

    const selectionPivot = selectionPivotRef.current;
    if (!selectionPivot) return;

    const center = new THREE.Vector3();
    const tempCenter = new THREE.Vector3();
    const tempBox = new THREE.Box3();

    selection.forEach((object) => {
      tempBox.setFromObject(object);
      if (tempBox.isEmpty()) {
        object.getWorldPosition(tempCenter);
      } else {
        tempBox.getCenter(tempCenter);
      }
      center.add(tempCenter);
    });

    center.multiplyScalar(1 / selection.length);
    selectionPivot.position.copy(center);
    selectionPivot.rotation.set(0, 0, 0);
    selectionPivot.scale.set(1, 1, 1);
    selectionPivot.updateMatrixWorld();

    transformControls.attach(selectionPivot);
  }, [selectedObject, selectedObjects]);

  // Load GLB model when modelPath changes
  useEffect(() => {
    if (!modelPath || !sceneRef.current) return;

    let cancelled = false;

    const loadModel = async () => {
      setLoadingModel(true);
      setModelLoadProgress(0);

      const loader = new GLTFLoader();

      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            modelPath,
            (gltf) => resolve(gltf),
            (xhr) => {
              if (cancelled) return;
              const progress = xhr.total ? (xhr.loaded / xhr.total) * 100 : 0;
              setModelLoadProgress(progress);
              if (onLoadProgress) onLoadProgress(progress);
            },
            (error) => reject(error),
          );
        });

        if (cancelled) return;

        // Remove previous model if exists and dispose its resources
        if (loadedModelRef.current && sceneRef.current) {
          const oldModel = loadedModelRef.current;
          sceneRef.current.remove(oldModel);

          // Dispose old model's geometries and materials
          oldModel.traverse((child: any) => {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material: any) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
        }

        const model = gltf.scene;
        loadedModelRef.current = model;

        // Center and position model on ground
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());

        // Center horizontally and place on ground level
        model.position.x = -center.x;
        model.position.y = 0; // Place on ground level
        model.position.z = -center.z;

        // Enable shadows and customize materials
        model.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            // Only cast shadows if visible
            child.castShadow = child.visible;
            child.receiveShadow = true;

            // Customize materials based on name
            if (child.material) {
              const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];

              materials.forEach((mat: any) => {
                // Check both material name and mesh name
                const meshName = child.name?.toLowerCase() || "";
                const matName = mat.name?.toLowerCase() || "";

                if (meshName.includes("leg") || matName.includes("leg")) {
                  // Make legs darker grey
                  if (mat.color) {
                    mat.color.setRGB(0.8, 0.8, 0.8); // Dark grey
                  }
                } else if (
                  meshName.includes("panel") ||
                  matName.includes("panel")
                ) {
                  // Keep panels lighter - brighten by 20%
                  if (mat.color) {
                    mat.color.multiplyScalar(1.2);
                  }
                } else {
                  // Default: lighten other materials
                  if (mat.color) {
                    mat.color.multiplyScalar(1.4);
                  }
                }
                mat.needsUpdate = true;
              });
            }
          }
        });

        if (sceneRef.current) {
          sceneRef.current.add(model);
        }

        setLoadingModel(false);
        if (onModelLoaded) onModelLoaded(model);
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading model:", error);
        setLoadingModel(false);
        if (onLoadError) onLoadError(error as Error);
      }
    };

    loadModel();

    // Cleanup function to cancel loading if component unmounts
    return () => {
      cancelled = true;
    };
  }, [modelPath, onModelLoaded, onLoadProgress, onLoadError]);

  // Handle selection highlighting
  useEffect(() => {
    const nextSelection = new Set<THREE.Object3D>();
    if (selectedObjects && selectedObjects.length > 0) {
      selectedObjects.forEach((object) => nextSelection.add(object));
    } else if (selectedObject) {
      nextSelection.add(selectedObject);
    }

    const previousSelection = previousSelectedSetRef.current;

    previousSelection.forEach((object) => {
      if (nextSelection.has(object)) return;
      object.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.originalMaterial) {
          child.material = child.userData.originalMaterial;
          delete child.userData.originalMaterial;
        }
      });
    });

    nextSelection.forEach((object) => {
      if (previousSelection.has(object)) return;
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material;
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhongMaterial
          ) {
            if (!child.userData.originalMaterial) {
              child.userData.originalMaterial = material;
            }
            const clonedMaterial = material.clone();
            clonedMaterial.emissive = new THREE.Color(0xffff00);
            clonedMaterial.emissiveIntensity = 0.5;
            child.material = clonedMaterial;
          }
        }
      });
    });

    previousSelectedSetRef.current = nextSelection;
  }, [selectedObject, selectedObjects]);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Initializing 3D scene...
            </p>
          </div>
        </div>
      )}
      {loadingModel && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Loading model... {Math.round(modelLoadProgress)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default AuthoringSceneViewer;
