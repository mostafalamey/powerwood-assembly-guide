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
  const applyEasing = useCallback((t: number, easing?: string) => {
    const clamped = Math.max(0, Math.min(1, t));
    const easeOutBounce = (value: number) => {
      const n1 = 7.5625;
      const d1 = 2.75;

      if (value < 1 / d1) {
        return n1 * value * value;
      }
      if (value < 2 / d1) {
        const adjusted = value - 1.5 / d1;
        return n1 * adjusted * adjusted + 0.75;
      }
      if (value < 2.5 / d1) {
        const adjusted = value - 2.25 / d1;
        return n1 * adjusted * adjusted + 0.9375;
      }
      const adjusted = value - 2.625 / d1;
      return n1 * adjusted * adjusted + 0.984375;
    };
    const easeInBounce = (value: number) => 1 - easeOutBounce(1 - value);
    const easeInOutBounce = (value: number) =>
      value < 0.5
        ? (1 - easeOutBounce(1 - 2 * value)) / 2
        : (1 + easeOutBounce(2 * value - 1)) / 2;

    switch (easing) {
      case "easeInQuad":
      case "power2.in":
        return clamped * clamped;
      case "easeOutQuad":
      case "power2.out":
        return clamped * (2 - clamped);
      case "easeInOutQuad":
      case "power2.inOut":
        return clamped < 0.5
          ? 2 * clamped * clamped
          : -1 + (4 - 2 * clamped) * clamped;
      case "easeInCubic":
      case "power3.in":
        return clamped * clamped * clamped;
      case "easeOutCubic":
      case "power3.out":
        return 1 - Math.pow(1 - clamped, 3);
      case "easeInOutCubic":
      case "power3.inOut":
        return clamped < 0.5
          ? 4 * clamped * clamped * clamped
          : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
      case "easeInQuart":
      case "power4.in":
        return Math.pow(clamped, 4);
      case "easeOutQuart":
      case "power4.out":
        return 1 - Math.pow(1 - clamped, 4);
      case "easeInOutQuart":
      case "power4.inOut":
        return clamped < 0.5
          ? 8 * Math.pow(clamped, 4)
          : 1 - Math.pow(-2 * clamped + 2, 4) / 2;
      case "easeInQuint":
      case "power5.in":
        return Math.pow(clamped, 5);
      case "easeOutQuint":
      case "power5.out":
        return 1 - Math.pow(1 - clamped, 5);
      case "easeInOutQuint":
      case "power5.inOut":
        return clamped < 0.5
          ? 16 * Math.pow(clamped, 5)
          : 1 - Math.pow(-2 * clamped + 2, 5) / 2;
      case "easeInSine":
      case "sine.in":
        return 1 - Math.cos((clamped * Math.PI) / 2);
      case "easeOutSine":
      case "sine.out":
        return Math.sin((clamped * Math.PI) / 2);
      case "easeInOutSine":
      case "sine.inOut":
        return -(Math.cos(Math.PI * clamped) - 1) / 2;
      case "easeInExpo":
      case "expo.in":
        return clamped === 0 ? 0 : Math.pow(2, 10 * clamped - 10);
      case "easeOutExpo":
      case "expo.out":
        return clamped === 1 ? 1 : 1 - Math.pow(2, -10 * clamped);
      case "easeInOutExpo":
      case "expo.inOut":
        if (clamped === 0) return 0;
        if (clamped === 1) return 1;
        return clamped < 0.5
          ? Math.pow(2, 20 * clamped - 10) / 2
          : (2 - Math.pow(2, -20 * clamped + 10)) / 2;
      case "easeInCirc":
      case "circ.in":
        return 1 - Math.sqrt(1 - Math.pow(clamped, 2));
      case "easeOutCirc":
      case "circ.out":
        return Math.sqrt(1 - Math.pow(clamped - 1, 2));
      case "easeInOutCirc":
      case "circ.inOut":
        return clamped < 0.5
          ? (1 - Math.sqrt(1 - Math.pow(2 * clamped, 2))) / 2
          : (Math.sqrt(1 - Math.pow(-2 * clamped + 2, 2)) + 1) / 2;
      case "easeInBack":
      case "back.in":
        return (
          2.70158 * clamped * clamped * clamped - 1.70158 * clamped * clamped
        );
      case "easeOutBack":
      case "back.out":
        return (
          1 +
          2.70158 * Math.pow(clamped - 1, 3) +
          1.70158 * Math.pow(clamped - 1, 2)
        );
      case "easeInOutBack":
      case "back.inOut": {
        const c2 = 1.70158 * 1.525;
        return clamped < 0.5
          ? (Math.pow(2 * clamped, 2) * ((c2 + 1) * 2 * clamped - c2)) / 2
          : (Math.pow(2 * clamped - 2, 2) *
              ((c2 + 1) * (2 * clamped - 2) + c2) +
              2) /
              2;
      }
      case "easeInElastic":
      case "elastic.in": {
        const c4 = (2 * Math.PI) / 3;
        if (clamped === 0) return 0;
        if (clamped === 1) return 1;
        return (
          -Math.pow(2, 10 * clamped - 10) *
          Math.sin((clamped * 10 - 10.75) * c4)
        );
      }
      case "easeOutElastic":
      case "elastic.out": {
        const c4 = (2 * Math.PI) / 3;
        if (clamped === 0) return 0;
        if (clamped === 1) return 1;
        return (
          Math.pow(2, -10 * clamped) * Math.sin((clamped * 10 - 0.75) * c4) + 1
        );
      }
      case "easeInOutElastic":
      case "elastic.inOut": {
        const c5 = (2 * Math.PI) / 4.5;
        if (clamped === 0) return 0;
        if (clamped === 1) return 1;
        return clamped < 0.5
          ? -(
              Math.pow(2, 20 * clamped - 10) *
              Math.sin((20 * clamped - 11.125) * c5)
            ) / 2
          : (Math.pow(2, -20 * clamped + 10) *
              Math.sin((20 * clamped - 11.125) * c5)) /
              2 +
              1;
      }
      case "easeInBounce":
      case "bounce.in":
        return easeInBounce(clamped);
      case "easeOutBounce":
      case "bounce.out":
        return easeOutBounce(clamped);
      case "easeInOutBounce":
      case "bounce.inOut":
        return easeInOutBounce(clamped);
      case "linear":
      default:
        return clamped;
    }
  }, []);
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

  const normalizeAnimationToOffsets = useCallback(
    (animation: StepAnimation) => {
      if (!animation || animation.isOffset) return animation;
      if (originalTransformsRef.current.size === 0) return animation;

      const nextObjectKeyframes = (animation.objectKeyframes || []).map(
        (kf) => {
          const original = originalTransformsRef.current.get(kf.objectId);
          if (!original) return kf;

          return {
            ...kf,
            transform: {
              position: {
                x: kf.transform.position.x - original.position.x,
                y: kf.transform.position.y - original.position.y,
                z: kf.transform.position.z - original.position.z,
              },
              rotation: {
                x: kf.transform.rotation.x - original.rotation.x,
                y: kf.transform.rotation.y - original.rotation.y,
                z: kf.transform.rotation.z - original.rotation.z,
              },
              scale: { ...kf.transform.scale },
            },
          };
        },
      );

      return {
        ...animation,
        isOffset: true,
        objectKeyframes: nextObjectKeyframes,
      };
    },
    [],
  );

  // Apply initial state without animation (for step load) - sets animation at time 0
  const applyInitialState = useCallback(
    (animation: StepAnimation) => {
      if (!modelRef.current || !animation) return;

      const normalized = normalizeAnimationToOffsets(animation);

      // Store animation and set time to 0 (initial state)
      currentAnimationRef.current = normalized;
      setAnimationTime(0);
      animationTimeRef.current = 0;
      setIsAnimationPlaying(false);
      hasCompletedRef.current = false;
    },
    [normalizeAnimationToOffsets],
  );

  // Apply step animation using lerp/slerp interpolation (matches editor system)
  const applyStepAnimation = useCallback(
    (animation: StepAnimation) => {
      if (!modelRef.current || !animation) {
        return;
      }

      const normalized = normalizeAnimationToOffsets(animation);

      // No animation data - just reset and return
      if (
        (!normalized.objectKeyframes ||
          normalized.objectKeyframes.length === 0) &&
        (!normalized.cameraKeyframes || normalized.cameraKeyframes.length === 0)
      ) {
        return;
      }

      // Store animation data for playback
      currentAnimationRef.current = normalized;

      // Start animation playback at time 0
      setAnimationTime(0);
      animationTimeRef.current = 0;
      setIsAnimationPlaying(true);
      hasCompletedRef.current = false;
    },
    [normalizeAnimationToOffsets],
  );

  useEffect(() => {
    animationTimeRef.current = animationTime;
  }, [animationTime, applyEasing]);

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

      const original = originalTransformsRef.current.get(objectId);
      const basePosition = original?.position ?? new THREE.Vector3();
      const baseRotation = original?.rotation ?? new THREE.Euler();

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
        const t = applyEasing(
          (animationTime - prevKf.time) / (nextKf.time - prevKf.time),
          nextKf.easing,
        );

        const prevPosition = {
          x: basePosition.x + prevKf.transform.position.x,
          y: basePosition.y + prevKf.transform.position.y,
          z: basePosition.z + prevKf.transform.position.z,
        };
        const nextPosition = {
          x: basePosition.x + nextKf.transform.position.x,
          y: basePosition.y + nextKf.transform.position.y,
          z: basePosition.z + nextKf.transform.position.z,
        };
        const prevRotation = {
          x: baseRotation.x + prevKf.transform.rotation.x,
          y: baseRotation.y + prevKf.transform.rotation.y,
          z: baseRotation.z + prevKf.transform.rotation.z,
        };
        const nextRotation = {
          x: baseRotation.x + nextKf.transform.rotation.x,
          y: baseRotation.y + nextKf.transform.rotation.y,
          z: baseRotation.z + nextKf.transform.rotation.z,
        };

        // Lerp position
        targetObj.position.set(
          prevPosition.x + (nextPosition.x - prevPosition.x) * t,
          prevPosition.y + (nextPosition.y - prevPosition.y) * t,
          prevPosition.z + (nextPosition.z - prevPosition.z) * t,
        );

        // Slerp rotation (using quaternions)
        const prevQuat = new THREE.Quaternion();
        prevQuat.setFromEuler(
          new THREE.Euler(prevRotation.x, prevRotation.y, prevRotation.z),
        );
        const nextQuat = new THREE.Quaternion();
        nextQuat.setFromEuler(
          new THREE.Euler(nextRotation.x, nextRotation.y, nextRotation.z),
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
          basePosition.x + prevKf.transform.position.x,
          basePosition.y + prevKf.transform.position.y,
          basePosition.z + prevKf.transform.position.z,
        );
        targetObj.rotation.set(
          baseRotation.x + prevKf.transform.rotation.x,
          baseRotation.y + prevKf.transform.rotation.y,
          baseRotation.z + prevKf.transform.rotation.z,
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
        const t = applyEasing(
          (animationTime - prevKf.time) / (nextKf.time - prevKf.time),
          nextKf.easing,
        );

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

        // Store original transforms for all objects (for offset animations)
        originalTransformsRef.current.clear();
        model.traverse((child: any) => {
          const objectId = getObjectId(child);
          originalTransformsRef.current.set(objectId, {
            position: child.position.clone(),
            rotation: child.rotation.clone(),
            scale: child.scale.clone(),
          });
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
