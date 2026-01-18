import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { Step, StepAnimation } from "@/types/cabinet";

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
  const animationMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const hasAutoStartedRef = useRef(false);
  // Store original transforms for additive animations
  const originalTransformsRef = useRef<
    Map<
      string,
      { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }
    >
  >(new Map());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply initial state without animation (for step load) - uses first keyframe
  const applyInitialState = useCallback((animation: StepAnimation) => {
    if (
      !modelRef.current ||
      !animation.keyframes ||
      animation.keyframes.length === 0
    )
      return;

    const firstKeyframe = animation.keyframes[0];

    firstKeyframe.objects.forEach((keyframeObj) => {
      const object = modelRef.current!.getObjectByName(keyframeObj.name);
      if (!object) {
        return;
      }

      // Get original transform
      const originalTransform = originalTransformsRef.current.get(
        keyframeObj.name,
      );
      if (!originalTransform) {
        return;
      }

      // Set visibility
      if (keyframeObj.visible !== undefined) {
        object.visible = keyframeObj.visible;
        object.traverse((child) => {
          child.visible = keyframeObj.visible!;
        });
      }

      // Apply position (additive to original)
      if (keyframeObj.position) {
        object.position.set(
          originalTransform.position.x + keyframeObj.position[0],
          originalTransform.position.y + keyframeObj.position[1],
          originalTransform.position.z + keyframeObj.position[2],
        );
      } else {
        object.position.copy(originalTransform.position);
      }

      // Apply rotation (additive to original)
      if (keyframeObj.rotation) {
        object.rotation.set(
          originalTransform.rotation.x + keyframeObj.rotation[0],
          originalTransform.rotation.y + keyframeObj.rotation[1],
          originalTransform.rotation.z + keyframeObj.rotation[2],
        );
      } else {
        object.rotation.copy(originalTransform.rotation);
      }

      // Apply scale
      if (keyframeObj.scale) {
        object.scale.set(
          keyframeObj.scale[0],
          keyframeObj.scale[1],
          keyframeObj.scale[2],
        );
      } else {
        object.scale.copy(originalTransform.scale);
      }
    });

    // Apply camera initial state if keyframes exist
    if (
      animation.camera?.keyframes &&
      animation.camera.keyframes.length > 0 &&
      cameraRef.current &&
      controlsRef.current
    ) {
      const firstCameraKeyframe = animation.camera.keyframes[0];

      if (firstCameraKeyframe.position) {
        cameraRef.current.position.set(
          firstCameraKeyframe.position[0],
          firstCameraKeyframe.position[1],
          firstCameraKeyframe.position[2],
        );
      }

      if (firstCameraKeyframe.target) {
        controlsRef.current.target.set(
          firstCameraKeyframe.target[0],
          firstCameraKeyframe.target[1],
          firstCameraKeyframe.target[2],
        );
        controlsRef.current.update();
      }
    }
  }, []);

  // Apply step animation using GSAP with keyframes
  const applyStepAnimation = useCallback(
    (animation: StepAnimation) => {
      if (
        !modelRef.current ||
        !animation.keyframes ||
        animation.keyframes.length === 0
      ) {
        return;
      }

      // Kill all active GSAP animations
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          gsap.killTweensOf(child);
          gsap.killTweensOf(child.position);
          gsap.killTweensOf(child.rotation);
          gsap.killTweensOf(child.scale);
          if (child instanceof THREE.Mesh && child.material) {
            gsap.killTweensOf(child.material);
          }
        });
      }

      // Group objects by name to track their keyframes
      const objectKeyframes = new Map<
        string,
        Array<{ time: number; data: any; easing?: string }>
      >();

      animation.keyframes.forEach((keyframe) => {
        keyframe.objects.forEach((obj) => {
          if (!objectKeyframes.has(obj.name)) {
            objectKeyframes.set(obj.name, []);
          }
          objectKeyframes.get(obj.name)!.push({
            time: keyframe.time,
            data: obj,
            easing: keyframe.easing,
          });
        });
      });

      // Animate each object through its keyframes
      objectKeyframes.forEach((keyframes, objectName) => {
        const object = modelRef.current!.getObjectByName(objectName);
        if (!object) {
          return;
        }

        const original = originalTransformsRef.current.get(objectName);
        if (!original) {
          return;
        }

        // Sort keyframes by time
        keyframes.sort((a, b) => a.time - b.time);

        // Create GSAP timeline for this object
        const tl = gsap.timeline();

        keyframes.forEach((kf, index) => {
          const prevKf = keyframes[index - 1];
          const startTime = prevKf ? prevKf.time / 1000 : 0;
          const endTime = kf.time / 1000;
          const duration = endTime - startTime;
          const easing = kf.easing || "power2.out";

          // Handle visibility at exact keyframe time
          if (kf.data.visible !== undefined) {
            tl.call(
              () => {
                object.visible = kf.data.visible;
                object.traverse((child) => {
                  child.visible = kf.data.visible;
                });
              },
              undefined,
              endTime,
            );
          }

          // Handle position - animate FROM previous keyframe TO this keyframe
          if (kf.data.position && duration > 0) {
            const targetPos = {
              x: original.position.x + kf.data.position[0],
              y: original.position.y + kf.data.position[1],
              z: original.position.z + kf.data.position[2],
            };
            tl.to(
              object.position,
              { ...targetPos, duration, ease: easing },
              startTime,
            );
          } else if (kf.data.position && index === 0) {
            // First keyframe - instant position
            tl.set(
              object.position,
              {
                x: original.position.x + kf.data.position[0],
                y: original.position.y + kf.data.position[1],
                z: original.position.z + kf.data.position[2],
              },
              endTime,
            );
          }

          // Handle rotation - animate FROM previous keyframe TO this keyframe
          if (kf.data.rotation && duration > 0) {
            const targetRot = {
              x: original.rotation.x + kf.data.rotation[0],
              y: original.rotation.y + kf.data.rotation[1],
              z: original.rotation.z + kf.data.rotation[2],
            };
            tl.to(
              object.rotation,
              { ...targetRot, duration, ease: easing },
              startTime,
            );
          } else if (kf.data.rotation && index === 0) {
            // First keyframe - instant rotation
            tl.set(
              object.rotation,
              {
                x: original.rotation.x + kf.data.rotation[0],
                y: original.rotation.y + kf.data.rotation[1],
                z: original.rotation.z + kf.data.rotation[2],
              },
              endTime,
            );
          }

          // Handle scale - animate FROM previous keyframe TO this keyframe
          if (kf.data.scale && duration > 0) {
            tl.to(
              object.scale,
              {
                x: kf.data.scale[0],
                y: kf.data.scale[1],
                z: kf.data.scale[2],
                duration,
                ease: easing,
              },
              startTime,
            );
          } else if (kf.data.scale && index === 0) {
            // First keyframe - instant scale
            tl.set(
              object.scale,
              {
                x: kf.data.scale[0],
                y: kf.data.scale[1],
                z: kf.data.scale[2],
              },
              endTime,
            );
          }
        });
      });

      // Animate camera if keyframes exist
      if (
        animation.camera?.keyframes &&
        animation.camera.keyframes.length > 0 &&
        cameraRef.current &&
        controlsRef.current
      ) {
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        const sortedKeyframes = [...animation.camera.keyframes].sort(
          (a, b) => a.time - b.time,
        );
        const tl = gsap.timeline();

        sortedKeyframes.forEach((kf, index) => {
          const prevKf = sortedKeyframes[index - 1];
          const startTime = prevKf ? prevKf.time / 1000 : 0;
          const endTime = kf.time / 1000;
          const duration = endTime - startTime;
          const easing = kf.easing || "power2.out";

          // Animate position FROM previous keyframe TO this keyframe
          if (kf.position && duration > 0) {
            tl.to(
              camera.position,
              {
                x: kf.position[0],
                y: kf.position[1],
                z: kf.position[2],
                duration,
                ease: easing,
              },
              startTime,
            );
          } else if (kf.position && index === 0) {
            // First keyframe - instant position
            tl.set(
              camera.position,
              {
                x: kf.position[0],
                y: kf.position[1],
                z: kf.position[2],
              },
              endTime,
            );
          }

          // Animate target FROM previous keyframe TO this keyframe
          if (kf.target && duration > 0) {
            tl.to(
              controls.target,
              {
                x: kf.target[0],
                y: kf.target[1],
                z: kf.target[2],
                duration,
                ease: easing,
                onUpdate: () => {
                  controls.update();
                },
              },
              startTime,
            );
          } else if (kf.target && index === 0) {
            // First keyframe - instant target
            tl.call(
              () => {
                controls.target.set(kf.target[0], kf.target[1], kf.target[2]);
                controls.update();
              },
              undefined,
              endTime,
            );
          }
        });
      }

      // Calculate total animation duration from keyframes and call onAnimationComplete when done
      let maxKeyframeTime = 0;

      // Find the maximum time from object keyframes
      animation.keyframes.forEach((kf) => {
        if (kf.time > maxKeyframeTime) {
          maxKeyframeTime = kf.time;
        }
      });

      // Check camera keyframes too
      if (animation.camera?.keyframes) {
        animation.camera.keyframes.forEach((kf) => {
          if (kf.time > maxKeyframeTime) {
            maxKeyframeTime = kf.time;
          }
        });
      }

      const totalDuration = maxKeyframeTime || animation.duration || 2500;

      setTimeout(() => {
        onAnimationComplete?.();
      }, totalDuration);
    },
    [onAnimationComplete],
  );

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

        // Setup animation mixer if animations exist
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          animationMixerRef.current = mixer;

          // Play the first animation by default if isPlaying is true
          if (isPlaying && gltf.animations[0]) {
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
          }
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

  // Control animation playback
  useEffect(() => {
    if (!animationMixerRef.current) return;

    const mixer = animationMixerRef.current;
    const actions = (mixer as any)._actions || [];

    if (actions.length > 0) {
      const action = actions[0];
      if (isPlaying) {
        action.paused = false;
        action.play();
      } else {
        action.paused = true;
      }
    }
  }, [isPlaying]);

  // Reset animation state when step changes
  useEffect(() => {
    hasAutoStartedRef.current = false;
    setAnimationTrigger(0); // Reset trigger counter on step change
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
