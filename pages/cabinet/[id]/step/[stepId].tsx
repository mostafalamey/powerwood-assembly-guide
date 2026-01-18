import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useTranslation } from "@/lib/i18n";
import Header from "@/components/Header";
import SceneViewer from "@/components/3d/SceneViewer";
import StepControls from "@/components/StepControls";
import StepNavigation from "@/components/StepNavigation";
import AudioPlayer from "@/components/AudioPlayer";
import { getCabinet } from "@/data/cabinets-loader";
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

  useEffect(() => {
    if (!id) return;

    const foundCabinet = getCabinet(id as string);
    if (!foundCabinet) {
      router.push("/");
      return;
    }

    setCabinet(foundCabinet);

    if (stepId) {
      const stepIndex = foundCabinet.steps.findIndex((s) => s.id === stepId);
      if (stepIndex !== -1) {
        setCurrentStep(foundCabinet.steps[stepIndex] as Step);
        setCurrentStepIndex(stepIndex);
      } else {
        router.push(`/cabinet/${id}`);
      }
    } else if (foundCabinet.steps.length > 0) {
      const firstStep = foundCabinet.steps[0] as Step;
      router.push(`/cabinet/${id}/step/${firstStep.id}`);
    }
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
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">{t("loading")}</p>
            </div>
          </div>
        </main>
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

      <Header />

      <main className="min-h-screen bg-gray-50 pt-2">
        <div className="container mx-auto px-2 py-2 max-w-7xl">
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-2">
            {/* 3D Viewer */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {modelUrl ? (
                <SceneViewer
                  key={sceneViewerKey}
                  modelUrl={modelUrl}
                  currentStep={currentStep}
                  cameraPosition={currentStep.cameraPosition}
                  isPlaying={isPlaying}
                  shouldAutoStart={false}
                  height="360px"
                  onAnimationComplete={handleAnimationComplete}
                />
              ) : (
                <div
                  className="flex items-center justify-center bg-gray-100"
                  style={{ height: "400px" }}
                >
                  <div className="text-center p-6">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-24"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <p className="text-gray-600 font-medium">
                      3D Model Not Available
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Model file will be added soon
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <StepControls onRestart={handleRestart} onReset={handleReset} />

            {/* Audio Player */}
            <AudioPlayer
              cabinetId={cabinet.id}
              stepId={currentStep.id}
              autoPlay={false}
              onPlayPause={handleAudioPlayPause}
            />

            {/* Step Info */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Collapsible Header */}
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 text-left">
                  <div className="mb-1">
                    <span className="text-xs text-gray-500">{cabinetName}</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {stepTitle}
                  </h1>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isDescriptionExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Collapsible Content */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isDescriptionExpanded
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="px-3 pb-3">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3">
                    {stepDescription}
                  </p>

                  {/* Tools Required */}
                  {currentStep.toolsRequired &&
                    currentStep.toolsRequired.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-700 mb-1">
                          {t("toolsRequired")}:
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {currentStep.toolsRequired.map((tool, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Duration */}
                  {currentStep.duration && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{currentStep.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
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
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Left Column: Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <div className="mb-4 bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    {cabinetName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {typeof cabinet.description === "string"
                      ? locale === "ar"
                        ? (cabinet as any).descriptionAr
                        : cabinet.description
                      : locale === "ar"
                        ? cabinet.description?.ar
                        : cabinet.description?.en}
                  </p>
                </div>
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

            {/* Middle & Right Columns: Viewer and Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* 3D Viewer */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {modelUrl ? (
                  <SceneViewer
                    key={sceneViewerKey}
                    modelUrl={modelUrl}
                    currentStep={currentStep}
                    cameraPosition={currentStep.cameraPosition}
                    isPlaying={isPlaying}
                    shouldAutoStart={false}
                    height="500px"
                    onAnimationComplete={handleAnimationComplete}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center bg-gray-100"
                    style={{ height: "500px" }}
                  >
                    <div className="text-center p-6">
                      <svg
                        className="w-20 h-20 text-gray-400 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <p className="text-gray-600 font-medium text-lg">
                        3D Model Not Available
                      </p>
                      <p className="text-gray-500 mt-2">
                        Model file will be added soon
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <StepControls onRestart={handleRestart} onReset={handleReset} />

              {/* Audio Player */}
              <AudioPlayer
                cabinetId={cabinet.id}
                stepId={currentStep.id}
                autoPlay={false}
                onPlayPause={handleAudioPlayPause}
              />

              {/* Step Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {stepTitle}
                </h1>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                  {stepDescription}
                </p>

                {/* Tools Required */}
                {currentStep.toolsRequired &&
                  currentStep.toolsRequired.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">
                        {t("toolsRequired")}:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {currentStep.toolsRequired.map((tool, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Duration */}
                {currentStep.duration && (
                  <div className="mt-4 flex items-center gap-2 text-gray-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{currentStep.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
