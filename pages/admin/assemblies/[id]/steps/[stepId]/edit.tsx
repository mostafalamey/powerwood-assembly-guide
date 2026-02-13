import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import LoadingSpinner from "../../../../../../components/admin/LoadingSpinner";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  CheckCircle,
  Film,
  Save,
  Mic,
  FileAudio,
  Upload,
  FolderOpen,
} from "lucide-react";
import AdminLayout from "../../../../../../components/admin/AdminLayout";
import AuthGuard from "../../../../../../components/admin/AuthGuard";

interface StepFormData {
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

interface Cabinet {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  steps?: StepFormData[];
}

export default function EditStepPage() {
  const router = useRouter();
  const { id, stepId } = router.query; // assembly ID and step ID
  const [assembly, setCabinet] = useState<Cabinet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState<{
    eng: string;
    arb: string;
  }>({ eng: "", arb: "" });
  const [uploading, setUploading] = useState<{ eng: boolean; arb: boolean }>({
    eng: false,
    arb: false,
  });
  const [pendingFiles, setPendingFiles] = useState<{ eng?: File; arb?: File }>(
    {},
  );
  const [audioExists, setAudioExists] = useState<{
    eng: boolean;
    arb: boolean;
  }>({ eng: false, arb: false });
  const [dragging, setDragging] = useState<{ eng: boolean; arb: boolean }>({
    eng: false,
    arb: false,
  });
  const [formData, setFormData] = useState<StepFormData>({
    id: "",
    title: { en: "", ar: "" },
    description: { en: "", ar: "" },
    duration: 3,
  });

  useEffect(() => {
    if (id && stepId) {
      fetchAssembly();
    }
  }, [id, stepId]);

  const fetchAssembly = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/assemblies?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCabinet(data);

        // Find the step to edit
        const step = data.steps?.find((s: StepFormData) => s.id === stepId);
        if (step) {
          setFormData(step);
          await checkAudioExists(step.audioUrl);
        } else {
          setError("Step not found");
        }
      } else {
        setError("Failed to load assembly");
      }
    } catch (err) {
      setError("Error loading assembly");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title.en || !formData.title.ar) {
      setError("Please fill in step titles in both languages");
      return;
    }

    if (!formData.description.en || !formData.description.ar) {
      setError("Please fill in step descriptions in both languages");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");

      const nextAudioUrl = {
        en: getAudioPublicPathForLocale("en"),
        ar: getAudioPublicPathForLocale("ar"),
      };

      const updatedStep = {
        ...formData,
        audioUrl: nextAudioUrl,
      };

      // Update the step in the steps array
      const updatedSteps =
        assembly?.steps?.map((step) =>
          step.id === stepId ? updatedStep : step,
        ) || [];

      const response = await fetch("/api/assemblies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...assembly,
          steps: updatedSteps,
        }),
      });

      if (response.ok) {
        const uploads: Promise<boolean>[] = [];

        if (pendingFiles.eng) {
          uploads.push(uploadAudioFile(pendingFiles.eng, "eng"));
        }
        if (pendingFiles.arb) {
          uploads.push(uploadAudioFile(pendingFiles.arb, "arb"));
        }

        if (uploads.length > 0) {
          const results = await Promise.all(uploads);
          if (results.some((result) => !result)) {
            setError("Step saved, but audio upload failed.");
            setSaving(false);
            return;
          }
          setPendingFiles({});
        }

        router.push(`/admin/assemblies/${id}/steps`);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update step");
        setSaving(false);
      }
    } catch (err) {
      setError("Error updating step");
      setSaving(false);
      console.error(err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".");
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev as any)[keys[0]],
            [keys[1]]: value,
          },
        };
      }
    });
  };

  const getAudioDirectory = (langCode: "eng" | "arb") => {
    const assemblyId = String(id || "");
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

  const getNormalizedStepId = () => {
    const raw = String(stepId || "");
    return raw.replace(/^step/i, "");
  };

  const getAudioPublicPath = (langCode: "eng" | "arb") => {
    return `/${getAudioDirectory(langCode)}/step${getNormalizedStepId()}.mp3`;
  };

  const getAudioPublicPathForLocale = (lang: "en" | "ar") => {
    return getAudioPublicPath(lang === "ar" ? "arb" : "eng");
  };

  const checkAudioExists = async (audioUrl?: { en?: string; ar?: string }) => {
    if (!id || !stepId) return;
    try {
      const engUrl = audioUrl?.en || getAudioPublicPathForLocale("en");
      const arbUrl = audioUrl?.ar || getAudioPublicPathForLocale("ar");
      const [engRes, arbRes] = await Promise.all([
        fetch(engUrl, { method: "HEAD" }),
        fetch(arbUrl, { method: "HEAD" }),
      ]);

      setAudioExists({ eng: engRes.ok, arb: arbRes.ok });
    } catch {
      setAudioExists({ eng: false, arb: false });
    }
  };

  const uploadAudioFile = async (
    file: File,
    langCode: "eng" | "arb",
  ): Promise<boolean> => {
    if (!file) return false;

    const isMp3 =
      file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3");

    if (!isMp3) {
      setUploadStatus((prev) => ({
        ...prev,
        [langCode]: "Please upload an .mp3 file.",
      }));
      return false;
    }

    setUploading((prev) => ({ ...prev, [langCode]: true }));
    setUploadStatus((prev) => ({ ...prev, [langCode]: "" }));

    try {
      const token = localStorage.getItem("admin_token");
      const directory = getAudioDirectory(langCode);
      const filename = `step${getNormalizedStepId()}.mp3`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", directory);
      formData.append("filename", filename);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Upload failed");
      }

      setUploadStatus((prev) => ({
        ...prev,
        [langCode]: "Upload complete.",
      }));
      setAudioExists((prev) => ({ ...prev, [langCode]: true }));
      return true;
    } catch (err) {
      setUploadStatus((prev) => ({
        ...prev,
        [langCode]: err instanceof Error ? err.message : "Error uploading file",
      }));
      return false;
    } finally {
      setUploading((prev) => ({ ...prev, [langCode]: false }));
    }
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
      setUploadStatus((prev) => ({
        ...prev,
        [lang]: `Selected: ${file.name} (pending upload)`,
      }));
    }
  };

  const handleFileSelect = (file: File | undefined, lang: "eng" | "arb") => {
    if (!file) return;
    setPendingFiles((prev) => ({ ...prev, [lang]: file }));
    setUploadStatus((prev) => ({
      ...prev,
      [lang]: `Selected: ${file.name} (pending upload)`,
    }));
  };

  if (loading) {
    return (
      <AuthGuard>
        <Head>
          <title>Edit Step - Admin Panel</title>
        </Head>
        <AdminLayout title="Edit Step">
          <LoadingSpinner size="lg" message="Loading step data..." centered />
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (!assembly || error) {
    return (
      <AuthGuard>
        <Head>
          <title>Error - Admin Panel</title>
        </Head>
        <AdminLayout title="Error">
          <div className="p-6">
            <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-2xl border border-red-200 dark:border-red-800/50 shadow-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="font-semibold text-charcoal dark:text-papyrus">
                    Error Loading Step
                  </h3>
                  <p className="text-red-600 dark:text-red-400 mt-1">
                    {error || "Step not found"}
                  </p>
                </div>
              </div>
            </div>
            <Link
              href={`/admin/assemblies/${id}/steps`}
              className="inline-flex items-center gap-2 text-stone dark:text-silver hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Steps
            </Link>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Head>
        <title>
          Edit Step {formData.id} - {assembly.name.en} - Admin Panel
        </title>
      </Head>
      <AdminLayout
        title={`Edit Step ${formData.id}: ${formData.title.en || "Untitled"}`}
      >
        <div className="p-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href={`/admin/assemblies/${id}/steps`}
              className="inline-flex items-center gap-2 text-sm text-stone dark:text-silver hover:text-charcoal dark:hover:text-papyrus transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Steps
            </Link>
          </div>

          {/* Form + Audio Uploads */}
          <div className="max-w-none w-full">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] items-stretch">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-2xl border border-red-200 dark:border-red-800/50 p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-2xl border border-silver/50 dark:border-stone/20 shadow-xl p-6 space-y-5">
                  {/* Step ID (Read-only) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-stone dark:text-silver mb-2">
                      Step Number
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-charcoal dark:bg-papyrus flex items-center justify-center text-papyrus dark:text-charcoal font-bold text-lg shadow-lg">
                        {formData.id}
                      </div>
                      <p className="text-xs text-stone dark:text-silver">
                        Step order can be changed by dragging in the steps list
                      </p>
                    </div>
                  </div>

                  {/* Title (Bilingual) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-stone dark:text-silver mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs text-stone dark:text-silver mb-1.5">
                          English
                        </label>
                        <input
                          type="text"
                          value={formData.title.en}
                          onChange={(e) =>
                            handleChange("title.en", e.target.value)
                          }
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-silver/50 dark:border-stone/30 
                            bg-white/50 dark:bg-neutral-800/50 text-charcoal dark:text-papyrus
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
                          onChange={(e) =>
                            handleChange("title.ar", e.target.value)
                          }
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-silver/50 dark:border-stone/30 
                            bg-white/50 dark:bg-neutral-800/50 text-charcoal dark:text-papyrus text-right
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
                    <div className="grid gap-4 md:grid-cols-2">
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
                            bg-white/50 dark:bg-neutral-800/50 text-charcoal dark:text-papyrus
                            focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 transition-all resize-none"
                          rows={4}
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
                            bg-white/50 dark:bg-neutral-800/50 text-charcoal dark:text-papyrus text-right
                            focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 transition-all resize-none"
                          dir="rtl"
                          rows={4}
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
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="number"
                        value={formData.duration || ""}
                        onChange={(e) =>
                          handleChange(
                            "duration",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-silver/50 dark:border-stone/30 
                          bg-white/50 dark:bg-neutral-800/50 text-charcoal dark:text-papyrus
                          focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 transition-all"
                        min="1"
                        placeholder="3"
                      />
                    </div>
                    <p className="text-xs text-stone dark:text-silver mt-1.5">
                      Approximate time to complete this step
                    </p>
                  </div>

                  {/* Animation Status */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-stone dark:text-silver mb-2">
                      3D Animation
                    </label>
                    {formData.animation ? (
                      <div className="bg-green-50/80 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-green-800 dark:text-green-200 text-sm">
                                Animation Configured
                              </h4>
                              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                Duration: {formData.animation.duration}ms,{" "}
                                {formData.animation.keyframes?.length || 0}{" "}
                                keyframes
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/admin/assemblies/${id}/steps/authoring?step=${stepId}`}
                            className="px-4 py-2 text-xs font-medium rounded-xl
                              bg-charcoal dark:bg-papyrus text-papyrus dark:text-charcoal
                              hover:opacity-90
                              shadow-lg transition-all"
                          >
                            Edit Animation
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-neutral-50/80 dark:bg-neutral-800/50 rounded-xl border border-silver/50 dark:border-stone/20 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                              <Film className="w-5 h-5 text-stone dark:text-silver" />
                            </div>
                            <div>
                              <h4 className="font-medium text-charcoal dark:text-silver text-sm">
                                No Animation Yet
                              </h4>
                              <p className="text-xs text-stone dark:text-silver mt-0.5">
                                Add 3D animation using the Visual Editor
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/admin/assemblies/${id}/steps/authoring?step=${stepId}`}
                            className="px-4 py-2 text-xs font-medium rounded-xl
                              bg-charcoal dark:bg-papyrus text-papyrus dark:text-charcoal
                              hover:opacity-90
                              shadow-lg transition-all"
                          >
                            Create Animation
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <Link
                    href={`/admin/assemblies/${id}/steps`}
                    className="px-5 py-2.5 text-sm font-medium text-stone dark:text-silver 
                      hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 text-sm font-medium rounded-xl
                      text-papyrus dark:text-charcoal bg-charcoal dark:bg-papyrus
                      hover:opacity-90
                      shadow-lg hover:shadow-xl
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Audio Uploads (Right Panel) */}
              <div className="space-y-4 h-full">
                <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-2xl border border-silver/50 dark:border-stone/20 shadow-xl p-6 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-charcoal dark:bg-papyrus flex items-center justify-center shadow-lg">
                      <Mic className="w-5 h-5 text-papyrus dark:text-charcoal" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-charcoal dark:text-papyrus">
                        Step Audio Narration
                      </h3>
                      <p className="text-xs text-stone dark:text-silver">
                        Upload English and Arabic audio files
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-5">
                    {/* English Upload */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-stone dark:text-silver flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-stone dark:text-silver">
                            EN
                          </span>
                          English
                        </span>
                        <span className="text-[11px] text-stone dark:text-silver font-mono">
                          step{getNormalizedStepId()}.mp3
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
                        className={`border-2 border-dashed rounded-xl p-4 text-center text-xs transition-all min-h-[130px] flex flex-col items-center justify-center ${
                          dragging.eng
                            ? "border-charcoal/40 dark:border-papyrus/40 bg-neutral-50/60 dark:bg-neutral-800/20"
                            : "border-silver/50 dark:border-stone/20 hover:border-silver dark:hover:border-stone"
                        }`}
                      >
                        {pendingFiles.eng ? (
                          <>
                            <FileAudio className="w-6 h-6 text-green-500 mb-2" />
                            <p className="text-charcoal dark:text-silver font-medium">
                              {pendingFiles.eng.name}
                            </p>
                            <p className="text-pewter mt-1">
                              Ready to upload on save
                            </p>
                          </>
                        ) : audioExists.eng ? (
                          <>
                            <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                            <p className="text-charcoal dark:text-silver font-medium">
                              Audio exists
                            </p>
                            <p className="text-pewter mt-1">
                              Drop new file to replace
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-pewter mb-2" />
                            <p className="text-stone dark:text-silver">
                              Drag & drop MP3 here
                            </p>
                            <p className="text-pewter mt-1">
                              or click to select
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
                          id="upload-eng-audio"
                        />
                        <label
                          htmlFor="upload-eng-audio"
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium 
                            bg-charcoal dark:bg-papyrus text-papyrus dark:text-charcoal rounded-lg 
                            hover:opacity-90 cursor-pointer transition-all
                            shadow-md"
                        >
                          <FolderOpen className="w-3 h-3" />
                          Choose File
                        </label>
                      </div>
                      {(uploading.eng || uploadStatus.eng) && (
                        <p className="mt-2 text-xs text-stone dark:text-silver flex items-center gap-1">
                          {uploading.eng ? (
                            <>
                              <svg
                                className="animate-spin h-3 w-3"
                                viewBox="0 0 24 24"
                              >
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
                              Uploading...
                            </>
                          ) : (
                            uploadStatus.eng
                          )}
                        </p>
                      )}
                    </div>

                    {/* Arabic Upload */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-stone dark:text-silver flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-stone dark:text-silver">
                            AR
                          </span>
                          Arabic
                        </span>
                        <span className="text-[11px] text-stone dark:text-silver font-mono">
                          step{getNormalizedStepId()}.mp3
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
                        className={`border-2 border-dashed rounded-xl p-4 text-center text-xs transition-all min-h-[130px] flex flex-col items-center justify-center ${
                          dragging.arb
                            ? "border-charcoal/40 dark:border-papyrus/40 bg-neutral-50/60 dark:bg-neutral-800/20"
                            : "border-silver/50 dark:border-stone/20 hover:border-silver dark:hover:border-stone"
                        }`}
                      >
                        {pendingFiles.arb ? (
                          <>
                            <FileAudio className="w-6 h-6 text-green-500 mb-2" />
                            <p className="text-charcoal dark:text-silver font-medium">
                              {pendingFiles.arb.name}
                            </p>
                            <p className="text-pewter mt-1">
                              Ready to upload on save
                            </p>
                          </>
                        ) : audioExists.arb ? (
                          <>
                            <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                            <p className="text-charcoal dark:text-silver font-medium">
                              Audio exists
                            </p>
                            <p className="text-pewter mt-1">
                              Drop new file to replace
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-pewter mb-2" />
                            <p className="text-stone dark:text-silver">
                              Drag & drop MP3 here
                            </p>
                            <p className="text-pewter mt-1">
                              or click to select
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
                          id="upload-arb-audio"
                        />
                        <label
                          htmlFor="upload-arb-audio"
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium 
                            bg-charcoal dark:bg-papyrus text-papyrus dark:text-charcoal rounded-lg 
                            hover:opacity-90 cursor-pointer transition-all
                            shadow-md"
                        >
                          <FolderOpen className="w-3 h-3" />
                          Choose File
                        </label>
                      </div>
                      {(uploading.arb || uploadStatus.arb) && (
                        <p className="mt-2 text-xs text-stone dark:text-silver flex items-center gap-1">
                          {uploading.arb ? (
                            <>
                              <svg
                                className="animate-spin h-3 w-3"
                                viewBox="0 0 24 24"
                              >
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
                              Uploading...
                            </>
                          ) : (
                            uploadStatus.arb
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
