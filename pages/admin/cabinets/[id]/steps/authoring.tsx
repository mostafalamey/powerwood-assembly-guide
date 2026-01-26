import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import * as THREE from "three";
import AdminLayout from "../../../../../components/admin/AdminLayout";
import AuthGuard from "../../../../../components/admin/AuthGuard";
import AuthoringSceneViewer from "../../../../../components/admin/AuthoringSceneViewer";
import ObjectHierarchyTree from "../../../../../components/admin/ObjectHierarchyTree";
import Timeline from "../../../../../components/admin/Timeline";
import {
  ObjectKeyframe,
  CameraKeyframe,
  StepAnimation,
} from "../../../../../types/animation";

export default function StepAuthoringPage() {
  const router = useRouter();
  const { id, step } = router.query;
  const [sceneReady, setSceneReady] = useState(false);
  const [modelPath, setModelPath] = useState<string | undefined>(undefined);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cabinet, setCabinet] = useState<any>(null);
  const loadedModelRef = useRef<any>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
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

  // Fetch cabinet data to get the model path
  useEffect(() => {
    if (!id) return;

    const fetchCabinet = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`/api/cabinets?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCabinet(data);
          // Auto-load the cabinet's 3D model if it has one
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
        console.error("Error loading cabinet:", err);
      }
    };

    fetchCabinet();
  }, [id]);

  useEffect(() => {
    if (!step || !cabinet?.steps) return;
    const stepData = cabinet.steps.find((s: any) => s.id === step);
    const nextAudioUrl =
      stepData?.audioUrl?.en || stepData?.audioUrl?.ar || null;
    setAudioUrl(nextAudioUrl);
  }, [step, cabinet]);

  const handleSceneReady = useCallback((scene: any, camera: any) => {
    setSceneReady(true);
  }, []);

  const handleModelLoaded = useCallback((model: any) => {
    setModelLoaded(true);
    setLoadError(null);
    loadedModelRef.current = model;
    forceUpdate({}); // Force one update to show the tree
  }, []);

  const handleLoadError = useCallback((error: Error) => {
    setLoadError(error.message);
    setModelLoaded(false);
  }, []);

  const handleSelectObject = useCallback((object: any) => {
    setSelectedObject(object);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

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
      if (!selectedObject) return;
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
  }, [selectedObject]);

  // Convert editor keyframes to production format
  // Save animation to cabinet JSON file
  const handleSaveAnimation = useCallback(async () => {
    try {
      const animationData: StepAnimation = {
        duration,
        objectKeyframes,
        cameraKeyframes,
      };

      // Save to the step in the cabinet JSON
      const response = await fetch(
        `/api/admin/cabinets/${id}/steps/${step}/animation`,
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

      alert("Animation saved successfully!");
    } catch (error) {
      console.error("Error saving animation:", error);
      alert("Failed to save animation. Please try again.");
    }
  }, [id, step, duration, objectKeyframes, cameraKeyframes]);

  // Load animation from cabinet JSON
  const loadAnimation = useCallback((animationData: StepAnimation) => {
    if (!animationData) return;

    try {
      setDuration(animationData.duration);
      setObjectKeyframes(animationData.objectKeyframes || []);
      setCameraKeyframes(animationData.cameraKeyframes || []);
      setCurrentTime(0);
      setIsPlaying(false);
    } catch (error) {
      console.error("Failed to load animation:", error);
    }
  }, []);

  // Load animation from JSON
  const handleLoadAnimation = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const animation: StepAnimation = JSON.parse(json);

          setDuration(animation.duration);
          setObjectKeyframes(animation.objectKeyframes);
          setCameraKeyframes(animation.cameraKeyframes);
          setCurrentTime(0);
          setIsPlaying(false);
        } catch (error) {
          console.error("Failed to load animation:", error);
          alert("Failed to load animation file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    },
    [],
  );

  // Helper to get object path/ID
  const getObjectId = (obj: any): string => {
    const parts: string[] = [];
    let current = obj;
    while (current && current !== loadedModelRef.current) {
      if (current.name) parts.unshift(current.name);
      current = current.parent;
    }
    return parts.join("/") || obj.uuid;
  };

  // Record keyframe for selected object
  const handleRecordKeyframe = useCallback(() => {
    if (!selectedObject) return;

    const objectId = getObjectId(selectedObject);
    const newKeyframe: ObjectKeyframe = {
      time: currentTime,
      objectId,
      transform: {
        position: {
          x: selectedObject.position.x,
          y: selectedObject.position.y,
          z: selectedObject.position.z,
        },
        rotation: {
          x: selectedObject.rotation.x,
          y: selectedObject.rotation.y,
          z: selectedObject.rotation.z,
        },
        scale: {
          x: selectedObject.scale.x,
          y: selectedObject.scale.y,
          z: selectedObject.scale.z,
        },
      },
      visible: selectedObject.visible,
    };

    setObjectKeyframes((prev) => {
      // Remove existing keyframe at same time for same object
      const filtered = prev.filter(
        (kf) => !(kf.time === currentTime && kf.objectId === objectId),
      );
      // Add new keyframe and sort by time
      return [...filtered, newKeyframe].sort((a, b) => a.time - b.time);
    });
  }, [selectedObject, currentTime]);

  // Record camera keyframe
  const handleRecordCameraKeyframe = useCallback(() => {
    const cameraState = (window as any).__getCameraState?.();
    if (!cameraState) return;

    const newKeyframe: CameraKeyframe = {
      time: currentTime,
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
      const filtered = prev.filter((kf) => kf.time !== currentTime);
      // Add new keyframe and sort by time
      return [...filtered, newKeyframe].sort((a, b) => a.time - b.time);
    });
  }, [currentTime]);

  // Delete camera keyframe
  const handleDeleteCameraKeyframe = useCallback(() => {
    setCameraKeyframes((prev) => prev.filter((kf) => kf.time !== currentTime));
  }, [currentTime]);

  // Delete keyframe at current time for selected object
  const handleDeleteKeyframe = useCallback(() => {
    if (!selectedObject) return;

    const objectId = getObjectId(selectedObject);
    setObjectKeyframes((prev) =>
      prev.filter(
        (kf) => !(kf.time === currentTime && kf.objectId === objectId),
      ),
    );
  }, [selectedObject, currentTime]);

  // Handle keyframe moved on timeline
  const handleKeyframeMoved = useCallback(
    (oldTime: number, newTime: number) => {
      // Update object keyframes
      setObjectKeyframes((prev) =>
        prev
          .map((kf) => (kf.time === oldTime ? { ...kf, time: newTime } : kf))
          .sort((a, b) => a.time - b.time),
      );

      // Update camera keyframes
      setCameraKeyframes((prev) =>
        prev
          .map((kf) => (kf.time === oldTime ? { ...kf, time: newTime } : kf))
          .sort((a, b) => a.time - b.time),
      );

      // Update selected keyframe time if it was moved
      if (selectedKeyframeTime === oldTime) {
        setSelectedKeyframeTime(newTime);
      }
    },
    [selectedKeyframeTime],
  );

  // Handle keyframe selection
  const handleKeyframeSelect = useCallback((time: number) => {
    setSelectedKeyframeTime(time);
  }, []);

  // Get all unique keyframe times for timeline
  const allKeyframeTimes = [
    ...new Set([
      ...objectKeyframes.map((kf) => kf.time),
      ...cameraKeyframes.map((kf) => kf.time),
    ]),
  ];

  // Get filtered keyframes based on selection
  const timelineKeyframes = selectedObject
    ? // If object is selected, show keyframes for it and all its children
      (() => {
        const objectIds = new Set<string>();
        objectIds.add(getObjectId(selectedObject));

        // Traverse and collect all children IDs
        selectedObject.traverse((child: any) => {
          objectIds.add(getObjectId(child));
        });

        // Filter keyframes that belong to this object or its children
        return objectKeyframes
          .filter((kf) => objectIds.has(kf.objectId))
          .map((kf) => kf.time);
      })()
    : // If no object selected, show camera keyframes
      cameraKeyframes.map((kf) => kf.time);

  // Apply animation at current time
  useEffect(() => {
    if (!loadedModelRef.current) return;

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
      ...new Set(objectKeyframes.map((kf) => kf.objectId)),
    ];

    // Apply object transforms for each unique object
    uniqueObjectIds.forEach((objectId) => {
      const targetObj = findObjectById(loadedModelRef.current!, objectId);
      if (!targetObj) return;

      // Get keyframes for this object sorted by time
      const objKeyframes = objectKeyframes
        .filter((k) => k.objectId === objectId)
        .sort((a, b) => a.time - b.time);

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
        const t = (currentTime - prevKf.time) / (nextKf.time - prevKf.time);

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
            // Update shadow casting based on visibility
            child.castShadow = visible;
          }
        });
      }
    });

    // Apply camera transforms
    const getCameraState = (window as any).__getCameraState;
    if (getCameraState && cameraKeyframes.length > 0) {
      // Get camera keyframes sorted by time
      const sortedCameraKfs = [...cameraKeyframes].sort(
        (a, b) => a.time - b.time,
      );

      // Find the keyframes to interpolate between
      let prevKf: CameraKeyframe | null = null;
      let nextKf: CameraKeyframe | null = null;

      for (let i = 0; i < sortedCameraKfs.length; i++) {
        if (sortedCameraKfs[i].time <= currentTime) {
          prevKf = sortedCameraKfs[i];
        }
        if (sortedCameraKfs[i].time > currentTime && !nextKf) {
          nextKf = sortedCameraKfs[i];
        }
      }

      // Apply camera transform based on keyframes
      if (prevKf && nextKf) {
        // Interpolate between keyframes
        const t = (currentTime - prevKf.time) / (nextKf.time - prevKf.time);

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
  }, [currentTime, objectKeyframes, cameraKeyframes, loadedModelRef]);

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

    audio.src = audioUrl;
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

  // Load cabinet step animation on mount
  useEffect(() => {
    if (!id || !step) return;

    const loadStepAnimation = () => {
      try {
        // Import cabinet data directly from source (same as viewer)
        const cabinetData = require(`../../../../../data/cabinets/${id}.json`);
        const stepData = cabinetData.steps?.find((s: any) => s.id === step);

        if (stepData?.animation) {
          loadAnimation(stepData.animation);
        }
      } catch (error) {
        console.error("Error loading step animation:", error);
      }
    };

    loadStepAnimation();
  }, [id, step, loadAnimation]);

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

  return (
    <AuthGuard>
      <Head>
        <title>Visual Step Editor - Admin Panel</title>
      </Head>
      <AdminLayout title="Visual Step Editor">
        <div className="h-[calc(100vh-140px)] flex flex-col">
          <audio ref={audioRef} className="hidden" preload="auto" />
          {/* Top toolbar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center gap-2 sm:gap-4">
            <Link
              href={`/admin/cabinets/${id}/steps`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm flex items-center gap-1"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Back to Steps</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1 sm:flex-initial">
              Cabinet: {id}
              {step &&
                cabinet?.steps &&
                (() => {
                  const stepData = cabinet.steps.find(
                    (s: any) => s.id === step,
                  );
                  return stepData
                    ? ` - Step ${step}: ${stepData.title?.en || ""}`
                    : ` - Step: ${step}`;
                })()}
            </span>

            {/* Right side controls */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              {/* Transform mode buttons */}
              <div className="hidden md:flex gap-1 bg-gray-100 dark:bg-gray-700 rounded p-1">
                <button
                  onClick={() => setTransformMode("translate")}
                  disabled={!selectedObject}
                  title="Move (W)"
                  className={`px-2 sm:px-3 py-1.5 text-sm rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    transformMode === "translate" && selectedObject
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setTransformMode("rotate")}
                  disabled={!selectedObject}
                  title="Rotate (E)"
                  className={`px-2 sm:px-3 py-1.5 text-sm rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    transformMode === "rotate" && selectedObject
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setTransformMode("scale")}
                  disabled={!selectedObject}
                  title="Scale (R)"
                  className={`px-2 sm:px-3 py-1.5 text-sm rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    transformMode === "scale" && selectedObject
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
              </div>

              {/* Snap settings dropdown - Desktop only */}
              <div className="hidden md:block relative" ref={snapDropdownRef}>
                <button
                  onClick={() => setSnapDropdownOpen(!snapDropdownOpen)}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Snap Settings"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </button>

                {/* Dropdown panel */}
                {snapDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Snap Settings
                    </h4>

                    {/* Translation snap */}
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
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
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
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
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            °
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Save button - always visible */}
              <button
                onClick={handleSaveAnimation}
                disabled={
                  !sceneReady ||
                  (objectKeyframes.length === 0 && cameraKeyframes.length === 0)
                }
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 font-medium"
                title="Save animation to step"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                <span className="hidden sm:inline">Save Animation</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
            {/* 3D Viewport */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 min-h-[50vh] md:min-h-0">
              <AuthoringSceneViewer
                modelPath={modelPath}
                selectedObject={selectedObject}
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
                onSceneReady={handleSceneReady}
                onModelLoaded={handleModelLoaded}
                onLoadError={handleLoadError}
                onObjectSelected={handleSelectObject}
                onGetCameraState={() => null}
              />
            </div>

            {/* Right sidebar - Controls (collapsible on mobile) */}
            <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 flex flex-col max-h-[40vh] md:max-h-none overflow-y-auto">
              {/* Scene Status Section */}
              <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Scene Status
                </h3>
                <div className="text-xs sm:text-sm">
                  {sceneReady ? (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ Ready
                    </span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">
                      Initializing...
                    </span>
                  )}
                  {modelLoaded && (
                    <span className="ml-2 text-green-600 dark:text-green-400">
                      • Model loaded
                    </span>
                  )}
                </div>
              </div>

              {/* Object Hierarchy Tree */}
              {modelLoaded && loadedModelRef.current ? (
                <div className="flex-1 overflow-hidden border-b border-gray-200 dark:border-gray-700">
                  <ObjectHierarchyTree
                    model={loadedModelRef.current}
                    selectedObject={selectedObject}
                    onSelectObject={handleSelectObject}
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
                  {/* Model Upload */}
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2 sm:mb-3">
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
                            file:rounded file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100
                            dark:file:bg-blue-900/30 dark:file:text-blue-400
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </label>

                      {loadError && (
                        <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                          <svg
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{loadError}</span>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {cabinet?.model
                          ? "Cabinet model will load automatically, or upload a different one."
                          : "Upload a 3D model to begin creating animations."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
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
              selectedObject
                ? objectKeyframes.some(
                    (kf) =>
                      kf.time === currentTime &&
                      kf.objectId === getObjectId(selectedObject),
                  )
                : false
            }
            canRecordObjectKeyframe={!!selectedObject}
            onKeyframeMoved={handleKeyframeMoved}
            onKeyframeSelect={handleKeyframeSelect}
          />

          {/* Keyframe Properties Editor */}
          {selectedKeyframeTime !== null && (
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
              {(() => {
                // Find the selected keyframe(s)
                const objectKf = selectedObject
                  ? objectKeyframes.find(
                      (kf) =>
                        kf.time === selectedKeyframeTime &&
                        kf.objectId === getObjectId(selectedObject),
                    )
                  : undefined;

                const cameraKf = !selectedObject
                  ? cameraKeyframes.find(
                      (kf) => kf.time === selectedKeyframeTime,
                    )
                  : undefined;

                if (!objectKf && !cameraKf) {
                  return (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No keyframe data available
                    </p>
                  );
                }

                return (
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Time */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        Time (seconds)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={duration}
                        value={selectedKeyframeTime}
                        onChange={(e) => {
                          const newTime = Math.max(
                            0,
                            Math.min(duration, Number(e.target.value)),
                          );
                          handleKeyframeMoved(selectedKeyframeTime, newTime);
                        }}
                        title="Keyframe time in seconds"
                        className="w-24 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Position */}
                    {objectKf?.transform?.position && (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Position:
                          </label>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-500">
                              x
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={objectKf.transform.position.x}
                              onChange={(e) => {
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
                                              x: Number(e.target.value),
                                            },
                                          },
                                        }
                                      : kf,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-500">
                              y
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={objectKf.transform.position.y}
                              onChange={(e) => {
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
                                              y: Number(e.target.value),
                                            },
                                          },
                                        }
                                      : kf,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-500">
                              z
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={objectKf.transform.position.z}
                              onChange={(e) => {
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
                                              z: Number(e.target.value),
                                            },
                                          },
                                        }
                                      : kf,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Rotation */}
                    {objectKf?.transform?.rotation && (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Rotation:
                          </label>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-500">
                              x
                            </label>
                            <input
                              type="number"
                              step="1"
                              value={THREE.MathUtils.radToDeg(
                                objectKf.transform.rotation.x,
                              )}
                              onChange={(e) => {
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
                                                Number(e.target.value),
                                              ),
                                            },
                                          },
                                        }
                                      : kf,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-500">
                              y
                            </label>
                            <input
                              type="number"
                              step="1"
                              value={THREE.MathUtils.radToDeg(
                                objectKf.transform.rotation.y,
                              )}
                              onChange={(e) => {
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
                                                Number(e.target.value),
                                              ),
                                            },
                                          },
                                        }
                                      : kf,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-500">
                              z
                            </label>
                            <input
                              type="number"
                              step="1"
                              value={THREE.MathUtils.radToDeg(
                                objectKf.transform.rotation.z,
                              )}
                              onChange={(e) => {
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
                                                Number(e.target.value),
                                              ),
                                            },
                                          },
                                        }
                                      : kf,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </>
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
                            setObjectKeyframes((prev) =>
                              prev.map((kf) =>
                                kf.time === selectedKeyframeTime &&
                                kf.objectId === objectKf.objectId
                                  ? { ...kf, visible: e.target.checked }
                                  : kf,
                              ),
                            );
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    )}

                    {/* Camera Position */}
                    {cameraKf?.position && (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Camera Position:
                          </label>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-500">
                              x
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={cameraKf.position.x}
                              onChange={(e) => {
                                setCameraKeyframes((prev) =>
                                  prev.map((kf) =>
                                    kf.time === selectedKeyframeTime
                                      ? {
                                          ...kf,
                                          position: {
                                            ...kf.position,
                                            x: Number(e.target.value),
                                          },
                                        }
                                      : kf,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-500">
                              y
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={cameraKf.position.y}
                              onChange={(e) => {
                                setCameraKeyframes((prev) =>
                                  prev.map((kf) =>
                                    kf.time === selectedKeyframeTime
                                      ? {
                                          ...kf,
                                          position: {
                                            ...kf.position,
                                            y: Number(e.target.value),
                                          },
                                        }
                                      : kf,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-500">
                              z
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={cameraKf.position.z}
                              onChange={(e) => {
                                setCameraKeyframes((prev) =>
                                  prev.map((kf) =>
                                    kf.time === selectedKeyframeTime
                                      ? {
                                          ...kf,
                                          position: {
                                            ...kf.position,
                                            z: Number(e.target.value),
                                          },
                                        }
                                      : kf,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Camera Target */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Camera Target:
                          </label>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-500">
                              x
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={cameraKf.target.x}
                              onChange={(e) => {
                                setCameraKeyframes((prev) =>
                                  prev.map((kf) =>
                                    kf.time === selectedKeyframeTime
                                      ? {
                                          ...kf,
                                          target: {
                                            ...kf.target,
                                            x: Number(e.target.value),
                                          },
                                        }
                                      : kf,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-500">
                              y
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={cameraKf.target.y}
                              onChange={(e) => {
                                setCameraKeyframes((prev) =>
                                  prev.map((kf) =>
                                    kf.time === selectedKeyframeTime
                                      ? {
                                          ...kf,
                                          target: {
                                            ...kf.target,
                                            y: Number(e.target.value),
                                          },
                                        }
                                      : kf,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-500">
                              z
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={cameraKf.target.z}
                              onChange={(e) => {
                                setCameraKeyframes((prev) =>
                                  prev.map((kf) =>
                                    kf.time === selectedKeyframeTime
                                      ? {
                                          ...kf,
                                          target: {
                                            ...kf.target,
                                            z: Number(e.target.value),
                                          },
                                        }
                                      : kf,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
