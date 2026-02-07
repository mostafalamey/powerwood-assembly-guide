import { useTranslation } from "@/lib/i18n";
import TransitionLink from "@/components/TransitionLink";
import { Step } from "@/types/assembly";
import { ArrowLeft, ArrowRight, CheckCircle, Check } from "lucide-react";

interface StepNavigationProps {
  assemblyId: string;
  steps: Step[];
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
  isAnimating?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function StepNavigation({
  assemblyId,
  steps,
  currentStepIndex,
  onStepClick,
  isAnimating = false,
  primaryColor = "#3b82f6",
  secondaryColor = "#6366f1",
}: StepNavigationProps) {
  const { t, locale } = useTranslation();

  const hasPrevious = currentStepIndex > 0;
  const hasNext = currentStepIndex < steps.length - 1;

  return (
    <div className="space-y-2 lg:space-y-3">
      {/* Progress Bar */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-white/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {t("navigation.progress")}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentStepIndex + 1} / {steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              background: `linear-gradient(to right, ${primaryColor}, ${primaryColor})`,
            }}
          ></div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        {hasPrevious ? (
          <TransitionLink
            href={`/assembly/${assemblyId}/step/${steps[currentStepIndex - 1].id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-700 border border-white/50 dark:border-gray-700/50 rounded-xl transition-all shadow-sm hover:shadow min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180 text-gray-700 dark:text-gray-300" />
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
              {t("navigation.previous")}
            </span>
          </TransitionLink>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/30 rounded-xl text-gray-400 dark:text-gray-600 cursor-not-allowed min-h-[44px]">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span className="font-medium text-sm">
              {t("navigation.previous")}
            </span>
          </div>
        )}

        {hasNext ? (
          isAnimating ? (
            <div
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-white rounded-xl cursor-not-allowed opacity-70 min-h-[44px]"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="font-medium text-sm">
                {t("navigation.next")}
              </span>
              <ArrowRight className="w-4 h-4 animate-pulse rtl:rotate-180" />
            </div>
          ) : (
            <TransitionLink
              href={`/assembly/${assemblyId}/step/${steps[currentStepIndex + 1].id}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-white rounded-xl transition-all shadow-lg hover:shadow-xl min-h-[44px]"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 10px 15px -3px ${primaryColor}25`,
              }}
            >
              <span className="font-medium text-sm">
                {t("navigation.next")}
              </span>
              <ArrowRight
                className="w-4 h-4 rtl:rotate-180"
                style={{ color: secondaryColor }}
              />
            </TransitionLink>
          )
        ) : (
          <TransitionLink
            href={`/assembly/${assemblyId}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-xl min-h-[44px]"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium text-sm">
              {t("navigation.complete") || "Complete"}
            </span>
          </TransitionLink>
        )}
      </div>

      {/* Step List */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 dark:border-gray-700/50 max-h-48 lg:max-h-none lg:flex-1 overflow-y-auto">
        <div className="p-2">
          {steps.map((step, index) => {
            const stepTitle =
              typeof step.title === "string"
                ? locale === "ar"
                  ? (step as any).titleAr
                  : step.title
                : locale === "ar"
                  ? step.title.ar
                  : step.title.en;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const isFutureStep = index > currentStepIndex;
            const isDisabled = isFutureStep && isAnimating;

            const handleClick = (e: React.MouseEvent) => {
              if (isDisabled) {
                e.preventDefault();
                return;
              }
              if (isActive && onStepClick) {
                e.preventDefault();
                onStepClick(index);
              }
            };

            return isDisabled ? (
              <div
                key={step.id}
                className="block p-2.5 mb-1.5 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-gray-500 dark:text-gray-500">
                      {stepTitle}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <TransitionLink
                key={step.id}
                href={`/assembly/${assemblyId}/step/${step.id}`}
                onClick={handleClick}
                className={`block p-2.5 mb-1.5 rounded-lg transition-all ${
                  isActive
                    ? "border-2"
                    : isCompleted
                      ? "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200/50 dark:border-green-800/50"
                      : "bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-transparent"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${primaryColor}15`,
                        borderColor: primaryColor,
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? "text-white"
                        : isCompleted
                          ? "bg-green-600 dark:bg-green-500 text-white"
                          : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                    }`}
                    style={
                      isActive ? { backgroundColor: primaryColor } : undefined
                    }
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${
                        isActive
                          ? ""
                          : isCompleted
                            ? "text-green-800 dark:text-green-300"
                            : "text-gray-900 dark:text-gray-200"
                      }`}
                      style={isActive ? { color: primaryColor } : undefined}
                    >
                      {stepTitle}
                    </p>
                  </div>
                </div>
              </TransitionLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
