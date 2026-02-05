import { useTranslation } from "@/lib/i18n";
import { RotateCcw, Focus } from "lucide-react";

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
        <RotateCcw className="w-[18px] h-[18px]" />
      </button>

      {/* Reset Camera Button */}
      <button
        onClick={onReset}
        className="flex items-center gap-1 px-3 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors"
        aria-label={t("navigation.reset")}
      >
        <Focus className="w-4 h-4" />
        <span className="text-xs font-medium">{t("navigation.reset")}</span>
      </button>
    </div>
  );
}
