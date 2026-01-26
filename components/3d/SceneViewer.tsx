import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  Step,
  StepAnimation,
  ObjectKeyframe,
  CameraKeyframe,
} from "@/types/cabinet";

interface SceneViewerProps {
  modelUrl: string;
  currentStep?: Step;
  cameraPosition?: { x: number; y: number; z: number };
  isPlaying?: boolean;
  shouldAutoStart?: boolean;
  height?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onAnimationComplete?: () => void;
}

export default function SceneViewer({
  modelUrl,
  currentStep,
  cameraPosition,
  isPlaying = false,
  shouldAutoStart = false,
  height = "100%",
  onLoad,
  onError,
  onAnimationComplete,
}: SceneViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const currentAnimationRef = useRef<StepAnimation | null>(null);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const hasAutoStartedRef = useRef(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const animationTimeRef = useRef(0);
  const hasCompletedRef = useRef(false);
  // Store original transforms for additive animations
  const originalTransformsRef = useRef<
    Map<
      string,
      { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }
    >
  >(new Map());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply initial state without animation (for step load) - sets animation at time 0
  const applyInitialState = useCallback((animation: StepAnimation) => {
    if (!modelRef.current || !animation) return;

    // Store animation and set time to 0 (initial state)
    currentAnimationRef.current = animation;
    setAnimationTime(0);
    animationTimeRef.current = 0;
    setIsAnimationPlaying(false);
    hasCompletedRef.current = false;
  }, []);

  // Apply step animation using lerp/slerp interpolation (matches editor system)
  const applyStepAnimation = useCallback((animation: StepAnimation) => {
    if (!modelRef.current || !animation) {
      return;
    }

    // No animation data - just reset and return
    if (
      (!animation.objectKeyframes || animation.objectKeyframes.length === 0) &&
      (!animation.cameraKeyframes || animation.cameraKeyframes.length === 0)
    ) {
      return;
    }

    // Store animation data for playback
    currentAnimationRef.current = animation;

    // Start animation playback at time 0
    setAnimationTime(0);
    animationTimeRef.current = 0;
    setIsAnimationPlaying(true);
    hasCompletedRef.current = false;
  }, []);

  useEffect(() => {
    animationTimeRef.current = animationTime;
  }, [animationTime]);

  // Helper to get object path/ID
  const getObjectId = (obj: any): string => {
    const parts: string[] = [];
    let current = obj;
    while (current && current !== modelRef.current) {
      if (current.name) parts.unshift(current.name);
      current = current.parent;
    }
    return parts.join("/") || obj.uuid;
  };

  // Apply animation at current time using lerp/slerp
  useEffect(() => {
    if (!modelRef.current || !currentAnimationRef.current) return;

    const animation = currentAnimationRef.current;

    // Helper function to find object by ID
    const findObjectById = (
      obj: THREE.Object3D,
      id: string,
    ): THREE.Object3D | null => {
      const objId = getObjectId(obj);
      if (objId === id) return obj;
      for (const child of obj.children) {
        const found = findObjectById(child, id);
        if (found) return found;
      }
      return null;
    };

    // Get unique object IDs
    const uniqueObjectIds = [
      ...new Set((animation.objectKeyframes || []).map((kf) => kf.objectId)),
    ];

    // Apply object transforms for each unique object
    uniqueObjectIds.forEach((objectId) => {
      const targetObj = findObjectById(modelRef.current!, objectId);
      if (!targetObj) return;

      // Get keyframes for this object sorted by time
      const objKeyframes = (animation.objectKeyframes || [])
        .filter((k) => k.objectId === objectId)
        .sort((a, b) => a.time - b.time);

      // Find the keyframes to interpolate between
      let prevKf: ObjectKeyframe | null = null;
      let nextKf: ObjectKeyframe | null = null;

      for (let i = 0; i < objKeyframes.length; i++) {
        if (objKeyframes[i].time <= animationTime) {
          prevKf = objKeyframes[i];
        }
        if (objKeyframes[i].time > animationTime && !nextKf) {
          nextKf = objKeyframes[i];
        }
      }

      // Apply transform based on keyframes
      if (prevKf && nextKf) {
        // Interpolate between keyframes
        const t = (animationTime - prevKf.time) / (nextKf.time - prevKf.time);

        // Lerp position
        targetObj.position.set(
          prevKf.transform.position.x +
            (nextKf.transform.position.x - prevKf.transform.position.x) * t,
          prevKf.transform.position.y +
            (nextKf.transform.position.y - prevKf.transform.position.y) * t,
          prevKf.transform.position.z +
            (nextKf.transform.position.z - prevKf.transform.position.z) * t,
        );

        // Slerp rotation (using quaternions)
        const prevQuat = new THREE.Quaternion();
        prevQuat.setFromEuler(
          new THREE.Euler(
            prevKf.transform.rotation.x,
            prevKf.transform.rotation.y,
            prevKf.transform.rotation.z,
          ),
        );
        const nextQuat = new THREE.Quaternion();
        nextQuat.setFromEuler(
          new THREE.Euler(
            nextKf.transform.rotation.x,
            nextKf.transform.rotation.y,
            nextKf.transform.rotation.z,
          ),
        );
        const interpolatedQuat = new THREE.Quaternion();
        interpolatedQuat.slerpQuaternions(prevQuat, nextQuat, t);
        targetObj.quaternion.copy(interpolatedQuat);

        // Lerp scale
        targetObj.scale.set(
          prevKf.transform.scale.x +
            (nextKf.transform.scale.x - prevKf.transform.scale.x) * t,
          prevKf.transform.scale.y +
            (nextKf.transform.scale.y - prevKf.transform.scale.y) * t,
          prevKf.transform.scale.z +
            (nextKf.transform.scale.z - prevKf.transform.scale.z) * t,
        );

        // Handle visibility with gradual opacity fade
        const prevVisible = prevKf.visible ?? true;
        const nextVisible = nextKf.visible ?? true;

        if (prevVisible !== nextVisible) {
          // Visibility is changing
          targetObj.visible = true; // Keep visible during fade
          targetObj.traverse((child: any) => {
            if (child.isMesh && child.material) {
              // Clone material if not already cloned to avoid affecting other objects
              if (!child.material.userData.isCloned) {
                child.material = child.material.clone();
                child.material.userData.isCloned = true;
              }
              // Ensure material supports transparency
              child.material.transparent = true;
              // Fade in: 0 -> 1, Fade out: 1 -> 0
              child.material.opacity = nextVisible ? t : 1 - t;
            }
          });
        } else {
          // Visibility not changing
          targetObj.visible = prevVisible;
          if (prevVisible) {
            // Ensure full opacity when visible
            targetObj.traverse((child: any) => {
              if (child.isMesh && child.material) {
                // Clone material if not already cloned
                if (!child.material.userData.isCloned) {
                  child.material = child.material.clone();
                  child.material.userData.isCloned = true;
                }
                child.material.transparent = true;
                child.material.opacity = 1;
              }
            });
          }
        }
      } else if (prevKf) {
        // Hold at last keyframe
        targetObj.position.set(
          prevKf.transform.position.x,
          prevKf.transform.position.y,
          prevKf.transform.position.z,
        );
        targetObj.rotation.set(
          prevKf.transform.rotation.x,
          prevKf.transform.rotation.y,
          prevKf.transform.rotation.z,
        );
        targetObj.scale.set(
          prevKf.transform.scale.x,
          prevKf.transform.scale.y,
          prevKf.transform.scale.z,
        );
        const visible = prevKf.visible ?? true;
        targetObj.visible = visible;
        // Set full opacity when visible, hide when not
        targetObj.traverse((child: any) => {
          if (child.isMesh && child.material) {
            // Clone material if not already cloned
            if (!child.material.userData.isCloned) {
              child.material = child.material.clone();
              child.material.userData.isCloned = true;
            }
            child.material.transparent = true;
            child.material.opacity = visible ? 1 : 0;
          }
        });
      }
    });

    // Apply camera transforms
    if (
      animation.cameraKeyframes &&
      animation.cameraKeyframes.length > 0 &&
      cameraRef.current &&
      controlsRef.current
    ) {
      // Get camera keyframes sorted by time
      const sortedCameraKfs = [...animation.cameraKeyframes].sort(
        (a, b) => a.time - b.time,
      );

      // Find the keyframes to interpolate between
      let prevKf: CameraKeyframe | null = null;
      let nextKf: CameraKeyframe | null = null;

      for (let i = 0; i < sortedCameraKfs.length; i++) {
        if (sortedCameraKfs[i].time <= animationTime) {
          prevKf = sortedCameraKfs[i];
        }
        if (sortedCameraKfs[i].time > animationTime && !nextKf) {
          nextKf = sortedCameraKfs[i];
        }
      }

      // Apply camera transform based on keyframes
      if (prevKf && nextKf) {
        // Interpolate between keyframes
        const t = (animationTime - prevKf.time) / (nextKf.time - prevKf.time);

        // Lerp camera position and target
        cameraRef.current.position.set(
          prevKf.position.x + (nextKf.position.x - prevKf.position.x) * t,
          prevKf.position.y + (nextKf.position.y - prevKf.position.y) * t,
          prevKf.position.z + (nextKf.position.z - prevKf.position.z) * t,
        );

        controlsRef.current.target.set(
          prevKf.target.x + (nextKf.target.x - prevKf.target.x) * t,
          prevKf.target.y + (nextKf.target.y - prevKf.target.y) * t,
          prevKf.target.z + (nextKf.target.z - prevKf.target.z) * t,
        );

        controlsRef.current.update();
      } else if (prevKf) {
        // Hold at last keyframe
        cameraRef.current.position.set(
          prevKf.position.x,
          prevKf.position.y,
          prevKf.position.z,
        );
        controlsRef.current.target.set(
          prevKf.target.x,
          prevKf.target.y,
          prevKf.target.z,
        );
        controlsRef.current.update();
      }
    }
  }, [animationTime]);

  // Animation playback loop
  useEffect(() => {
    if (!isAnimationPlaying || !currentAnimationRef.current) return;

    const animation = currentAnimationRef.current;
    const duration = animation.duration || 5; // Default 5 seconds

    let lastTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000; // Convert to seconds
      lastTime = now;

      const newTime = animationTimeRef.current + delta;
      const clampedTime = Math.min(newTime, duration);
      animationTimeRef.current = clampedTime;
      setAnimationTime(clampedTime);

      if (clampedTime >= duration && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        setIsAnimationPlaying(false);
        onAnimationComplete?.();
      }
    };

    const intervalId = setInterval(animate, 1000 / 60); // 60 FPS

    return () => clearInterval(intervalId);
  }, [isAnimationPlaying, onAnimationComplete]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    scene.fog = new THREE.Fog(0xf0f0f0, 10, 50);
    sceneRef.current = scene;

    // Camera setup
    const defaultCameraPos = cameraPosition || { x: 4, y: 1, z: 4 };
    const camera = new THREE.PerspectiveCamera(
      12,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(
      defaultCameraPos.x,
      defaultCameraPos.y,
      defaultCameraPos.z,
    );
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

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

    // Ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.45, 0);
    controls.update();
    controlsRef.current = controls;

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf: any) => {
        const model = gltf.scene;

        // Center and position model on ground
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());

        // Center horizontally
        model.position.x = -center.x;
        model.position.y = 0; // Place on ground level
        model.position.z = -center.z;

        // Enable shadows and customize materials
        model.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
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

        scene.add(model);
        modelRef.current = model;

        // Store original transforms for all named objects (for additive animations)
        originalTransformsRef.current.clear();
        model.traverse((child: any) => {
          if (child.name) {
            originalTransformsRef.current.set(child.name, {
              position: child.position.clone(),
              rotation: child.rotation.clone(),
              scale: child.scale.clone(),
            });
          }
        });

        // Apply initial step animation - handles all visibility
        if (currentStep?.animation) {
          // Use the applyInitialState function which uses keyframes
          applyInitialState(currentStep.animation);
        } else {
          // No animation, show everything
          model.traverse((child: any) => {
            child.visible = true;
          });
        }

        setIsLoading(false);
        onLoad?.();

        // Note: useEffect will handle applying animation when isLoading changes to false
      },
      undefined,
      (err: any) => {
        setError("Failed to load 3D model");
        setIsLoading(false);
        onError?.(err as Error);
      },
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  // Update camera position when prop changes
  useEffect(() => {
    if (cameraRef.current && cameraPosition) {
      cameraRef.current.position.set(
        cameraPosition.x,
        cameraPosition.y,
        cameraPosition.z,
      );
    }
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  }, [cameraPosition]);

  // Reset animation state when step changes
  useEffect(() => {
    hasAutoStartedRef.current = false;
    setAnimationTrigger(0); // Reset trigger counter on step change
    hasCompletedRef.current = false;
    animationTimeRef.current = 0;
  }, [currentStep]);

  // Apply step animation when step changes (if auto-start enabled) or when manually restarted
  useEffect(() => {
    if (currentStep?.animation && modelRef.current && !isLoading) {
      // Only run animation on manual restart (play button click), not on initial load
      const shouldAnimate = animationTrigger > 0;

      if (shouldAnimate) {
        // Small delay to ensure model is fully ready
        const timer = setTimeout(() => {
          applyStepAnimation(currentStep.animation!);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // Apply initial state without animation
        const timer = setTimeout(() => {
          applyInitialState(currentStep.animation!);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [
    currentStep,
    applyStepAnimation,
    applyInitialState,
    animationTrigger,
    isLoading,
    shouldAutoStart,
  ]);

  // Expose restart function via callback
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).restartStepAnimation = () => {
        setAnimationTrigger((prev) => prev + 1);
      };
    }
  }, []);

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading 3D model...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
