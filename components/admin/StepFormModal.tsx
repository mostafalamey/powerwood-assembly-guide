import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ListOrdered,
  Clock,
  Film,
  Mic,
  Upload,
  FolderOpen,
  FileAudio,
  Plus,
  Save,
} from "lucide-react";

export interface StepFormData {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  duration?: number;
  animation?: any;
  audioUrl?: { en?: string; ar?: string };
}

interface StepFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    step: StepFormData,
    pendingFiles: { eng?: File; arb?: File },
  ) => Promise<void>;
  step?: StepFormData | null;
  mode: "create" | "edit";
  stepNumber: number;
  assemblyId: string;
}

export function StepFormModal({
  isOpen,
  onClose,
  onSubmit,
  step,
  mode,
  stepNumber,
  assemblyId,
}: StepFormModalProps) {
  const [formData, setFormData] = useState<StepFormData>({
    id: "",
    title: { en: "", ar: "" },
    description: { en: "", ar: "" },
    duration: 3,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ eng?: File; arb?: File }>(
    {},
  );
  const [dragging, setDragging] = useState<{ eng: boolean; arb: boolean }>({
    eng: false,
    arb: false,
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Audio path helpers
  const getAudioDirectory = (langCode: "eng" | "arb") => {
    const prefix = assemblyId.split("-")[0];
    let category = "";
    switch (prefix) {
      case "BC":
        category = "BaseCabinets";
        break;
      case "WC":
        category = "WallCabinets";
        break;
      case "HC":
        category = "HighCabinets";
        break;
      case "TC":
        category = "TallCabinets";
        break;
      case "CB":
        category = "CornerBase";
        break;
      case "CW":
        category = "CornerWall";
        break;
      case "FL":
        category = "Fillers";
        break;
      default:
        category = "BaseCabinets";
    }
    const formattedId = assemblyId.replace("-", "_");
    return `audio/${langCode}/${category}/${formattedId}`;
  };

  const getAudioPublicPath = (lang: "en" | "ar", stepId: string) => {
    const langCode = lang === "ar" ? "arb" : "eng";
    return `/${getAudioDirectory(langCode)}/step${stepId}.mp3`;
  };

  // Reset form when step changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && step) {
        setFormData({ ...step });
      } else {
        const newStepId = stepNumber.toString();
        setFormData({
          id: newStepId,
          title: { en: "", ar: "" },
          description: { en: "", ar: "" },
          duration: 3,
          audioUrl: {
            en: getAudioPublicPath("en", newStepId),
            ar: getAudioPublicPath("ar", newStepId),
          },
        });
      }
      setError(null);
      setPendingFiles({});
      setDragging({ eng: false, arb: false });

      // Focus first input after animation
      setTimeout(() => firstInputRef.current?.focus(), 150);
    }
  }, [isOpen, step, mode, stepNumber]);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".");
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }
      return {
        ...prev,
        [keys[0]]: {
          ...(prev as any)[keys[0]],
          [keys[1]]: value,
        },
      };
    });
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    lang: "eng" | "arb",
  ) => {
    e.preventDefault();
    setDragging((prev) => ({ ...prev, [lang]: false }));
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setPendingFiles((prev) => ({ ...prev, [lang]: file }));
    }
  };

  const handleFileSelect = (file: File | undefined, lang: "eng" | "arb") => {
    if (!file) return;
    setPendingFiles((prev) => ({ ...prev, [lang]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.en.trim() || !formData.title.ar.trim()) {
      setError("Please fill in step titles in both languages");
      return;
    }
    if (!formData.description.en.trim() || !formData.description.ar.trim()) {
      setError("Please fill in step descriptions in both languages");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData, pendingFiles);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="step-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto
          bg-papyrus dark:bg-charcoal rounded-2xl shadow-2xl
          border border-silver/30 dark:border-stone/20"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-neutral-100/50 dark:bg-neutral-800/30 border-b border-silver/30 dark:border-stone/20 rounded-t-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 dark:bg-sky-400/15 flex items-center justify-center">
              <ListOrdered className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <h2
              id="step-modal-title"
              className="text-lg font-semibold text-charcoal dark:text-papyrus"
            >
              {mode === "create" ? "Add Step" : "Edit Step"}{" "}
              <span className="text-stone dark:text-silver font-normal text-sm">
                #{formData.id}
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            title="Close"
            className="p-2 rounded-xl text-stone hover:text-charcoal dark:text-silver dark:hover:text-papyrus
              hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Title (Bilingual) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone dark:text-silver mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs text-stone dark:text-silver mb-1.5">
                  English
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={formData.title.en}
                  onChange={(e) => handleChange("title.en", e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-silver/50 dark:border-stone/30
                    bg-white dark:bg-neutral-900 text-charcoal dark:text-papyrus
                    focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 transition-all"
                  placeholder="Attach one leg to base panel"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-stone dark:text-silver mb-1.5">
                  Arabic
                </label>
                <input
                  type="text"
                  value={formData.title.ar}
                  onChange={(e) => handleChange("title.ar", e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-silver/50 dark:border-stone/30
                    bg-white dark:bg-neutral-900 text-charcoal dark:text-papyrus text-right
                    focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 transition-all"
                  dir="rtl"
                  placeholder="تثبيت ساق واحدة على اللوحة الأساسية"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description (Bilingual) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone dark:text-silver mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs text-stone dark:text-silver mb-1.5">
                  English
                </label>
                <textarea
                  value={formData.description.en}
                  onChange={(e) =>
                    handleChange("description.en", e.target.value)
                  }
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-silver/50 dark:border-stone/30
                    bg-white dark:bg-neutral-900 text-charcoal dark:text-papyrus
                    focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 transition-all resize-none"
                  rows={3}
                  placeholder="Detailed assembly instructions..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-stone dark:text-silver mb-1.5">
                  Arabic
                </label>
                <textarea
                  value={formData.description.ar}
                  onChange={(e) =>
                    handleChange("description.ar", e.target.value)
                  }
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-silver/50 dark:border-stone/30
                    bg-white dark:bg-neutral-900 text-charcoal dark:text-papyrus text-right
                    focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 transition-all resize-none"
                  dir="rtl"
                  rows={3}
                  placeholder="تعليمات التجميع التفصيلية..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone dark:text-silver mb-2">
              Estimated Duration (minutes)
            </label>
            <div className="relative w-full max-w-xs">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pewter" />
              <input
                type="number"
                value={formData.duration || ""}
                onChange={(e) =>
                  handleChange("duration", parseInt(e.target.value) || 0)
                }
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-silver/50 dark:border-stone/30
                  bg-white dark:bg-neutral-900 text-charcoal dark:text-papyrus
                  focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 transition-all"
                min="1"
                placeholder="3"
              />
            </div>
          </div>

          {/* Audio Uploads */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-stone dark:text-silver mb-2 flex items-center gap-2">
              <Mic className="w-3.5 h-3.5" />
              Audio Narration
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              {/* English Audio */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-stone dark:text-silver flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-charcoal dark:text-silver">
                      EN
                    </span>
                    English
                  </span>
                  <span className="text-[10px] text-stone dark:text-silver font-mono">
                    step{formData.id}.mp3
                  </span>
                </div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging((prev) => ({ ...prev, eng: true }));
                  }}
                  onDragLeave={() =>
                    setDragging((prev) => ({ ...prev, eng: false }))
                  }
                  onDrop={(e) => handleDrop(e, "eng")}
                  className={`border-2 border-dashed rounded-xl p-3 text-center text-xs transition-all min-h-[90px] flex flex-col items-center justify-center ${
                    dragging.eng
                      ? "border-charcoal/40 bg-neutral-50/60 dark:bg-neutral-800/20"
                      : "border-silver/50 dark:border-stone/20 hover:border-silver dark:hover:border-stone"
                  }`}
                >
                  {pendingFiles.eng ? (
                    <>
                      <FileAudio className="w-5 h-5 text-emerald-500 mb-1" />
                      <p className="text-stone dark:text-silver font-medium truncate max-w-full">
                        {pendingFiles.eng.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                      <p className="text-stone dark:text-silver">
                        Drag & drop MP3
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3"
                    className="hidden"
                    onChange={(e) => {
                      handleFileSelect(e.target.files?.[0], "eng");
                      e.currentTarget.value = "";
                    }}
                    id="step-modal-upload-eng"
                  />
                  <label
                    htmlFor="step-modal-upload-eng"
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                      bg-charcoal dark:bg-papyrus text-papyrus dark:text-charcoal rounded-lg
                      hover:opacity-80 cursor-pointer transition-all shadow-sm"
                  >
                    <FolderOpen className="w-3 h-3" />
                    Choose File
                  </label>
                </div>
              </div>

              {/* Arabic Audio */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-stone dark:text-silver flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      AR
                    </span>
                    Arabic
                  </span>
                  <span className="text-[10px] text-stone dark:text-silver font-mono">
                    step{formData.id}.mp3
                  </span>
                </div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging((prev) => ({ ...prev, arb: true }));
                  }}
                  onDragLeave={() =>
                    setDragging((prev) => ({ ...prev, arb: false }))
                  }
                  onDrop={(e) => handleDrop(e, "arb")}
                  className={`border-2 border-dashed rounded-xl p-3 text-center text-xs transition-all min-h-[90px] flex flex-col items-center justify-center ${
                    dragging.arb
                      ? "border-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/20"
                      : "border-silver/50 dark:border-stone/20 hover:border-silver dark:hover:border-stone"
                  }`}
                >
                  {pendingFiles.arb ? (
                    <>
                      <FileAudio className="w-5 h-5 text-emerald-500 mb-1" />
                      <p className="text-stone dark:text-silver font-medium truncate max-w-full">
                        {pendingFiles.arb.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                      <p className="text-stone dark:text-silver">
                        Drag & drop MP3
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3"
                    className="hidden"
                    onChange={(e) => {
                      handleFileSelect(e.target.files?.[0], "arb");
                      e.currentTarget.value = "";
                    }}
                    id="step-modal-upload-arb"
                  />
                  <label
                    htmlFor="step-modal-upload-arb"
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                      bg-charcoal dark:bg-papyrus text-papyrus dark:text-charcoal rounded-lg
                      hover:opacity-80 cursor-pointer transition-all shadow-sm"
                  >
                    <FolderOpen className="w-3 h-3" />
                    Choose File
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Animation Note */}
          <div className="bg-neutral-50/80 dark:bg-neutral-800/50 rounded-xl border border-silver/50 dark:border-stone/20 p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 dark:bg-violet-400/15 flex items-center justify-center flex-shrink-0">
                <Film className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-xs text-stone dark:text-silver">
                3D animations can be added or edited later using the Visual
                Editor from the steps list.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-silver/30 dark:border-stone/20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-stone dark:text-silver
                hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium rounded-xl
                bg-charcoal dark:bg-papyrus text-papyrus dark:text-charcoal
                hover:opacity-90 shadow-lg hover:shadow-xl
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>
                  {mode === "create" ? (
                    <Plus className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {mode === "create" ? "Create Step" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
