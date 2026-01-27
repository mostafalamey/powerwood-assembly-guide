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
        <span className="material-symbols-rounded text-lg">restart_alt</span>
      </button>

      {/* Reset Camera Button */}
      <button
        onClick={onReset}
        className="flex items-center gap-1 px-3 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors"
        aria-label={t("navigation.reset")}
      >
        <span className="material-symbols-rounded text-base">
          center_focus_strong
        </span>
        <span className="text-xs font-medium">{t("navigation.reset")}</span>
      </button>
    </div>
  );
}
