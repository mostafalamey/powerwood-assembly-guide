import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useTranslation } from "@/lib/i18n";
import Header from "@/components/Header";
import SceneViewer from "@/components/3d/SceneViewer";
import StepNavigation from "@/components/StepNavigation";
import AudioPlayer from "@/components/AudioPlayer";
import { Cabinet, Step } from "@/types/cabinet";

export default function StepPage() {
  const router = useRouter();
  const { id, stepId } = router.query;
  const { t, locale } = useTranslation();

  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneViewerKey, setSceneViewerKey] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true); // Start true, set false on completion
  const [isDesktop, setIsDesktop] = useState(false);

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

    // Fetch cabinet from API instead of bundled data
    const fetchCabinet = async () => {
      try {
        const response = await fetch(`/api/cabinets?id=${id}&_=${Date.now()}`, {
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
            router.push(`/cabinet/${id}`);
          }
        } else if (foundCabinet.steps && foundCabinet.steps.length > 0) {
          const firstStep = foundCabinet.steps[0] as Step;
          router.push(`/cabinet/${id}/step/${firstStep.id}`);
        }
      } catch (error) {
        console.error("Error fetching cabinet:", error);
        router.push("/");
      }
    };

    fetchCabinet();
  }, [id, stepId, router]);

  // Reset isAnimating when step changes (don't auto-start)
  useEffect(() => {
    setIsAnimating(false);
    setIsPlaying(false);
  }, [stepId]);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    // For step-based animations, play button triggers restart
    setIsAnimating(true);
    if (typeof window !== "undefined" && (window as any).restartStepAnimation) {
      (window as any).restartStepAnimation();
      setIsPlaying(true);
      // Reset playing state after animation duration
      setTimeout(() => setIsPlaying(false), 3000);
    }
  }, []);

  const handleRestart = useCallback(() => {
    setIsPlaying(false);
    setIsAnimating(true);
    setSceneViewerKey((prev) => prev + 1);
  }, []);

  const handleReset = useCallback(() => {
    // Restart current step animation
    setIsAnimating(true);
    if (typeof window !== "undefined" && (window as any).restartStepAnimation) {
      (window as any).restartStepAnimation();
    }
  }, []);

  const handleAudioPlayPause = useCallback((playing: boolean) => {
    setIsPlaying(playing);
    if (playing) {
      // Start animation when audio plays
      setIsAnimating(true);
      if (
        typeof window !== "undefined" &&
        (window as any).restartStepAnimation
      ) {
        (window as any).restartStepAnimation();
      }
    }
  }, []);

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
    typeof cabinet.name === "string"
      ? locale === "ar"
        ? (cabinet as any).nameAr
        : cabinet.name
      : locale === "ar"
        ? cabinet.name.ar
        : cabinet.name.en;

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
          {/* Mobile Layout */}
          <div className="lg:hidden h-full flex flex-col p-2 gap-2">
            {/* 3D Viewer - Mobile */}
            <div className="flex-1 min-h-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 dark:border-gray-700/50 overflow-hidden relative">
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
                  />
                )
              ) : (
                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 h-full">
                  <div className="text-center p-6">
                    <span className="material-symbols-rounded text-5xl text-gray-400 dark:text-gray-600 mx-auto mb-4 block">
                      view_in_ar
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      3D Model Not Available
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
                  <span className="material-symbols-rounded text-lg text-gray-700 dark:text-gray-300">
                    restart_alt
                  </span>
                </button>
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
                <span
                  className={`material-symbols-rounded text-lg text-gray-500 dark:text-gray-400 transition-transform ${isDescriptionExpanded ? "rotate-180" : ""}`}
                >
                  expand_more
                </span>
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
              cabinetId={cabinet.id}
              stepId={currentStep.id}
              audioUrl={currentStep.audioUrl}
              autoPlay={false}
              onPlayPause={handleAudioPlayPause}
            />

            {/* Navigation - Mobile */}
            <StepNavigation
              cabinetId={cabinet.id}
              steps={cabinet.steps as Step[]}
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
                  {typeof cabinet.description === "string"
                    ? locale === "ar"
                      ? (cabinet as any).descriptionAr
                      : cabinet.description
                    : locale === "ar"
                      ? cabinet.description?.ar
                      : cabinet.description?.en}
                </p>
              </div>

              {/* Steps List */}
              <div className="flex-1 overflow-y-auto">
                <StepNavigation
                  cabinetId={cabinet.id}
                  steps={cabinet.steps as Step[]}
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
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 h-full">
                    <div className="text-center p-6">
                      <span className="material-symbols-rounded text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4 block">
                        view_in_ar
                      </span>
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
                    <span className="material-symbols-rounded text-lg text-gray-700 dark:text-gray-300">
                      restart_alt
                    </span>
                  </button>
                )}
              </div>

              {/* Audio Player - Desktop */}
              <AudioPlayer
                cabinetId={cabinet.id}
                stepId={currentStep.id}
                audioUrl={currentStep.audioUrl}
                autoPlay={false}
                onPlayPause={handleAudioPlayPause}
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
                    {t("cabinet.step")} {currentStepIndex + 1} /{" "}
                    {cabinet.steps?.length || 0}
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
                        <span className="material-symbols-rounded text-sm text-purple-500">
                          handyman
                        </span>
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
                    <span className="material-symbols-rounded text-base text-blue-500">
                      schedule
                    </span>
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
