import { useTranslation } from "@/lib/i18n";
import Link from "next/link";
import { Step } from "@/types/cabinet";

interface StepNavigationProps {
  cabinetId: string;
  steps: Step[];
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
  isAnimating?: boolean;
}

export default function StepNavigation({
  cabinetId,
  steps,
  currentStepIndex,
  onStepClick,
  isAnimating = false,
}: StepNavigationProps) {
  const { t, locale } = useTranslation();

  const hasPrevious = currentStepIndex > 0;
  const hasNext = currentStepIndex < steps.length - 1;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {t("navigation.progress")}
          </span>
          <span className="text-sm text-gray-500">
            {t("navigation.step")} {currentStepIndex + 1} {t("navigation.of")}{" "}
            {steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {hasPrevious ? (
          <Link
            href={`/cabinet/${cabinetId}/step/${
              steps[currentStepIndex - 1].id
            }`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">{t("navigation.previous")}</span>
          </Link>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">{t("navigation.previous")}</span>
          </div>
        )}

        {hasNext ? (
          isAnimating ? (
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-400 text-white rounded-lg cursor-not-allowed opacity-70">
              <span className="font-medium">{t("navigation.next")}</span>
              <svg
                className="w-5 h-5 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          ) : (
            <Link
              href={`/cabinet/${cabinetId}/step/${
                steps[currentStepIndex + 1].id
              }`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <span className="font-medium">{t("navigation.next")}</span>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )
        ) : (
          <Link
            href={`/cabinet/${cabinetId}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">Complete</span>
          </Link>
        )}
      </div>

      {/* Step List */}
      <div className="bg-white rounded-lg shadow-md max-h-64 overflow-y-auto step-list-scrollbar">
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
              // Prevent navigation to future steps while animating
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
                className="block p-3 mb-2 rounded-lg bg-gray-50 opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gray-300 text-gray-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-500">
                      {stepTitle}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={step.id}
                href={`/cabinet/${cabinetId}/step/${step.id}`}
                onClick={handleClick}
                className={`block p-3 mb-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary-100 border-2 border-primary-500"
                    : isCompleted
                    ? "bg-green-50 hover:bg-green-100"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isActive
                        ? "bg-primary-600 text-white"
                        : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isActive ? "text-primary-900" : "text-gray-900"
                      }`}
                    >
                      {stepTitle}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
