import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import * as THREE from "three";
import {
  ArrowLeft,
  Move,
  RotateCw,
  Maximize2,
  SlidersHorizontal,
  Undo,
  Redo,
  MessageSquarePlus,
  Save,
  Box,
  CheckCircle2,
  Loader2,
  Code2,
  Upload,
  AlertCircle,
  Hand,
  Copy,
  ClipboardPaste,
  Grid3x3,
  Trash2,
  Clock,
  Focus,
} from "lucide-react";
import AdminLayout from "../../../../../components/admin/AdminLayout";
import AuthGuard from "../../../../../components/admin/AuthGuard";
import AuthoringSceneViewer, {
  AuthoringSceneViewerRef,
} from "../../../../../components/admin/AuthoringSceneViewer";
import ObjectHierarchyTree from "../../../../../components/admin/ObjectHierarchyTree";
import Timeline from "../../../../../components/admin/Timeline";
import { AnnotationToolbar } from "../../../../../components/admin/AnnotationToolbar";
import { useToast } from "../../../../../components/admin/ToastProvider";
import {
  ObjectKeyframe,
  CameraKeyframe,
  StepAnimation,
  AnnotationInstance,
} from "../../../../../types/animation";
import {
  isAnnotationObjectId,
  ANNOTATION_COLORS,
} from "../../../../../lib/annotations";

export default function StepAuthoringPage() {
  const toast = useToast();
  const router = useRouter();
  const { id, step } = router.query;
  const [sceneReady, setSceneReady] = useState(false);
  const [modelPath, setModelPath] = useState<string | undefined>(undefined);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [assembly, setAssembly] = useState<any>(null);
  const loadedModelRef = useRef<any>(null);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(
    null,
  );
  const [selectedObjects, setSelectedObjects] = useState<THREE.Object3D[]>([]);
  const selectedObjectsRef = useRef<THREE.Object3D[]>([]);
  const [transformMode, setTransformMode] = useState<
    "translate" | "rotate" | "scale"
  >("translate");
  const [translationSnapEnabled, setTranslationSnapEnabled] = useState(true);
  const [rotationSnapEnabled, setRotationSnapEnabled] = useState(true);
  const [translationSnapValue, setTranslationSnapValue] = useState(0.1); // 10cm default
  const [rotationSnapValue, setRotationSnapValue] = useState(15); // 15 degrees default
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(5); // 5 seconds default
  const [isPlaying, setIsPlaying] = useState(false);
  const [objectKeyframes, setObjectKeyframes] = useState<ObjectKeyframe[]>([]);
  const [cameraKeyframes, setCameraKeyframes] = useState<CameraKeyframe[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [useAudioSync, setUseAudioSync] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedKeyframeTime, setSelectedKeyframeTime] = useState<
    number | null
  >(null);
  const [snapDropdownOpen, setSnapDropdownOpen] = useState(false);
  const snapDropdownRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState({});
  const [bulkShiftSeconds, setBulkShiftSeconds] = useState(0.25);
  const [isOffsetAnimation, setIsOffsetAnimation] = useState(false);
  const hasConvertedOffsetsRef = useRef(false);
  const originalTransformsRef = useRef<
    Map<
      string,
      { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }
    >
  >(new Map());
  const objectLookupRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const tempPrevQuatRef = useRef(new THREE.Quaternion());
  const tempNextQuatRef = useRef(new THREE.Quaternion());
  const tempInterpolatedQuatRef = useRef(new THREE.Quaternion());
  const [historyPast, setHistoryPast] = useState<
    {
      objectKeyframes: ObjectKeyframe[];
      cameraKeyframes: CameraKeyframe[];
      duration: number;
      selectedKeyframeTime: number | null;
      currentTime: number;
    }[]
  >([]);
  const [historyFuture, setHistoryFuture] = useState<
    {
      objectKeyframes: ObjectKeyframe[];
      cameraKeyframes: CameraKeyframe[];
      duration: number;
      selectedKeyframeTime: number | null;
      currentTime: number;
    }[]
  >([]);
  const isRestoringHistoryRef = useRef(false);
  const copiedKeyframeRef = useRef<
    | {
        type: "object";
        data: Pick<ObjectKeyframe, "transform" | "visible" | "easing">;
      }
    | {
        type: "camera";
        data: Pick<CameraKeyframe, "position" | "target" | "easing">;
      }
    | null
  >(null);
  const [copiedKeyframeType, setCopiedKeyframeType] = useState<
    "object" | "camera" | null
  >(null);

  // Annotation state
  const [annotationInstances, setAnnotationInstances] = useState<
    AnnotationInstance[]
  >([]);
  const [showAnnotationToolbar, setShowAnnotationToolbar] = useState(false);
  const sceneViewerRef = useRef<AuthoringSceneViewerRef>(null);

  useEffect(() => {
    selectedObjectsRef.current = selectedObjects;
  }, [selectedObjects]);

  const objectKeyframesById = useMemo(() => {
    const map = new Map<string, ObjectKeyframe[]>();
    for (const kf of objectKeyframes) {
      const list = map.get(kf.objectId);
      if (list) {
        list.push(kf);
      } else {
        map.set(kf.objectId, [kf]);
      }
    }
    map.forEach((list) => list.sort((a, b) => a.time - b.time));
    return map;
  }, [objectKeyframes]);

  const uniqueObjectIds = useMemo(
    () => Array.from(objectKeyframesById.keys()),
    [objectKeyframesById],
  );

  const sortedCameraKeyframes = useMemo(
    () => [...cameraKeyframes].sort((a, b) => a.time - b.time),
    [cameraKeyframes],
  );

  // Fetch assembly data to get the model path
  useEffect(() => {
    if (!id) return;

    const fetchAssembly = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(
          `/api/assemblies?id=${id}&_=${Date.now()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (response.ok) {
          const data = await response.json();
          setAssembly(data);
          // Auto-load the assembly's 3D model if it has one
          if (data.model) {
            setModelPath(data.model);
          }

          if (step && data.steps) {
            const stepData = data.steps.find((s: any) => s.id === step);
            const nextAudioUrl =
              stepData?.audioUrl?.en || stepData?.audioUrl?.ar || null;
            setAudioUrl(nextAudioUrl);
          }
        }
      } catch (err) {
        console.error("Error loading assembly:", err);
      }
    };

    fetchAssembly();
  }, [id]);

  const handleSceneReady = useCallback((scene: any, camera: any) => {
    setSceneReady(true);
  }, []);

  const handleModelLoaded = useCallback((model: any) => {
    setModelLoaded(true);
    setLoadError(null);
    loadedModelRef.current = model;
    originalTransformsRef.current.clear();
    objectLookupRef.current.clear();
    model.traverse((child: any) => {
      const objectId = getObjectId(child);
      originalTransformsRef.current.set(objectId, {
        position: child.position.clone(),
        rotation: child.rotation.clone(),
        scale: child.scale.clone(),
      });
      objectLookupRef.current.set(objectId, child);
    });
    forceUpdate({}); // Force one update to show the tree
  }, []);

  const handleLoadError = useCallback((error: Error) => {
    setLoadError(error.message);
    setModelLoaded(false);
  }, []);

  const handleSelectObject = useCallback(
    (object: THREE.Object3D | null, options?: { toggle?: boolean }) => {
      if (!object) {
        if (!options?.toggle) {
          selectedObjectsRef.current = [];
          setSelectedObjects([]);
          setSelectedObject(null);
        }
        return;
      }

      if (options?.toggle) {
        const previous = selectedObjectsRef.current;
        const exists = previous.includes(object);
        const next = exists
          ? previous.filter((item) => item !== object)
          : [...previous, object];

        selectedObjectsRef.current = next;
        setSelectedObjects(next);
        setSelectedObject(next.length > 0 ? next[next.length - 1] : null);
        return;
      }

      selectedObjectsRef.current = [object];
      setSelectedObjects([object]);
      setSelectedObject(object);
    },
    [],
  );

  const handleFrameSelected = useCallback(() => {
    if (!selectedObject) return;
    sceneViewerRef.current?.frameObject(selectedObject);
  }, [selectedObject]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev && currentTime >= duration) {
        setCurrentTime(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      }
      return !prev;
    });
  }, [currentTime, duration]);

  const handleTimeChange = useCallback((time: number) => {
    setCurrentTime(time);
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = time;
    }
  }, []);

  // Click outside to close snap dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        snapDropdownRef.current &&
        !snapDropdownRef.current.contains(event.target as Node)
      ) {
        setSnapDropdownOpen(false);
      }
    };

    if (snapDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [snapDropdownOpen]);

  // Keyboard shortcuts for transform modes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts if an object is selected and not typing in an input
      if (selectedObjects.length === 0) return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;

      const key = event.key.toLowerCase();

      if (key === "w") {
        event.preventDefault();
        setTransformMode("translate");
      } else if (key === "e") {
        event.preventDefault();
        setTransformMode("rotate");
      } else if (key === "r") {
        event.preventDefault();
        setTransformMode("scale");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjects.length]);

  // Convert editor keyframes to production format
  // Save animation to assembly JSON file
  const handleSaveAnimation = useCallback(async () => {
    try {
      const animationData: StepAnimation = {
        duration,
        isOffset: true,
        objectKeyframes,
        cameraKeyframes,
        annotationInstances:
          annotationInstances.length > 0 ? annotationInstances : undefined,
      };

      // Save to the step in the assembly JSON
      const response = await fetch(
        `/api/admin/assemblies/${id}/steps/${step}/animation`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(animationData),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save animation");
      }
      toast.success("Animation saved successfully!");
    } catch (error) {
      console.error("Error saving animation:", error);
      toast.error("Failed to save animation. Please try again.");
    }
  }, [
    id,
    step,
    duration,
    objectKeyframes,
    cameraKeyframes,
    annotationInstances,
    toast,
  ]);

  // Load animation from assembly JSON
  const loadAnimation = useCallback(async (animationData: StepAnimation) => {
    if (!animationData) return;

    try {
      hasConvertedOffsetsRef.current = false;
      setIsOffsetAnimation(!!animationData.isOffset);
      setDuration(animationData.duration);
      setObjectKeyframes(animationData.objectKeyframes || []);
      setCameraKeyframes(animationData.cameraKeyframes || []);
      setCurrentTime(0);
      setIsPlaying(false);

      // Load annotations
      const annotations = (animationData.annotationInstances || []).filter(
        (a) => a && a.type && a.id,
      );
      setAnnotationInstances(annotations);

      // Add annotation objects to scene (after a short delay to ensure scene is ready)
      if (annotations.length > 0 && sceneViewerRef.current) {
        for (const annotation of annotations) {
          const obj = await sceneViewerRef.current.addAnnotation(annotation);
          if (obj) {
            // Register in object lookup for keyframe recording
            objectLookupRef.current.set(annotation.id, obj);
            originalTransformsRef.current.set(annotation.id, {
              position: obj.position.clone(),
              rotation: obj.rotation.clone(),
              scale: obj.scale.clone(),
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load animation:", error);
    }
  }, []);

  // Load animation when step/assembly/model changes
  useEffect(() => {
    if (!step || !assembly?.steps || !modelLoaded) return;
    const stepData = assembly.steps.find((s: any) => s.id === step);
    const nextAudioUrl =
      stepData?.audioUrl?.en || stepData?.audioUrl?.ar || null;
    setAudioUrl(nextAudioUrl);

    // Load existing animation if present (using loadAnimation to include annotations)
    if (stepData?.animation) {
      loadAnimation(stepData.animation);
    }
  }, [step, assembly, modelLoaded, loadAnimation]);

  // Load animation from JSON
  const handleLoadAnimation = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = e.target?.result as string;
          const animation: StepAnimation = JSON.parse(json);

          hasConvertedOffsetsRef.current = false;
          setIsOffsetAnimation(!!animation.isOffset);
          setDuration(animation.duration);
          setObjectKeyframes(animation.objectKeyframes);
          setCameraKeyframes(animation.cameraKeyframes);
          setCurrentTime(0);
          setIsPlaying(false);

          // Load annotations (filter out invalid ones)
          const annotations = (animation.annotationInstances || []).filter(
            (a) => a && a.type && a.id,
          );
          setAnnotationInstances(annotations);

          // Add annotation objects to scene
          if (annotations.length > 0 && sceneViewerRef.current) {
            for (const annotation of annotations) {
              const obj =
                await sceneViewerRef.current.addAnnotation(annotation);
              if (obj) {
                objectLookupRef.current.set(annotation.id, obj);
                originalTransformsRef.current.set(annotation.id, {
                  position: obj.position.clone(),
                  rotation: obj.rotation.clone(),
                  scale: obj.scale.clone(),
                });
              }
            }
          }
        } catch (error) {
          console.error("Failed to load animation:", error);
          toast.error(
            "Failed to load animation file. Please check the file format.",
          );
        }
      };
      reader.readAsText(file);
    },
    [toast],
  );

  // Helper to get object path/ID
  const getObjectId = (obj: any): string => {
    // Check if this is an annotation
    if (obj.userData?.isAnnotation) {
      return obj.userData.annotationId || obj.name;
    }
    const parts: string[] = [];
    let current = obj;
    while (current && current !== loadedModelRef.current) {
      if (current.name) parts.unshift(current.name);
      current = current.parent;
    }
    return parts.join("/") || obj.uuid;
  };

  // Handle adding annotation
  const handleAddAnnotation = useCallback(
    async (annotation: AnnotationInstance) => {
      if (!sceneViewerRef.current) {
        toast.error("Scene not ready");
        return;
      }

      try {
        const obj = await sceneViewerRef.current.addAnnotation(annotation);
        if (obj) {
          // Add to state
          setAnnotationInstances((prev) => [...prev, annotation]);

          // Register in object lookup for keyframe recording
          objectLookupRef.current.set(annotation.id, obj);
          originalTransformsRef.current.set(annotation.id, {
            position: obj.position.clone(),
            rotation: obj.rotation.clone(),
            scale: obj.scale.clone(),
          });

          // Select the new annotation
          selectedObjectsRef.current = [obj];
          setSelectedObjects([obj]);
          setSelectedObject(obj);

          toast.success(
            `Added ${annotation.name || annotation.type} annotation`,
          );
        }
      } catch (error) {
        console.error("Failed to add annotation:", error);
        toast.error("Failed to add annotation");
      }
    },
    [toast],
  );

  // Handle removing annotation
  const handleRemoveAnnotation = useCallback(
    (annotationId: string) => {
      if (!sceneViewerRef.current) return;

      const removedObject = objectLookupRef.current.get(annotationId) || null;

      sceneViewerRef.current.removeAnnotation(annotationId);
      setAnnotationInstances((prev) =>
        prev.filter((a) => a.id !== annotationId),
      );

      if (removedObject) {
        setSelectedObjects((prev) => {
          const next = prev.filter((item) => item !== removedObject);
          selectedObjectsRef.current = next;
          setSelectedObject(next.length > 0 ? next[next.length - 1] : null);
          return next;
        });
      }

      // Remove from lookup
      objectLookupRef.current.delete(annotationId);
      originalTransformsRef.current.delete(annotationId);

      // Remove keyframes for this annotation
      setObjectKeyframes((prev) =>
        prev.filter((kf) => kf.objectId !== annotationId),
      );

      toast.success("Annotation removed");
    },
    [toast],
  );

  // Handle updating annotation color
  const handleUpdateAnnotationColor = useCallback(
    (annotationId: string, color: string) => {
      if (!sceneViewerRef.current) return;

      sceneViewerRef.current.updateAnnotationColor(annotationId, color);
      setAnnotationInstances((prev) =>
        prev.map((a) => (a.id === annotationId ? { ...a, color } : a)),
      );
    },
    [],
  );

  const easingOptions = [
    { value: "linear", label: "Linear" },
    { value: "easeInQuad", label: "Ease In (Quad)" },
    { value: "easeOutQuad", label: "Ease Out (Quad)" },
    { value: "easeInOutQuad", label: "Ease In Out (Quad)" },
    { value: "easeInCubic", label: "Ease In (Cubic)" },
    { value: "easeOutCubic", label: "Ease Out (Cubic)" },
    { value: "easeInOutCubic", label: "Ease In Out (Cubic)" },
    { value: "easeInQuart", label: "Ease In (Quart)" },
    { value: "easeOutQuart", label: "Ease Out (Quart)" },
    { value: "easeInOutQuart", label: "Ease In Out (Quart)" },
    { value: "easeInQuint", label: "Ease In (Quint)" },
    { value: "easeOutQuint", label: "Ease Out (Quint)" },
    { value: "easeInOutQuint", label: "Ease In Out (Quint)" },
    { value: "easeInSine", label: "Ease In (Sine)" },
    { value: "easeOutSine", label: "Ease Out (Sine)" },
    { value: "easeInOutSine", label: "Ease In Out (Sine)" },
    { value: "easeInExpo", label: "Ease In (Expo)" },
    { value: "easeOutExpo", label: "Ease Out (Expo)" },
    { value: "easeInOutExpo", label: "Ease In Out (Expo)" },
    { value: "easeInCirc", label: "Ease In (Circ)" },
    { value: "easeOutCirc", label: "Ease Out (Circ)" },
    { value: "easeInOutCirc", label: "Ease In Out (Circ)" },
    { value: "easeInBack", label: "Ease In (Back)" },
    { value: "easeOutBack", label: "Ease Out (Back)" },
    { value: "easeInOutBack", label: "Ease In Out (Back)" },
    { value: "easeInElastic", label: "Ease In (Elastic)" },
    { value: "easeOutElastic", label: "Ease Out (Elastic)" },
    { value: "easeInOutElastic", label: "Ease In Out (Elastic)" },
    { value: "easeInBounce", label: "Ease In (Bounce)" },
    { value: "easeOutBounce", label: "Ease Out (Bounce)" },
    { value: "easeInOutBounce", label: "Ease In Out (Bounce)" },
  ];

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

  const getEasingPath = useCallback(
    (easing?: string): { path: string; minY: number; maxY: number } => {
      const width = 120;
      const height = 60;
      const steps = 48;
      let path = "";
      let minEased = 0;
      let maxEased = 1;

      // First pass: find min/max values
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const eased = applyEasing(t, easing);
        minEased = Math.min(minEased, eased);
        maxEased = Math.max(maxEased, eased);
      }

      // Add padding for curves that exceed 0-1
      const range = maxEased - minEased;
      const padding = range > 1 ? 0.1 : 0;
      minEased -= padding;
      maxEased += padding;
      const adjustedRange = maxEased - minEased;

      // Second pass: generate path with adjusted scale
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const eased = applyEasing(t, easing);
        const x = t * width;
        const normalizedY = (eased - minEased) / adjustedRange;
        const y = height - normalizedY * height;
        path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }

      return { path, minY: minEased, maxY: maxEased };
    },
    [applyEasing],
  );

  const roundTo3 = useCallback((value: number) => {
    if (Number.isNaN(value)) return 0;
    return Math.round(value * 1000) / 1000;
  }, []);

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

  const cloneObjectKeyframes = useCallback(
    (frames: ObjectKeyframe[]) =>
      frames.map((kf) => ({
        ...kf,
        transform: {
          position: { ...kf.transform.position },
          rotation: { ...kf.transform.rotation },
          scale: { ...kf.transform.scale },
        },
      })),
    [],
  );

  const cloneCameraKeyframes = useCallback(
    (frames: CameraKeyframe[]) =>
      frames.map((kf) => ({
        ...kf,
        position: { ...kf.position },
        target: { ...kf.target },
      })),
    [],
  );

  const getHistorySnapshot = useCallback(
    () => ({
      objectKeyframes: cloneObjectKeyframes(objectKeyframes),
      cameraKeyframes: cloneCameraKeyframes(cameraKeyframes),
      duration,
      selectedKeyframeTime,
      currentTime,
    }),
    [
      cloneObjectKeyframes,
      cloneCameraKeyframes,
      objectKeyframes,
      cameraKeyframes,
      duration,
      selectedKeyframeTime,
      currentTime,
    ],
  );

  const pushHistory = useCallback(() => {
    if (isRestoringHistoryRef.current) return;
    const snapshot = getHistorySnapshot();
    setHistoryPast((prev) => [...prev, snapshot].slice(-50));
    setHistoryFuture([]);
  }, [getHistorySnapshot]);

  const handleUndo = useCallback(() => {
    setHistoryPast((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      const snapshot = getHistorySnapshot();
      setHistoryFuture((future) => [snapshot, ...future]);

      isRestoringHistoryRef.current = true;
      setObjectKeyframes(previous.objectKeyframes);
      setCameraKeyframes(previous.cameraKeyframes);
      setDuration(previous.duration);
      setSelectedKeyframeTime(previous.selectedKeyframeTime);
      setCurrentTime(previous.currentTime);
      isRestoringHistoryRef.current = false;

      return prev.slice(0, -1);
    });
  }, [getHistorySnapshot]);

  const handleRedo = useCallback(() => {
    setHistoryFuture((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      const snapshot = getHistorySnapshot();
      setHistoryPast((past) => [...past, snapshot].slice(-50));

      isRestoringHistoryRef.current = true;
      setObjectKeyframes(next.objectKeyframes);
      setCameraKeyframes(next.cameraKeyframes);
      setDuration(next.duration);
      setSelectedKeyframeTime(next.selectedKeyframeTime);
      setCurrentTime(next.currentTime);
      isRestoringHistoryRef.current = false;

      return prev.slice(1);
    });
  }, [getHistorySnapshot]);

  const handleBeginEdit = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  // Undo / Redo shortcuts
  useEffect(() => {
    const handleHistoryKeys = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMac = navigator.platform.toLowerCase().includes("mac");
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;
      if (!ctrlOrCmd) return;

      const key = event.key.toLowerCase();
      if (key === "z" && event.shiftKey) {
        event.preventDefault();
        handleRedo();
      } else if (key === "z") {
        event.preventDefault();
        handleUndo();
      } else if (key === "y") {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleHistoryKeys);
    return () => window.removeEventListener("keydown", handleHistoryKeys);
  }, [handleUndo, handleRedo]);

  // Record keyframe for selected objects
  const handleRecordKeyframe = useCallback(() => {
    const targets =
      selectedObjects.length > 0
        ? selectedObjects
        : selectedObject
          ? [selectedObject]
          : [];

    if (targets.length === 0) return;

    pushHistory();

    const recordTime = Math.round(currentTime * 100) / 100;
    const targetIds = new Set<string>();

    const newKeyframes: ObjectKeyframe[] = targets.map((target) => {
      const objectId = getObjectId(target);
      targetIds.add(objectId);
      const original = originalTransformsRef.current.get(objectId);

      return {
        time: recordTime,
        objectId,
        transform: {
          position: {
            x: original
              ? target.position.x - original.position.x
              : target.position.x,
            y: original
              ? target.position.y - original.position.y
              : target.position.y,
            z: original
              ? target.position.z - original.position.z
              : target.position.z,
          },
          rotation: {
            x: original
              ? target.rotation.x - original.rotation.x
              : target.rotation.x,
            y: original
              ? target.rotation.y - original.rotation.y
              : target.rotation.y,
            z: original
              ? target.rotation.z - original.rotation.z
              : target.rotation.z,
          },
          scale: {
            x: target.scale.x,
            y: target.scale.y,
            z: target.scale.z,
          },
        },
        visible: target.visible,
      };
    });

    setObjectKeyframes((prev) => {
      const filtered = prev.filter(
        (kf) => !(kf.time === recordTime && targetIds.has(kf.objectId)),
      );
      return [...filtered, ...newKeyframes].sort((a, b) => a.time - b.time);
    });
    setIsOffsetAnimation(true);
  }, [selectedObject, selectedObjects, currentTime, pushHistory]);

  // Record camera keyframe
  const handleRecordCameraKeyframe = useCallback(() => {
    const cameraState = (window as any).__getCameraState?.();
    if (!cameraState) return;

    pushHistory();

    const recordTime = Math.round(currentTime * 100) / 100;

    const newKeyframe: CameraKeyframe = {
      time: recordTime,
      position: {
        x: cameraState.position.x,
        y: cameraState.position.y,
        z: cameraState.position.z,
      },
      target: {
        x: cameraState.target.x,
        y: cameraState.target.y,
        z: cameraState.target.z,
      },
    };

    setCameraKeyframes((prev) => {
      // Remove existing keyframe at same time
      const filtered = prev.filter((kf) => kf.time !== recordTime);
      // Add new keyframe and sort by time
      return [...filtered, newKeyframe].sort((a, b) => a.time - b.time);
    });
  }, [currentTime, pushHistory]);

  // Delete camera keyframe
  const handleDeleteCameraKeyframe = useCallback(() => {
    pushHistory();
    setCameraKeyframes((prev) => prev.filter((kf) => kf.time !== currentTime));
  }, [currentTime, pushHistory]);

  // Delete keyframe at current time for selected object
  const handleDeleteKeyframe = useCallback(() => {
    if (!selectedObject) return;

    pushHistory();

    const objectId = getObjectId(selectedObject);
    setObjectKeyframes((prev) =>
      prev.filter(
        (kf) => !(kf.time === currentTime && kf.objectId === objectId),
      ),
    );
  }, [selectedObject, currentTime, pushHistory]);

  const resolveKeyframeCollision = useCallback(
    (candidate: number, isOccupied: (time: number) => boolean) => {
      if (!isOccupied(candidate)) return candidate;
      const step = 0.01;
      const maxSteps = Math.ceil(duration / step);
      for (let i = 1; i <= maxSteps; i += 1) {
        const forward = roundTo3(candidate + i * step);
        if (forward <= duration && !isOccupied(forward)) return forward;
        const backward = roundTo3(candidate - i * step);
        if (backward >= 0 && !isOccupied(backward)) return backward;
      }
      return candidate;
    },
    [duration, roundTo3],
  );

  // Handle keyframe moved on timeline
  const handleKeyframeMoved = useCallback(
    (oldTime: number, newTime: number) => {
      if (oldTime === newTime) return;
      pushHistory();
      const nextTime = Math.round(newTime * 1000) / 1000;
      let resolvedTime = nextTime;

      if (selectedObject) {
        const selectedObjectId = getObjectId(selectedObject);
        setObjectKeyframes((prev) => {
          const isOccupied = (time: number) =>
            prev.some(
              (kf) =>
                kf.objectId === selectedObjectId &&
                kf.time === time &&
                kf.time !== oldTime,
            );
          resolvedTime = resolveKeyframeCollision(nextTime, isOccupied);
          return prev
            .map((kf) =>
              kf.time === oldTime && kf.objectId === selectedObjectId
                ? { ...kf, time: resolvedTime }
                : kf,
            )
            .sort((a, b) => a.time - b.time);
        });
      } else {
        setCameraKeyframes((prev) => {
          const isOccupied = (time: number) =>
            prev.some((kf) => kf.time === time && kf.time !== oldTime);
          resolvedTime = resolveKeyframeCollision(nextTime, isOccupied);
          return prev
            .map((kf) =>
              kf.time === oldTime ? { ...kf, time: resolvedTime } : kf,
            )
            .sort((a, b) => a.time - b.time);
        });
      }

      // Update selected keyframe time if it was moved
      if (selectedKeyframeTime === oldTime) {
        setSelectedKeyframeTime(resolvedTime);
      }
    },
    [
      selectedKeyframeTime,
      pushHistory,
      selectedObject,
      resolveKeyframeCollision,
    ],
  );

  const handleKeyframeDuplicated = useCallback(
    (sourceTime: number, newTime: number) => {
      if (sourceTime === newTime) return;
      pushHistory();
      const nextTime = Math.round(newTime * 1000) / 1000;

      if (selectedObject) {
        const selectedObjectId = getObjectId(selectedObject);
        setObjectKeyframes((prev) => {
          const source = prev.find(
            (kf) => kf.time === sourceTime && kf.objectId === selectedObjectId,
          );
          if (!source) return prev;
          const isOccupied = (time: number) =>
            prev.some(
              (kf) => kf.objectId === selectedObjectId && kf.time === time,
            );
          const resolvedTime = resolveKeyframeCollision(nextTime, isOccupied);
          const duplicated: ObjectKeyframe = {
            ...source,
            time: resolvedTime,
            transform: {
              position: { ...source.transform.position },
              rotation: { ...source.transform.rotation },
              scale: { ...source.transform.scale },
            },
          };
          setSelectedKeyframeTime(resolvedTime);
          return [...prev, duplicated].sort((a, b) => a.time - b.time);
        });
      } else {
        setCameraKeyframes((prev) => {
          const source = prev.find((kf) => kf.time === sourceTime);
          if (!source) return prev;
          const isOccupied = (time: number) =>
            prev.some((kf) => kf.time === time);
          const resolvedTime = resolveKeyframeCollision(nextTime, isOccupied);
          const duplicated: CameraKeyframe = {
            ...source,
            time: resolvedTime,
            position: { ...source.position },
            target: { ...source.target },
          };
          setSelectedKeyframeTime(resolvedTime);
          return [...prev, duplicated].sort((a, b) => a.time - b.time);
        });
      }
    },
    [
      pushHistory,
      resolveKeyframeCollision,
      selectedObject,
      setSelectedKeyframeTime,
    ],
  );

  // Handle keyframe selection
  const handleKeyframeSelect = useCallback((time: number) => {
    setSelectedKeyframeTime(time);
  }, []);

  const handleCopyKeyframeValues = useCallback(() => {
    if (selectedKeyframeTime === null) return;

    if (selectedObject) {
      const objectId = getObjectId(selectedObject);
      const source = objectKeyframes.find(
        (kf) => kf.time === selectedKeyframeTime && kf.objectId === objectId,
      );
      if (!source) return;
      copiedKeyframeRef.current = {
        type: "object",
        data: {
          transform: {
            position: { ...source.transform.position },
            rotation: { ...source.transform.rotation },
            scale: { ...source.transform.scale },
          },
          visible: source.visible,
          easing: source.easing,
        },
      };
      setCopiedKeyframeType("object");
      return;
    }

    const cameraSource = cameraKeyframes.find(
      (kf) => kf.time === selectedKeyframeTime,
    );
    if (!cameraSource) return;
    copiedKeyframeRef.current = {
      type: "camera",
      data: {
        position: { ...cameraSource.position },
        target: { ...cameraSource.target },
        easing: cameraSource.easing,
      },
    };
    setCopiedKeyframeType("camera");
  }, [selectedKeyframeTime, selectedObject, objectKeyframes, cameraKeyframes]);

  const handlePasteKeyframeValues = useCallback(() => {
    if (selectedKeyframeTime === null || !copiedKeyframeRef.current) return;

    if (selectedObject) {
      if (copiedKeyframeRef.current.type !== "object") return;
      const objectId = getObjectId(selectedObject);
      pushHistory();
      const { data } = copiedKeyframeRef.current;
      setObjectKeyframes((prev) =>
        prev.map((kf) =>
          kf.time === selectedKeyframeTime && kf.objectId === objectId
            ? {
                ...kf,
                transform: {
                  position: { ...data.transform.position },
                  rotation: { ...data.transform.rotation },
                  scale: { ...data.transform.scale },
                },
                visible: data.visible,
                easing: data.easing,
              }
            : kf,
        ),
      );
      return;
    }

    if (copiedKeyframeRef.current.type !== "camera") return;
    pushHistory();
    const { data } = copiedKeyframeRef.current;
    setCameraKeyframes((prev) =>
      prev.map((kf) =>
        kf.time === selectedKeyframeTime
          ? {
              ...kf,
              position: { ...data.position },
              target: { ...data.target },
              easing: data.easing,
            }
          : kf,
      ),
    );
  }, [selectedKeyframeTime, selectedObject, pushHistory]);

  const handleDeleteAllKeyframesAtTime = useCallback(async () => {
    const targetName = selectedObject ? getObjectId(selectedObject) : "camera";
    const confirmMessage = selectedObject
      ? `This will permanently remove all keyframes for "${targetName}" from the entire timeline.`
      : "This will permanently remove all camera keyframes from the entire timeline.";

    const confirmed = await toast.confirm({
      title: selectedObject
        ? "Delete Object Keyframes?"
        : "Delete Camera Keyframes?",
      message: confirmMessage,
      confirmText: "Delete All",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) {
      return;
    }

    pushHistory();

    if (selectedObject) {
      // Delete ALL keyframes for the selected object across entire timeline
      const objectId = getObjectId(selectedObject);
      setObjectKeyframes((prev) =>
        prev.filter((kf) => kf.objectId !== objectId),
      );
      toast.success(`Deleted all keyframes for "${objectId}"`);
    } else {
      // Delete ALL camera keyframes across entire timeline
      setCameraKeyframes([]);
      toast.success("Deleted all camera keyframes");
    }
    setSelectedKeyframeTime(null);
  }, [selectedObject, pushHistory, toast]);

  const handleShiftAllKeyframes = useCallback(() => {
    if (!bulkShiftSeconds || Number.isNaN(bulkShiftSeconds)) return;
    pushHistory();

    const delta = bulkShiftSeconds;
    const clampTime = (time: number) => Math.max(0, time + delta);

    setObjectKeyframes((prev) =>
      prev
        .map((kf) => ({ ...kf, time: clampTime(kf.time) }))
        .sort((a, b) => a.time - b.time),
    );
    setCameraKeyframes((prev) =>
      prev
        .map((kf) => ({ ...kf, time: clampTime(kf.time) }))
        .sort((a, b) => a.time - b.time),
    );

    if (selectedKeyframeTime !== null) {
      setSelectedKeyframeTime(Math.max(0, selectedKeyframeTime + delta));
    }

    const allTimes = [
      ...objectKeyframes.map((kf) => clampTime(kf.time)),
      ...cameraKeyframes.map((kf) => clampTime(kf.time)),
      duration,
    ];
    const nextDuration = Math.max(0, ...allTimes);
    if (nextDuration !== duration) {
      setDuration(nextDuration);
    }
  }, [
    bulkShiftSeconds,
    selectedKeyframeTime,
    objectKeyframes,
    cameraKeyframes,
    duration,
    pushHistory,
  ]);

  // Get all unique keyframe times for timeline
  const allKeyframeTimes = [
    ...new Set([
      ...objectKeyframes.map((kf) => kf.time),
      ...cameraKeyframes.map((kf) => kf.time),
    ]),
  ];

  // Get filtered keyframes based on selection
  const timelineKeyframes = selectedObject
    ? objectKeyframes
        .filter((kf) => kf.objectId === getObjectId(selectedObject))
        .map((kf) => kf.time)
    : cameraKeyframes.map((kf) => kf.time);

  // Apply animation at current time
  useEffect(() => {
    if (!loadedModelRef.current) return;

    // Apply object transforms for each unique object
    uniqueObjectIds.forEach((objectId) => {
      const targetObj =
        objectLookupRef.current.get(objectId) ||
        loadedModelRef.current?.getObjectByName?.(objectId);
      if (!targetObj) return;

      const original = originalTransformsRef.current.get(objectId);
      const basePosition = original?.position ?? new THREE.Vector3();
      const baseRotation = original?.rotation ?? new THREE.Euler();

      const objKeyframes = objectKeyframesById.get(objectId) || [];

      // Find the keyframes to interpolate between
      let prevKf: ObjectKeyframe | null = null;
      let nextKf: ObjectKeyframe | null = null;

      for (let i = 0; i < objKeyframes.length; i++) {
        if (objKeyframes[i].time <= currentTime) {
          prevKf = objKeyframes[i];
        }
        if (objKeyframes[i].time > currentTime && !nextKf) {
          nextKf = objKeyframes[i];
        }
      }

      // Apply transform based on keyframes
      if (prevKf && nextKf) {
        // Interpolate between keyframes
        const t = applyEasing(
          (currentTime - prevKf.time) / (nextKf.time - prevKf.time),
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
        const prevQuat = tempPrevQuatRef.current;
        const nextQuat = tempNextQuatRef.current;
        const interpolatedQuat = tempInterpolatedQuatRef.current;
        prevQuat.setFromEuler(
          new THREE.Euler(prevRotation.x, prevRotation.y, prevRotation.z),
        );
        nextQuat.setFromEuler(
          new THREE.Euler(nextRotation.x, nextRotation.y, nextRotation.z),
        );
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
              // Update shadow casting based on target visibility
              child.castShadow = nextVisible;
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
                child.castShadow = true;
              }
            });
          } else {
            // Object is invisible, disable shadow casting
            targetObj.traverse((child: any) => {
              if (child.isMesh) {
                child.castShadow = false;
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
            // Update shadow casting based on visibility
            child.castShadow = visible;
          }
        });
      }
    });

    // Apply camera transforms
    const getCameraState = (window as any).__getCameraState;
    if (getCameraState && sortedCameraKeyframes.length > 0) {
      // Find the keyframes to interpolate between
      let prevKf: CameraKeyframe | null = null;
      let nextKf: CameraKeyframe | null = null;

      for (let i = 0; i < sortedCameraKeyframes.length; i++) {
        if (sortedCameraKeyframes[i].time <= currentTime) {
          prevKf = sortedCameraKeyframes[i];
        }
        if (sortedCameraKeyframes[i].time > currentTime && !nextKf) {
          nextKf = sortedCameraKeyframes[i];
        }
      }

      // Apply camera transform based on keyframes
      if (prevKf && nextKf) {
        // Interpolate between keyframes
        const t = applyEasing(
          (currentTime - prevKf.time) / (nextKf.time - prevKf.time),
          nextKf.easing,
        );

        // Lerp camera position and target
        const position = {
          x: prevKf.position.x + (nextKf.position.x - prevKf.position.x) * t,
          y: prevKf.position.y + (nextKf.position.y - prevKf.position.y) * t,
          z: prevKf.position.z + (nextKf.position.z - prevKf.position.z) * t,
        };

        const target = {
          x: prevKf.target.x + (nextKf.target.x - prevKf.target.x) * t,
          y: prevKf.target.y + (nextKf.target.y - prevKf.target.y) * t,
          z: prevKf.target.z + (nextKf.target.z - prevKf.target.z) * t,
        };

        // Set camera state
        (window as any).__setCameraState?.(position, target);
      } else if (prevKf) {
        // Hold at last keyframe
        (window as any).__setCameraState?.(prevKf.position, prevKf.target);
      }
    }
  }, [
    currentTime,
    uniqueObjectIds,
    objectKeyframesById,
    sortedCameraKeyframes,
    loadedModelRef,
    applyEasing,
  ]);

  useEffect(() => {
    if (!modelLoaded) return;
    if (isOffsetAnimation) return;
    if (hasConvertedOffsetsRef.current) return;
    if (originalTransformsRef.current.size === 0) return;
    if (objectKeyframes.length === 0 && cameraKeyframes.length === 0) return;

    const normalized = normalizeAnimationToOffsets({
      duration,
      objectKeyframes,
      cameraKeyframes,
      isOffset: false,
    });

    if (normalized.isOffset) {
      setObjectKeyframes(normalized.objectKeyframes || []);
      setCameraKeyframes(normalized.cameraKeyframes || []);
      setIsOffsetAnimation(true);
      hasConvertedOffsetsRef.current = true;
    }
  }, [
    modelLoaded,
    isOffsetAnimation,
    duration,
    objectKeyframes,
    cameraKeyframes,
    normalizeAnimationToOffsets,
  ]);

  // Animation playback loop (fallback when no audio or audio failed)
  useEffect(() => {
    if (!isPlaying || useAudioSync) return;

    let lastTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000; // Convert to seconds
      lastTime = now;

      setCurrentTime((prev) => {
        const newTime = prev + delta;
        // Loop back to start if we've reached the end
        if (newTime >= duration) {
          return 0;
        }
        return newTime;
      });
    };

    const intervalId = setInterval(animate, 1000 / 60); // 60 FPS

    return () => clearInterval(intervalId);
  }, [isPlaying, duration, useAudioSync]);

  // Audio setup for current step
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    if (!audioUrl) {
      audio.pause();
      audio.src = "";
      setUseAudioSync(false);
      return;
    }

    const cacheBustedUrl =
      audioUrl + (audioUrl.includes("?") ? "&" : "?") + "v=" + Date.now();
    audio.src = cacheBustedUrl;
    audio.load();
    audio.currentTime = 0;

    const handleLoadedMetadata = () => {
      if (!Number.isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audioUrl]);

  // Sync timeline with audio while playing
  useEffect(() => {
    if (!isPlaying || !audioRef.current || !audioUrl) return;

    const audio = audioRef.current;
    audio.currentTime = currentTime;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => setUseAudioSync(true))
        .catch(() => {
          setUseAudioSync(false);
          setIsPlaying(false);
        });
    } else {
      setUseAudioSync(false);
    }

    let rafId: number;
    const tick = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime || 0);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      cancelAnimationFrame(rafId);
      audio.pause();
    };
  }, [isPlaying, audioUrl]);

  // Pause audio when playback stops
  useEffect(() => {
    if (isPlaying || !audioRef.current) return;
    audioRef.current.pause();
    setUseAudioSync(false);
  }, [isPlaying]);

  // Note: Animation loading is handled by the useEffect that watches
  // [step, assembly, modelLoaded, loadAnimation] - don't duplicate here

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".glb") && !file.name.endsWith(".gltf")) {
      setLoadError("Please select a GLB or GLTF file");
      return;
    }

    // Create object URL for the file
    const url = URL.createObjectURL(file);
    setModelPath(url);
    setLoadError(null);
  };

  const hasObjectSelection = selectedObjects.length > 0;

  return (
    <AuthGuard>
      <Head>
        <title>Visual Step Editor - Admin Panel</title>
      </Head>
      <AdminLayout title="Visual Step Editor">
        <div className="h-[calc(100vh-140px)] min-h-0 flex flex-col overflow-hidden rounded-xl">
          <audio ref={audioRef} className="hidden" preload="auto" />
          {/* Top toolbar */}
          <div className="relative z-20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-b border-white/50 dark:border-gray-700/50 px-2 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center gap-2 sm:gap-4 shadow-sm">
            <Link
              href={`/admin/assemblies/${id}/steps`}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Back to Steps</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="hidden sm:block w-px h-5 bg-gray-300 dark:bg-gray-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1 sm:flex-initial">
              <span className="text-gray-500 dark:text-gray-400">
                Assembly:
              </span>{" "}
              <span className="font-semibold">{id}</span>
              {step &&
                assembly?.steps &&
                (() => {
                  const stepData = assembly.steps.find(
                    (s: any) => s.id === step,
                  );
                  return stepData ? (
                    <>
                      {" "}
                      <span className="text-gray-400 dark:text-gray-500">
                        •
                      </span>{" "}
                      <span className="text-gray-500 dark:text-gray-400">
                        Step {step}:
                      </span>{" "}
                      <span className="font-semibold">
                        {stepData.title?.en || ""}
                      </span>
                    </>
                  ) : (
                    <>
                      {" "}
                      <span className="text-gray-400 dark:text-gray-500">
                        •
                      </span>{" "}
                      <span className="text-gray-500 dark:text-gray-400">
                        Step:
                      </span>{" "}
                      <span className="font-semibold">{step}</span>
                    </>
                  );
                })()}
            </span>

            {/* Right side controls */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              {/* Transform mode buttons */}
              <div className="hidden md:flex gap-1 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50 dark:border-gray-600/50">
                <button
                  onClick={() => setTransformMode("translate")}
                  disabled={!hasObjectSelection}
                  title="Move (W)"
                  className={`px-2 sm:px-3 py-1.5 text-sm rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                    transformMode === "translate" && hasObjectSelection
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <Move className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setTransformMode("rotate")}
                  disabled={!hasObjectSelection}
                  title="Rotate (E)"
                  className={`px-2 sm:px-3 py-1.5 text-sm rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                    transformMode === "rotate" && hasObjectSelection
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setTransformMode("scale")}
                  disabled={!hasObjectSelection}
                  title="Scale (R)"
                  className={`px-2 sm:px-3 py-1.5 text-sm rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                    transformMode === "scale" && hasObjectSelection
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <button
                onClick={handleFrameSelected}
                disabled={!hasObjectSelection}
                className="px-3 py-1.5 text-sm bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Frame selected object"
              >
                <Focus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Snap settings dropdown - Desktop only */}
              <div className="hidden md:block relative" ref={snapDropdownRef}>
                <button
                  onClick={() => setSnapDropdownOpen(!snapDropdownOpen)}
                  className="px-3 py-1.5 text-sm bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50"
                  title="Snap Settings"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>

                {/* Dropdown panel */}
                {snapDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/50 dark:border-gray-700/50 p-4 z-50">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-blue-500" />
                      Snap Settings
                    </h4>

                    {/* Translation snap */}
                    <div className="mb-4 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                          Move Snap
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={translationSnapEnabled}
                            onChange={(e) =>
                              setTranslationSnapEnabled(e.target.checked)
                            }
                            className="sr-only peer"
                            title="Enable translation snap"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      {translationSnapEnabled && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={translationSnapValue * 100}
                            onChange={(e) => {
                              e.stopPropagation();
                              const value = Number(e.target.value) / 100;
                              // Ensure value is at least 0.001 (0.1cm minimum)
                              if (value >= 0.001) {
                                setTranslationSnapValue(value);
                              }
                            }}
                            onBlur={(e) => {
                              // On blur, reset to minimum if invalid
                              const value = Number(e.target.value) / 100;
                              if (value < 0.001 || isNaN(value)) {
                                setTranslationSnapValue(0.1);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            step="1"
                            min="0.1"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            cm
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Rotation snap */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                          Rotate Snap
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rotationSnapEnabled}
                            onChange={(e) =>
                              setRotationSnapEnabled(e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      {rotationSnapEnabled && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={rotationSnapValue}
                            onChange={(e) => {
                              e.stopPropagation();
                              const value = Number(e.target.value);
                              // Ensure value is at least 1 degree
                              if (value >= 1) {
                                setRotationSnapValue(value);
                              }
                            }}
                            onBlur={(e) => {
                              // On blur, reset to minimum if invalid
                              const value = Number(e.target.value);
                              if (value < 1 || isNaN(value)) {
                                setRotationSnapValue(15);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            step="1"
                            min="1"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            °
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Undo / Redo */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleUndo}
                  disabled={historyPast.length === 0}
                  className="p-2 text-sm bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200/50 dark:border-gray-600/50"
                  title="Undo (Ctrl+Z / ⌘Z)"
                >
                  <Undo className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyFuture.length === 0}
                  className="p-2 text-sm bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200/50 dark:border-gray-600/50"
                  title="Redo (Ctrl+Y / ⌘Shift+Z)"
                >
                  <Redo className="w-5 h-5" />
                </button>
              </div>

              {/* Add Annotation button */}
              <button
                onClick={() => setShowAnnotationToolbar(!showAnnotationToolbar)}
                disabled={!sceneReady}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center gap-1 sm:gap-2 font-medium border ${
                  showAnnotationToolbar
                    ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/30"
                    : "bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 border-gray-200/50 dark:border-gray-600/50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Add annotations (arrows, text, shapes)"
              >
                <MessageSquarePlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Annotate</span>
              </button>

              {/* Save button - always visible */}
              <button
                onClick={handleSaveAnimation}
                disabled={
                  !sceneReady ||
                  (objectKeyframes.length === 0 &&
                    cameraKeyframes.length === 0 &&
                    annotationInstances.length === 0)
                }
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 font-medium shadow-lg shadow-green-500/30"
                title="Save animation to step"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Save Animation</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)_360px] overflow-hidden">
            {/* Left column: Scene status + hierarchy */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/50 dark:border-gray-700/50 flex flex-col overflow-hidden min-h-0 md:min-h-0">
              <div className="p-3 sm:p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                  <Box className="w-5 h-5 text-blue-500" />
                  Scene Status
                </h3>
                <div className="text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                  {sceneReady ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Initializing...
                    </span>
                  )}
                  {modelLoaded && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
                      <Code2 className="w-3 h-3" />
                      Model loaded
                    </span>
                  )}
                </div>
              </div>

              {modelLoaded && loadedModelRef.current ? (
                <div className="flex-1 overflow-hidden">
                  <ObjectHierarchyTree
                    model={loadedModelRef.current}
                    selectedObjects={selectedObjects}
                    onSelectObject={handleSelectObject}
                    annotations={annotationInstances}
                    annotationObjects={
                      new Map(
                        annotationInstances
                          .map((a) => {
                            const obj = objectLookupRef.current.get(a.id);
                            return obj
                              ? ([a.id, obj] as [string, THREE.Object3D])
                              : null;
                          })
                          .filter(
                            (entry): entry is [string, THREE.Object3D] =>
                              entry !== null,
                          ),
                      )
                    }
                    onRemoveAnnotation={handleRemoveAnnotation}
                    onUpdateAnnotationColor={handleUpdateAnnotationColor}
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-purple-500" />
                      Load 3D Model
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      <label className="block">
                        <div className="mb-1 sm:mb-2">
                          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            Select GLB/GLTF file:
                          </span>
                        </div>
                        <input
                          type="file"
                          accept=".glb,.gltf"
                          onChange={handleFileChange}
                          disabled={!sceneReady}
                          className="block w-full text-sm text-gray-500 dark:text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-gradient-to-r file:from-blue-500 file:to-indigo-600 file:text-white
                            file:cursor-pointer file:shadow-lg file:shadow-blue-500/30
                            hover:file:from-blue-600 hover:file:to-indigo-700
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </label>

                      {loadError && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-700 dark:text-red-400">
                            {loadError}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {assembly?.model
                          ? "Assembly model will load automatically, or upload a different one."
                          : "Upload a 3D model to begin creating animations."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Middle column: 3D Viewport + Timeline */}
            <div className="flex flex-col bg-gradient-to-br from-slate-100 to-gray-200 dark:from-gray-900 dark:to-slate-900 min-h-[50vh] md:min-h-0">
              <div className="flex-1 min-h-[50vh] relative">
                <AuthoringSceneViewer
                  ref={sceneViewerRef}
                  modelPath={modelPath}
                  selectedObject={selectedObject}
                  selectedObjects={selectedObjects}
                  transformMode={transformMode}
                  translationSnap={
                    translationSnapEnabled ? translationSnapValue : null
                  }
                  rotationSnap={
                    rotationSnapEnabled
                      ? (rotationSnapValue * Math.PI) / 180
                      : null
                  }
                  scaleSnap={null}
                  annotationInstances={annotationInstances}
                  onSceneReady={handleSceneReady}
                  onModelLoaded={handleModelLoaded}
                  onLoadError={handleLoadError}
                  onObjectSelected={handleSelectObject}
                  onGetCameraState={() => null}
                />

                {/* Annotation Toolbar (floating) */}
                <AnnotationToolbar
                  isOpen={showAnnotationToolbar}
                  onClose={() => setShowAnnotationToolbar(false)}
                  onAddAnnotation={handleAddAnnotation}
                />
              </div>
              <div className="border-t border-white/50 dark:border-gray-700/50">
                <Timeline
                  duration={duration}
                  currentTime={currentTime}
                  onTimeChange={handleTimeChange}
                  keyframes={timelineKeyframes}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onRecordCameraKeyframe={handleRecordCameraKeyframe}
                  onDeleteCameraKeyframe={handleDeleteCameraKeyframe}
                  onRecordObjectKeyframe={handleRecordKeyframe}
                  onDeleteObjectKeyframe={handleDeleteKeyframe}
                  hasCameraKeyframeAtCurrentTime={cameraKeyframes.some(
                    (kf) => kf.time === currentTime,
                  )}
                  hasObjectKeyframeAtCurrentTime={
                    hasObjectSelection
                      ? objectKeyframes.some((kf) =>
                          selectedObjects.some(
                            (obj) =>
                              kf.time === currentTime &&
                              kf.objectId === getObjectId(obj),
                          ),
                        )
                      : false
                  }
                  canRecordObjectKeyframe={hasObjectSelection}
                  onKeyframeMoved={handleKeyframeMoved}
                  onKeyframeSelect={handleKeyframeSelect}
                  onKeyframeDuplicate={handleKeyframeDuplicated}
                  onKeyframeDeselect={() => setSelectedKeyframeTime(null)}
                  selectedKeyframeTime={selectedKeyframeTime}
                />
              </div>
            </div>

            {/* Right column: Keyframe Properties Editor */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/50 dark:border-gray-700/50 px-4 py-3 min-h-0 overflow-y-auto">
              {(() => {
                const hasSelection = selectedKeyframeTime !== null;
                // Find the selected keyframe(s)
                const objectKf =
                  hasSelection && selectedObject
                    ? objectKeyframes.find(
                        (kf) =>
                          kf.time === selectedKeyframeTime &&
                          kf.objectId === getObjectId(selectedObject),
                      )
                    : undefined;

                const cameraKf =
                  hasSelection && !selectedObject
                    ? cameraKeyframes.find(
                        (kf) => kf.time === selectedKeyframeTime,
                      )
                    : undefined;

                return (
                  <div className="flex flex-col gap-3">
                    {!hasSelection && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Hand className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No keyframe selected
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Select a keyframe on the timeline to edit its values
                        </p>
                      </div>
                    )}
                    {hasSelection && (
                      <div className="flex flex-col gap-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-3 py-3">
                        {/* Row 1: Time */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">
                            Time
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            max={duration}
                            disabled={!hasSelection}
                            key={`kf-time-${selectedKeyframeTime ?? "none"}-${objectKf?.objectId || "camera"}`}
                            defaultValue={roundTo3(
                              hasSelection
                                ? (selectedKeyframeTime as number)
                                : currentTime,
                            )}
                            onFocus={handleBeginEdit}
                            onBlur={(e) => {
                              if (
                                !hasSelection ||
                                selectedKeyframeTime === null
                              ) {
                                return;
                              }
                              const value = roundTo3(Number(e.target.value));
                              const clamped = Math.max(
                                0,
                                Math.min(duration, value),
                              );
                              handleKeyframeMoved(
                                selectedKeyframeTime,
                                clamped,
                              );
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            title="Keyframe time in seconds"
                            className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          <span className="text-xs text-gray-400">sec</span>
                        </div>

                        {/* Row 2: Copy/Paste */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">
                            Clipboard
                          </label>
                          <div className="flex-1 inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <button
                              onClick={handleCopyKeyframeValues}
                              disabled={!hasSelection}
                              className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                              title="Copy keyframe values"
                            >
                              <Copy className="w-3 h-3" />
                              Copy
                            </button>
                            <button
                              onClick={handlePasteKeyframeValues}
                              disabled={
                                !hasSelection ||
                                !copiedKeyframeType ||
                                copiedKeyframeType !==
                                  (objectKf ? "object" : "camera")
                              }
                              className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 transition-colors border-l border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1"
                              title="Paste keyframe values"
                            >
                              <ClipboardPaste className="w-3 h-3" />
                              Paste
                            </button>
                          </div>
                        </div>

                        {/* Row 3: Easing Selector */}
                        {(objectKf || cameraKf) && (
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">
                              Easing
                            </label>
                            {objectKf && (
                              <select
                                value={objectKf.easing || "linear"}
                                aria-label="Object easing"
                                disabled={!hasSelection}
                                onFocus={handleBeginEdit}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setObjectKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime &&
                                      kf.objectId === objectKf.objectId
                                        ? {
                                            ...kf,
                                            easing:
                                              value === "linear"
                                                ? undefined
                                                : value,
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              >
                                {easingOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )}
                            {cameraKf && (
                              <select
                                value={cameraKf.easing || "linear"}
                                aria-label="Camera easing"
                                disabled={!hasSelection}
                                onFocus={handleBeginEdit}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setCameraKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime
                                        ? {
                                            ...kf,
                                            easing:
                                              value === "linear"
                                                ? undefined
                                                : value,
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              >
                                {easingOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}

                        {/* Row 4: Curve Viewer */}
                        {(objectKf || cameraKf) &&
                          (() => {
                            const easingData = getEasingPath(
                              (objectKf?.easing || cameraKf?.easing) ??
                                "linear",
                            );
                            const range = easingData.maxY - easingData.minY;
                            const showExtendedRange = range > 1.1;
                            return (
                              <div className="flex items-start gap-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14 pt-1">
                                  Curve
                                </label>
                                <div className="flex-1 relative">
                                  <svg
                                    viewBox="0 0 120 60"
                                    className="w-full h-16 border border-gray-200/50 dark:border-gray-700/50 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
                                    preserveAspectRatio="none"
                                  >
                                    {/* Grid lines */}
                                    <line
                                      x1="0"
                                      y1="30"
                                      x2="120"
                                      y2="30"
                                      stroke="rgba(148,163,184,0.2)"
                                      strokeWidth="1"
                                    />
                                    <line
                                      x1="60"
                                      y1="0"
                                      x2="60"
                                      y2="60"
                                      stroke="rgba(148,163,184,0.2)"
                                      strokeWidth="1"
                                    />
                                    {/* Linear reference */}
                                    <line
                                      x1="0"
                                      y1="60"
                                      x2="120"
                                      y2="0"
                                      stroke="rgba(148,163,184,0.3)"
                                      strokeWidth="1"
                                      strokeDasharray="4 4"
                                    />
                                    {/* 0 and 1 boundary lines for extended curves */}
                                    {showExtendedRange && (
                                      <>
                                        <line
                                          x1="0"
                                          y1={
                                            60 -
                                            ((0 - easingData.minY) / range) * 60
                                          }
                                          x2="120"
                                          y2={
                                            60 -
                                            ((0 - easingData.minY) / range) * 60
                                          }
                                          stroke="rgba(239,68,68,0.4)"
                                          strokeWidth="1"
                                          strokeDasharray="2 2"
                                        />
                                        <line
                                          x1="0"
                                          y1={
                                            60 -
                                            ((1 - easingData.minY) / range) * 60
                                          }
                                          x2="120"
                                          y2={
                                            60 -
                                            ((1 - easingData.minY) / range) * 60
                                          }
                                          stroke="rgba(34,197,94,0.4)"
                                          strokeWidth="1"
                                          strokeDasharray="2 2"
                                        />
                                      </>
                                    )}
                                    {/* Easing curve */}
                                    <path
                                      d={easingData.path}
                                      fill="none"
                                      stroke="url(#easing-gradient)"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <defs>
                                      <linearGradient
                                        id="easing-gradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                      >
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop
                                          offset="100%"
                                          stopColor="#8b5cf6"
                                        />
                                      </linearGradient>
                                    </defs>
                                  </svg>
                                  {/* Value range indicator */}
                                  {showExtendedRange && (
                                    <div className="absolute -right-1 top-0 bottom-0 flex flex-col justify-between text-[9px] text-gray-400 dark:text-gray-500">
                                      <span>{easingData.maxY.toFixed(1)}</span>
                                      <span>{easingData.minY.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                      </div>
                    )}

                    {hasSelection && (
                      <div className="flex flex-col gap-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Grid3x3 className="w-3 h-3" />
                            Bulk:
                          </span>
                        </div>

                        {/* Delete Row */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleDeleteAllKeyframesAtTime}
                            disabled={!hasSelection}
                            className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            title={
                              selectedObject
                                ? "Delete all keyframes for this object"
                                : "Delete all camera keyframes"
                            }
                          >
                            <Trash2 className="w-3 h-3" />
                            {selectedObject
                              ? "Delete All Object KF"
                              : "Delete All Camera KF"}
                          </button>
                        </div>

                        {/* Shift Row */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleShiftAllKeyframes}
                            disabled={!hasSelection}
                            className="px-2.5 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            title="Shift all keyframes by delta"
                          >
                            <Clock className="w-3 h-3" />
                            Shift All
                          </button>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.05"
                              value={bulkShiftSeconds}
                              onChange={(e) =>
                                setBulkShiftSeconds(Number(e.target.value))
                              }
                              disabled={!hasSelection}
                              className="w-16 px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              title="Shift all keyframes by seconds"
                            />
                            <span className="text-xs text-gray-400">s</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {objectKf?.transform && (
                        <div className="flex flex-wrap items-center gap-4">
                          {/* Position */}
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Position:
                            </label>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                x
                              </label>
                              <input
                                key={`pos-x-${selectedKeyframeTime}-${objectKf.objectId}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(
                                  objectKf.transform.position.x,
                                )}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setObjectKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime &&
                                      kf.objectId === objectKf.objectId
                                        ? {
                                            ...kf,
                                            transform: {
                                              ...kf.transform,
                                              position: {
                                                ...kf.transform.position,
                                                x: value,
                                              },
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                y
                              </label>
                              <input
                                key={`pos-y-${selectedKeyframeTime}-${objectKf.objectId}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(
                                  objectKf.transform.position.y,
                                )}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setObjectKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime &&
                                      kf.objectId === objectKf.objectId
                                        ? {
                                            ...kf,
                                            transform: {
                                              ...kf.transform,
                                              position: {
                                                ...kf.transform.position,
                                                y: value,
                                              },
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                z
                              </label>
                              <input
                                key={`pos-z-${selectedKeyframeTime}-${objectKf.objectId}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(
                                  objectKf.transform.position.z,
                                )}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setObjectKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime &&
                                      kf.objectId === objectKf.objectId
                                        ? {
                                            ...kf,
                                            transform: {
                                              ...kf.transform,
                                              position: {
                                                ...kf.transform.position,
                                                z: value,
                                              },
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>

                          {/* Rotation */}
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Rotation:
                            </label>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                x
                              </label>
                              <input
                                key={`rot-x-${selectedKeyframeTime}-${objectKf.objectId}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(
                                  THREE.MathUtils.radToDeg(
                                    objectKf.transform.rotation.x,
                                  ),
                                )}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setObjectKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime &&
                                      kf.objectId === objectKf.objectId
                                        ? {
                                            ...kf,
                                            transform: {
                                              ...kf.transform,
                                              rotation: {
                                                ...kf.transform.rotation,
                                                x: THREE.MathUtils.degToRad(
                                                  value,
                                                ),
                                              },
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                y
                              </label>
                              <input
                                key={`rot-y-${selectedKeyframeTime}-${objectKf.objectId}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(
                                  THREE.MathUtils.radToDeg(
                                    objectKf.transform.rotation.y,
                                  ),
                                )}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setObjectKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime &&
                                      kf.objectId === objectKf.objectId
                                        ? {
                                            ...kf,
                                            transform: {
                                              ...kf.transform,
                                              rotation: {
                                                ...kf.transform.rotation,
                                                y: THREE.MathUtils.degToRad(
                                                  value,
                                                ),
                                              },
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                z
                              </label>
                              <input
                                key={`rot-z-${selectedKeyframeTime}-${objectKf.objectId}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(
                                  THREE.MathUtils.radToDeg(
                                    objectKf.transform.rotation.z,
                                  ),
                                )}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setObjectKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime &&
                                      kf.objectId === objectKf.objectId
                                        ? {
                                            ...kf,
                                            transform: {
                                              ...kf.transform,
                                              rotation: {
                                                ...kf.transform.rotation,
                                                z: THREE.MathUtils.degToRad(
                                                  value,
                                                ),
                                              },
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>

                          {/* Scale */}
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Scale:
                            </label>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                x
                              </label>
                              <input
                                key={`scale-x-${selectedKeyframeTime}-${objectKf.objectId}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(
                                  objectKf.transform.scale.x,
                                )}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setObjectKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime &&
                                      kf.objectId === objectKf.objectId
                                        ? {
                                            ...kf,
                                            transform: {
                                              ...kf.transform,
                                              scale: {
                                                ...kf.transform.scale,
                                                x: value,
                                              },
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                y
                              </label>
                              <input
                                key={`scale-y-${selectedKeyframeTime}-${objectKf.objectId}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(
                                  objectKf.transform.scale.y,
                                )}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setObjectKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime &&
                                      kf.objectId === objectKf.objectId
                                        ? {
                                            ...kf,
                                            transform: {
                                              ...kf.transform,
                                              scale: {
                                                ...kf.transform.scale,
                                                y: value,
                                              },
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                z
                              </label>
                              <input
                                key={`scale-z-${selectedKeyframeTime}-${objectKf.objectId}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(
                                  objectKf.transform.scale.z,
                                )}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setObjectKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime &&
                                      kf.objectId === objectKf.objectId
                                        ? {
                                            ...kf,
                                            transform: {
                                              ...kf.transform,
                                              scale: {
                                                ...kf.transform.scale,
                                                z: value,
                                              },
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Visibility */}
                      {objectKf && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Visibility:
                          </label>
                          <input
                            type="checkbox"
                            checked={objectKf.visible ?? true}
                            onChange={(e) => {
                              handleBeginEdit();
                              setObjectKeyframes((prev) =>
                                prev.map((kf) =>
                                  kf.time === selectedKeyframeTime &&
                                  kf.objectId === objectKf.objectId
                                    ? { ...kf, visible: e.target.checked }
                                    : kf,
                                ),
                              );
                            }}
                            disabled={!hasSelection}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      )}

                      {/* Camera Position */}
                      {cameraKf?.position && (
                        <>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16 shrink-0">
                              Camera Position:
                            </label>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                x
                              </label>
                              <input
                                key={`cam-pos-x-${selectedKeyframeTime}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(cameraKf.position.x)}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setCameraKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime
                                        ? {
                                            ...kf,
                                            position: {
                                              ...kf.position,
                                              x: value,
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                y
                              </label>
                              <input
                                key={`cam-pos-y-${selectedKeyframeTime}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(cameraKf.position.y)}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setCameraKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime
                                        ? {
                                            ...kf,
                                            position: {
                                              ...kf.position,
                                              y: value,
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                z
                              </label>
                              <input
                                key={`cam-pos-z-${selectedKeyframeTime}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(cameraKf.position.z)}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setCameraKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime
                                        ? {
                                            ...kf,
                                            position: {
                                              ...kf.position,
                                              z: value,
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>

                          {/* Camera Target */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16 shrink-0">
                              Camera Target:
                            </label>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                x
                              </label>
                              <input
                                key={`cam-target-x-${selectedKeyframeTime}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(cameraKf.target.x)}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setCameraKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime
                                        ? {
                                            ...kf,
                                            target: {
                                              ...kf.target,
                                              x: value,
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                y
                              </label>
                              <input
                                key={`cam-target-y-${selectedKeyframeTime}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(cameraKf.target.y)}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setCameraKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime
                                        ? {
                                            ...kf,
                                            target: {
                                              ...kf.target,
                                              y: value,
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-500">
                                z
                              </label>
                              <input
                                key={`cam-target-z-${selectedKeyframeTime}`}
                                type="number"
                                step="0.001"
                                defaultValue={roundTo3(cameraKf.target.z)}
                                onFocus={handleBeginEdit}
                                onBlur={(e) => {
                                  const value = roundTo3(
                                    Number(e.target.value),
                                  );
                                  setCameraKeyframes((prev) =>
                                    prev.map((kf) =>
                                      kf.time === selectedKeyframeTime
                                        ? {
                                            ...kf,
                                            target: {
                                              ...kf.target,
                                              z: value,
                                            },
                                          }
                                        : kf,
                                    ),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
