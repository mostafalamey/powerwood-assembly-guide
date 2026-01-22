import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface AuthoringSceneViewerProps {
  modelPath?: string;
  selectedObject?: THREE.Object3D | null;
  transformMode?: "translate" | "rotate" | "scale";
  translationSnap?: number | null;
  rotationSnap?: number | null;
  scaleSnap?: number | null;
  onSceneReady?: (scene: THREE.Scene, camera: THREE.Camera) => void;
  onModelLoaded?: (model: THREE.Group) => void;
  onLoadProgress?: (progress: number) => void;
  onLoadError?: (error: Error) => void;
  onObjectSelected?: (object: THREE.Object3D | null) => void;
  onGetCameraState?: () => {
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null;
}

export default function AuthoringSceneViewer({
  modelPath,
  selectedObject,
  transformMode = "translate",
  translationSnap = 0.1,
  rotationSnap = THREE.MathUtils.degToRad(15),
  scaleSnap = null,
  onSceneReady,
  onModelLoaded,
  onLoadProgress,
  onLoadError,
  onObjectSelected,
  onGetCameraState,
}: AuthoringSceneViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const loadedModelRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const previousSelectedRef = useRef<THREE.Object3D | null>(null);
  const currentSelectionRef = useRef<THREE.Object3D | null>(null);
  const translationSnapRef = useRef<number | null>(translationSnap);
  const rotationSnapRef = useRef<number | null>(rotationSnap);
  const scaleSnapRef = useRef<number | null>(scaleSnap);
  const [isReady, setIsReady] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);

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

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.target.set(0, 0.45, 0);
    controlsRef.current = controls;

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

    transformControls.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;
      isDragging = event.value;

      if (event.value && transformControls.object) {
        // Start dragging - store initial transform
        startPosition = transformControls.object.position.clone();
        startRotation = transformControls.object.rotation.clone();
        justFinishedDragging = false;
      } else {
        // End dragging - clear stored values
        startPosition = null;
        startRotation = null;
        justFinishedDragging = true;
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
      if (!mountRef.current || !cameraRef.current || !loadedModelRef.current)
        return;

      // Don't select if we're currently dragging or just finished dragging
      if (isDragging || justFinishedDragging) return;

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

      // Check for model objects (filter out invisible objects)
      // Helper to check if object and all ancestors are visible
      const isFullyVisible = (obj: THREE.Object3D): boolean => {
        let current: THREE.Object3D | null = obj;
        while (current) {
          if (!current.visible) return false;
          current = current.parent;
        }
        return true;
      };

      const visibleMeshes: THREE.Object3D[] = [];
      loadedModelRef.current.traverse((child) => {
        // Only include meshes that are fully visible (including all parent visibility)
        if (child instanceof THREE.Mesh && isFullyVisible(child)) {
          visibleMeshes.push(child);
        }
      });

      const intersects = raycasterRef.current.intersectObjects(
        visibleMeshes,
        false, // Don't recurse since we already traversed
      );

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const currentlySelected = currentSelectionRef.current;

        // Dig-down functionality:
        // If clicking on a child of the currently selected object, select that child
        if (currentlySelected && clickedMesh.parent === currentlySelected) {
          currentSelectionRef.current = clickedMesh;
          if (onObjectSelected) {
            onObjectSelected(clickedMesh);
          }
        } else if (currentlySelected === clickedMesh) {
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
            onObjectSelected(targetObject);
          }
        }
      } else {
        // Clicked on empty space, deselect
        currentSelectionRef.current = null;
        if (onObjectSelected) {
          onObjectSelected(null);
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

  // Attach TransformControls to selected object
  useEffect(() => {
    if (transformControlsRef.current) {
      if (selectedObject) {
        transformControlsRef.current.attach(selectedObject);
      } else {
        transformControlsRef.current.detach();
      }
    }
  }, [selectedObject]);

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
        model.traverse((child) => {
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

        sceneRef.current.add(model);

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
    // Remove highlight from previously selected object
    if (previousSelectedRef.current) {
      previousSelectedRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.originalMaterial) {
          // Restore original material
          child.material = child.userData.originalMaterial;
          delete child.userData.originalMaterial;
        }
      });
    }

    // Add highlight to newly selected object
    if (selectedObject) {
      // If it's a mesh, highlight only that mesh
      // If it's a group, highlight all its children
      selectedObject.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material;
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhongMaterial
          ) {
            // Clone the material to avoid affecting other objects that share it
            const clonedMaterial = material.clone();
            // Store original material for restoration
            child.userData.originalMaterial = material;
            // Set highlight color (yellow glow)
            clonedMaterial.emissive = new THREE.Color(0xffff00);
            clonedMaterial.emissiveIntensity = 0.5;
            // Apply the cloned material
            child.material = clonedMaterial;
          }
        }
      });
    }

    previousSelectedRef.current = selectedObject;
  }, [selectedObject]);

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
}
