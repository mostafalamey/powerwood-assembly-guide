import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useTranslation } from "@/lib/i18n";
import Header from "@/components/Header";
import SceneViewer from "@/components/3d/SceneViewer";
import StepNavigation from "@/components/StepNavigation";
import AudioPlayer from "@/components/AudioPlayer";
import { Cabinet, Step } from "@/types/assembly";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronDown,
  Box,
  Wrench,
  Clock,
} from "lucide-react";

export default function StepPage() {
  const router = useRouter();
  const { id, stepId } = router.query;
  const { t, locale } = useTranslation();

  const [assembly, setCabinet] = useState<Assembly | null>(null);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneViewerKey, setSceneViewerKey] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true); // Start true, set false on completion
  const [isDesktop, setIsDesktop] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(0);
  const audioPlayerRef = useRef<{
    seekTo: (time: number) => void;
    play: () => void;
    pause: () => void;
    getCurrentTime: () => number;
    getDuration: () => number;
  } | null>(null);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (!id) return;

    // Fetch assembly from API instead of bundled data
    const fetchAssembly = async () => {
      try {
        const response = await fetch(`/api/assemblies?id=${id}&_=${Date.now()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          router.push("/");
          return;
        }

        const foundCabinet = await response.json();

        setCabinet(foundCabinet);

        if (stepId && foundCabinet.steps) {
          const stepIndex = foundCabinet.steps.findIndex(
            (s: any) => s.id === stepId,
          );
          if (stepIndex !== -1) {
            setCurrentStep(foundCabinet.steps[stepIndex] as Step);
            setCurrentStepIndex(stepIndex);
          } else {
            router.push(`/assembly/${id}`);
          }
        } else if (foundCabinet.steps && foundCabinet.steps.length > 0) {
          const firstStep = foundCabinet.steps[0] as Step;
          router.push(`/assembly/${id}/step/${firstStep.id}`);
        }
      } catch (error) {
        console.error("Error fetching cabinet:", error);
        router.push("/");
      }
    };

    fetchAssembly();
  }, [id, stepId, router]);

  // Reset isAnimating when step changes (don't auto-start)
  useEffect(() => {
    setIsAnimating(false);
    setIsPlaying(false);
    setAnimationProgress(0);
  }, [stepId]);

  // Get animation duration from current step
  useEffect(() => {
    if (currentStep?.animation?.duration) {
      setAnimationDuration(currentStep.animation.duration);
    } else {
      setAnimationDuration(5); // Default 5 seconds
    }
  }, [currentStep]);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    setIsPlaying(false);
  }, []);

  const handleAnimationProgress = useCallback(
    (time: number, duration: number) => {
      setAnimationProgress(time);
      setAnimationDuration(duration);
    },
    [],
  );

  const handlePlayPause = useCallback(() => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    setIsAnimating(newPlayingState);

    if (newPlayingState) {
      // Start/resume animation
      if (typeof window !== "undefined" && (window as any).playStepAnimation) {
        (window as any).playStepAnimation();
      }
      // Also play audio
      audioPlayerRef.current?.play();
    } else {
      // Pause animation
      if (typeof window !== "undefined" && (window as any).pauseStepAnimation) {
        (window as any).pauseStepAnimation();
      }
      // Also pause audio
      audioPlayerRef.current?.pause();
    }
  }, [isPlaying]);

  const handleRestart = useCallback(() => {
    setIsPlaying(false);
    setIsAnimating(true);
    setAnimationProgress(0);
    setSceneViewerKey((prev) => prev + 1);
    // Also restart audio
    audioPlayerRef.current?.seekTo(0);
  }, []);

  const handleReset = useCallback(() => {
    // Reset to beginning without changing play/pause state
    setAnimationProgress(0);

    // Reset animation and camera to start position
    if (typeof window !== "undefined" && (window as any).resetToStart) {
      (window as any).resetToStart();
    }

    // Seek audio to beginning
    audioPlayerRef.current?.seekTo(0);

    // If currently playing, ensure animation continues playing
    if (isPlaying) {
      if (typeof window !== "undefined" && (window as any).playStepAnimation) {
        (window as any).playStepAnimation();
      }
    }
  }, [isPlaying]);

  const handleAudioPlayPause = useCallback((playing: boolean) => {
    setIsPlaying(playing);
    if (playing) {
      // Start animation when audio plays
      setIsAnimating(true);
      if (typeof window !== "undefined" && (window as any).playStepAnimation) {
        (window as any).playStepAnimation();
      }
    } else {
      // Pause animation when audio pauses
      if (typeof window !== "undefined" && (window as any).pauseStepAnimation) {
        (window as any).pauseStepAnimation();
      }
    }
  }, []);

  const handleAudioTimeUpdate = useCallback((time: number) => {
    // Sync animation to audio time
    if (typeof window !== "undefined" && (window as any).seekStepAnimation) {
      (window as any).seekStepAnimation(time);
    }
    setAnimationProgress(time);
  }, []);

  const handleTimelineScrub = useCallback((time: number) => {
    // Sync both animation and audio to new time
    if (typeof window !== "undefined" && (window as any).seekStepAnimation) {
      (window as any).seekStepAnimation(time);
    }
    audioPlayerRef.current?.seekTo(time);
    setAnimationProgress(time);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Navigation handlers for fullscreen mode
  const handlePrevStep = useCallback(() => {
    if (cabinet?.steps && currentStepIndex > 0) {
      const prevStep = assembly.steps[currentStepIndex - 1] as Step;
      router.push(`/assembly/${id}/step/${prevStep.id}`);
    }
  }, [assembly, currentStepIndex, id, router]);

  const handleNextStep = useCallback(() => {
    if (cabinet?.steps && currentStepIndex < assembly.steps.length - 1) {
      const nextStep = assembly.steps[currentStepIndex + 1] as Step;
      router.push(`/assembly/${id}/step/${nextStep.id}`);
    }
  }, [assembly, currentStepIndex, id, router]);

  // Format time helper for timeline display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!cabinet || !currentStep) {
    return (
      <>
        <Head>
          <title>{t("loading")}</title>
        </Head>
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
          <Header showBackButton />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {t("loading")}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Handle both old and new data formats
  const cabinetName =
    typeof assembly.name === "string"
      ? locale === "ar"
        ? (cabinet as any).nameAr
        : assembly.name
      : locale === "ar"
        ? assembly.name.ar
        : assembly.name.en;

  const stepTitle =
    typeof currentStep.title === "string"
      ? locale === "ar"
        ? (currentStep as any).titleAr
        : currentStep.title
      : locale === "ar"
        ? currentStep.title.ar
        : currentStep.title.en;

  const stepDescription =
    typeof currentStep.description === "string"
      ? locale === "ar"
        ? (currentStep as any).descriptionAr
        : currentStep.description
      : locale === "ar"
        ? currentStep.description.ar
        : currentStep.description.en;

  const modelUrl = (currentStep as any).model || (cabinet as any).model || null;

  return (
    <>
      <Head>
        <title>{`${stepTitle} - ${cabinetName}`}</title>
      </Head>

      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
        <Header showBackButton />

        <main className="flex-1 overflow-hidden">
          {/* Fullscreen Mode */}
          {isFullscreen && (
            <div className="fixed inset-0 z-50 bg-black">
              {/* Fullscreen 3D Scene */}
              <div className="absolute inset-0">
                {modelUrl && (
                  <SceneViewer
                    key={`fullscreen-${sceneViewerKey}`}
                    modelUrl={modelUrl}
                    currentStep={currentStep}
                    cameraPosition={currentStep.cameraPosition}
                    isPlaying={isPlaying}
                    shouldAutoStart={false}
                    height="100%"
                    onAnimationComplete={handleAnimationComplete}
                    onAnimationProgress={handleAnimationProgress}
                  />
                )}
              </div>

              {/* Fullscreen Overlay Controls */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top Bar - Exit Fullscreen & Step Info */}
                <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/60 to-transparent">
                  <button
                    onClick={toggleFullscreen}
                    className="w-11 h-11 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors"
                    aria-label={t("exitFullscreen") || "Exit fullscreen"}
                  >
                    <Minimize2 className="w-5 h-5 text-white" />
                  </button>
                  <div className="text-center flex-1 mx-3">
                    <p className="text-white/70 text-xs">{cabinetName}</p>
                    <h2 className="text-white font-semibold text-sm truncate">
                      {stepTitle}
                    </h2>
                  </div>
                  <div className="w-11 h-11 flex items-center justify-center">
                    <span className="text-white/70 text-sm font-medium">
                      {currentStepIndex + 1}/{assembly.steps?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 pointer-events-auto bg-gradient-to-t from-black/70 to-transparent">
                  {/* Timeline Scrubber */}
                  <div className="mb-4 px-2">
                    <input
                      type="range"
                      min="0"
                      max={animationDuration || 5}
                      step="0.01"
                      value={animationProgress}
                      onChange={(e) =>
                        handleTimelineScrub(parseFloat(e.target.value))
                      }
                      className="w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${
                          (animationProgress / (animationDuration || 5)) * 100
                        }%, rgba(255,255,255,0.3) ${
                          (animationProgress / (animationDuration || 5)) * 100
                        }%, rgba(255,255,255,0.3) 100%)`,
                      }}
                      aria-label={
                        t("animationProgress") || "Animation progress"
                      }
                    />
                    <div className="flex justify-between text-[10px] text-white/60 mt-1">
                      <span>{formatTime(animationProgress)}</span>
                      <span>{formatTime(animationDuration)}</span>
                    </div>
                  </div>

                  {/* Navigation & Play Controls */}
                  <div className="flex items-center justify-center gap-3">
                    {/* Previous Button */}
                    <button
                      onClick={handlePrevStep}
                      disabled={currentStepIndex === 0 || isAnimating}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        currentStepIndex === 0 || isAnimating
                          ? "bg-white/10 text-white/30 cursor-not-allowed"
                          : "bg-white/20 hover:bg-white/30 text-white"
                      }`}
                      aria-label={t("navigation.previous") || "Previous step"}
                    >
                      <SkipBack className="w-6 h-6 rtl:rotate-180" />
                    </button>

                    {/* Restart Button */}
                    <button
                      onClick={handleReset}
                      className="w-11 h-11 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                      aria-label={t("restart") || "Restart"}
                    >
                      <RotateCcw className="w-5 h-5 text-white" />
                    </button>

                    {/* Play/Pause Button */}
                    <button
                      onClick={handlePlayPause}
                      className="w-16 h-16 bg-primary-600 hover:bg-primary-700 rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-primary-600/30"
                      aria-label={
                        isPlaying ? t("pause") || "Pause" : t("play") || "Play"
                      }
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white" />
                      )}
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={handleNextStep}
                      disabled={
                        !assembly.steps ||
                        currentStepIndex >= assembly.steps.length - 1 ||
                        isAnimating
                      }
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        !assembly.steps ||
                        currentStepIndex >= assembly.steps.length - 1 ||
                        isAnimating
                          ? "bg-white/10 text-white/30 cursor-not-allowed"
                          : "bg-white/20 hover:bg-white/30 text-white"
                      }`}
                      aria-label={t("navigation.next") || "Next step"}
                    >
                      <SkipForward className="w-6 h-6 rtl:rotate-180" />
                    </button>

                    {/* Spacer for alignment */}
                    <div className="w-11 h-11" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Layout */}
          <div
            className={`lg:hidden h-full flex flex-col p-2 gap-2 ${isFullscreen ? "hidden" : ""}`}
          >
            {/* 3D Viewer - Mobile - Increased height */}
            <div className="flex-[3] min-h-[55vh] bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 dark:border-gray-700/50 overflow-hidden relative">
              {modelUrl ? (
                !isDesktop && (
                  <SceneViewer
                    key={sceneViewerKey}
                    modelUrl={modelUrl}
                    currentStep={currentStep}
                    cameraPosition={currentStep.cameraPosition}
                    isPlaying={isPlaying}
                    shouldAutoStart={false}
                    height="100%"
                    onAnimationComplete={handleAnimationComplete}
                    onAnimationProgress={handleAnimationProgress}
                  />
                )
              ) : (
                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 h-full">
                  <div className="text-center p-6">
                    <Box className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      3D Model Not Available
                    </p>
                  </div>
                </div>
              )}
              {/* Floating Controls on 3D View */}
              {modelUrl && (
                <div className="absolute top-3 end-3 flex gap-2 z-10">
                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg rounded-full flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                    aria-label={t("fullscreen") || "Fullscreen"}
                  >
                    <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  {/* Restart Button */}
                  <button
                    onClick={handleRestart}
                    className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg rounded-full flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                    aria-label="Restart animation"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              )}
            </div>

            {/* Step Info Card - Mobile */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 dark:border-gray-700/50 overflow-hidden">
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors min-h-[48px]"
              >
                <div className="flex-1 text-start">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {cabinetName}
                  </span>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    {stepTitle}
                  </h1>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isDescriptionExpanded ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${isDescriptionExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
              >
                <div className="px-3 pb-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-3">
                    {stepDescription}
                  </p>

                  {currentStep.toolsRequired &&
                    currentStep.toolsRequired.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("toolsRequired")}:
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {currentStep.toolsRequired.map((tool, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Audio Player - Mobile */}
            <AudioPlayer
              ref={audioPlayerRef}
              assemblyId={assembly.id}
              stepId={currentStep.id}
              audioUrl={currentStep.audioUrl}
              autoPlay={false}
              onPlayPause={handleAudioPlayPause}
              onTimeUpdate={handleAudioTimeUpdate}
            />

            {/* Navigation - Mobile */}
            <StepNavigation
              assemblyId={assembly.id}
              steps={assembly.steps as Step[]}
              currentStepIndex={currentStepIndex}
              isAnimating={isAnimating}
              onStepClick={(index) => {
                if (index === currentStepIndex) {
                  handleReset();
                }
              }}
            />
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex h-full p-4 gap-4">
            {/* Left Sidebar - Steps Navigation */}
            <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col gap-3">
              {/* Cabinet Info */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 dark:border-gray-700/50 p-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  {cabinetName}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {typeof assembly.description === "string"
                    ? locale === "ar"
                      ? (cabinet as any).descriptionAr
                      : assembly.description
                    : locale === "ar"
                      ? assembly.description?.ar
                      : assembly.description?.en}
                </p>
              </div>

              {/* Steps List */}
              <div className="flex-1 overflow-y-auto">
                <StepNavigation
                  assemblyId={assembly.id}
                  steps={assembly.steps as Step[]}
                  currentStepIndex={currentStepIndex}
                  isAnimating={isAnimating}
                  onStepClick={(index) => {
                    if (index === currentStepIndex) {
                      handleReset();
                    }
                  }}
                />
              </div>
            </div>

            {/* Main Content - 3D Viewer */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              {/* 3D Viewer - Desktop */}
              <div className="flex-1 min-h-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 dark:border-gray-700/50 overflow-hidden relative">
                {modelUrl ? (
                  isDesktop && (
                    <SceneViewer
                      key={sceneViewerKey}
                      modelUrl={modelUrl}
                      currentStep={currentStep}
                      cameraPosition={currentStep.cameraPosition}
                      isPlaying={isPlaying}
                      shouldAutoStart={false}
                      height="100%"
                      onAnimationComplete={handleAnimationComplete}
                      onAnimationProgress={handleAnimationProgress}
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 h-full">
                    <div className="text-center p-6">
                      <Box className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                        3D Model Not Available
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 mt-2">
                        Model file will be added soon
                      </p>
                    </div>
                  </div>
                )}
                {/* Restart Button */}
                {modelUrl && (
                  <button
                    onClick={handleRestart}
                    className="absolute top-3 end-3 w-10 h-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg rounded-full flex items-center justify-center transition-colors z-10 min-h-[44px] min-w-[44px]"
                    aria-label="Restart animation"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                )}
              </div>

              {/* Audio Player - Desktop */}
              <AudioPlayer
                ref={audioPlayerRef}
                assemblyId={assembly.id}
                stepId={currentStep.id}
                audioUrl={currentStep.audioUrl}
                autoPlay={false}
                onPlayPause={handleAudioPlayPause}
                onTimeUpdate={handleAudioTimeUpdate}
              />
            </div>

            {/* Right Sidebar - Step Info */}
            <div className="w-80 xl:w-96 flex-shrink-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 dark:border-gray-700/50 overflow-hidden flex flex-col">
              {/* Step Header */}
              <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-50/50 to-blue-50/50 dark:from-primary-900/20 dark:to-blue-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
                    {currentStepIndex + 1}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t("assembly.step")} {currentStepIndex + 1} /{" "}
                    {assembly.steps?.length || 0}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {stepTitle}
                </h1>
              </div>

              {/* Step Description */}
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {stepDescription}
                </p>

                {/* Tools Required */}
                {currentStep.toolsRequired &&
                  currentStep.toolsRequired.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                        <Wrench className="w-4 h-4 text-purple-500" />
                        {t("toolsRequired")}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {currentStep.toolsRequired.map((tool, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-lg border border-purple-200 dark:border-purple-800"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Duration */}
                {currentStep.duration && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{currentStep.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
