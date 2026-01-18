import { useTranslation } from "@/lib/i18n";

interface StepControlsProps {
  onRestart: () => void;
  onReset: () => void;
}

export default function StepControls({
  onRestart,
  onReset,
}: StepControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-2 p-2 bg-white rounded-lg shadow-md">
      {/* Restart Button */}
      <button
        onClick={onRestart}
        className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors"
        aria-label={t("controls.restart")}
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* Reset Camera Button */}
      <button
        onClick={onReset}
        className="flex items-center gap-1 px-3 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors"
        aria-label={t("navigation.reset")}
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
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <span className="text-xs font-medium">{t("navigation.reset")}</span>
      </button>
    </div>
  );
}
