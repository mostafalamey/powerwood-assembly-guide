import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
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
  const { id, stepId } = router.query; // cabinet ID and step ID
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
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
      fetchCabinet();
    }
  }, [id, stepId]);

  const fetchCabinet = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/cabinets?id=${id}`, {
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
        setError("Failed to load cabinet");
      }
    } catch (err) {
      setError("Error loading cabinet");
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
        cabinet?.steps?.map((step) =>
          step.id === stepId ? updatedStep : step,
        ) || [];

      const response = await fetch("/api/cabinets", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...cabinet,
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

        router.push(`/admin/cabinets/${id}/steps`);
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
    const cabinetId = String(id || "");
    const prefix = cabinetId.split("-")[0];
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

    const formattedId = cabinetId.replace("-", "_");
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
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (!cabinet || error) {
    return (
      <AuthGuard>
        <Head>
          <title>Error - Admin Panel</title>
        </Head>
        <AdminLayout title="Error">
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-200">
                {error || "Step not found"}
              </p>
            </div>
            <Link
              href={`/admin/cabinets/${id}/steps`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Steps
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
          Edit Step {formData.id} - {cabinet.name.en} - Admin Panel
        </title>
      </Head>
      <AdminLayout
        title={`Edit Step ${formData.id}: ${formData.title.en || "Untitled"}`}
      >
        <div className="p-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href={`/admin/cabinets/${id}/steps`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              ← Back to Steps
            </Link>
          </div>

          {/* Form + Audio Uploads */}
          <div className="max-w-none w-full">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] items-stretch">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-5 space-y-4">
                  {/* Step ID (Read-only) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                      Step Number
                    </label>
                    <input
                      type="text"
                      value={formData.id}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Step order can be changed by dragging in the steps list
                    </p>
                  </div>

                  {/* Title (Bilingual) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                          English
                        </label>
                        <input
                          type="text"
                          value={formData.title.en}
                          onChange={(e) =>
                            handleChange("title.en", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:bg-gray-900/60 dark:text-white"
                          placeholder="Attach one leg to base panel"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                          Arabic
                        </label>
                        <input
                          type="text"
                          value={formData.title.ar}
                          onChange={(e) =>
                            handleChange("title.ar", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:bg-gray-900/60 dark:text-white text-right"
                          dir="rtl"
                          placeholder="تثبيت ساق واحدة على اللوحة الأساسية"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description (Bilingual) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                          English
                        </label>
                        <textarea
                          value={formData.description.en}
                          onChange={(e) =>
                            handleChange("description.en", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:bg-gray-900/60 dark:text-white"
                          rows={4}
                          placeholder="Detailed assembly instructions..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                          Arabic
                        </label>
                        <textarea
                          value={formData.description.ar}
                          onChange={(e) =>
                            handleChange("description.ar", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:bg-gray-900/60 dark:text-white text-right"
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
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                      Estimated Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.duration || ""}
                      onChange={(e) =>
                        handleChange("duration", parseInt(e.target.value) || 0)
                      }
                      className="w-full max-w-xs px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:bg-gray-900/60 dark:text-white"
                      min="1"
                      placeholder="3"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Approximate time to complete this step
                    </p>
                  </div>

                  {/* Animation Status */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                      3D Animation
                    </label>
                    {formData.animation ? (
                      <div className="bg-green-50/80 dark:bg-green-900/20 border border-green-200/70 dark:border-green-800/70 rounded-lg p-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <svg
                              className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <h4 className="font-medium text-green-900 dark:text-green-200 text-sm">
                                Animation Configured
                              </h4>
                              <p className="text-xs text-green-800 dark:text-green-300 mt-0.5">
                                Duration: {formData.animation.duration}ms,{" "}
                                {formData.animation.keyframes?.length || 0}{" "}
                                keyframes
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/admin/cabinets/${id}/steps/authoring?step=${stepId}`}
                            className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Edit in Visual Editor
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/70 dark:border-blue-800/70 rounded-lg p-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <svg
                              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <h4 className="font-medium text-blue-900 dark:text-blue-200 text-sm">
                                No Animation Yet
                              </h4>
                              <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5">
                                Add 3D animation using the Visual Editor
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/admin/cabinets/${id}/steps/authoring?step=${stepId}`}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Create Animation
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/admin/cabinets/${id}/steps`}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>

              {/* Audio Uploads (Right Panel) */}
              <div className="space-y-4 h-full">
                <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-5 h-full flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    Step Audio Uploads
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Upload English and Arabic narration for this step.
                  </p>

                  <div className="flex-1 flex flex-col gap-4">
                    {/* English Upload */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                          English (eng)
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
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
                        className={`border-2 border-dashed rounded-lg p-4 text-center text-xs transition-colors min-h-[140px] flex flex-col items-center justify-center ${
                          dragging.eng
                            ? "border-blue-400 bg-blue-50/60 dark:bg-blue-900/20"
                            : "border-gray-200/70 dark:border-gray-700/60"
                        }`}
                      >
                        {pendingFiles.eng ? (
                          <>
                            <p className="text-gray-600 dark:text-gray-300">
                              Selected: {pendingFiles.eng.name}
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 mt-1">
                              Waiting to upload on save
                            </p>
                          </>
                        ) : audioExists.eng ? (
                          <>
                            <p className="text-gray-600 dark:text-gray-300">
                              Existing audio detected
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 mt-1">
                              Ready to replace or keep
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-600 dark:text-gray-300">
                              Drag & drop MP3 here
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 mt-1">
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
                          className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                        >
                          Choose File
                        </label>
                      </div>
                      <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                        /{getAudioDirectory("eng")}/step{getNormalizedStepId()}
                        .mp3
                      </p>
                      {(uploading.eng || uploadStatus.eng) && (
                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                          {uploading.eng ? "Uploading..." : uploadStatus.eng}
                        </p>
                      )}
                    </div>

                    {/* Arabic Upload */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                          Arabic (arb)
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
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
                        className={`border-2 border-dashed rounded-lg p-4 text-center text-xs transition-colors min-h-[140px] flex flex-col items-center justify-center ${
                          dragging.arb
                            ? "border-blue-400 bg-blue-50/60 dark:bg-blue-900/20"
                            : "border-gray-200/70 dark:border-gray-700/60"
                        }`}
                      >
                        {pendingFiles.arb ? (
                          <>
                            <p className="text-gray-600 dark:text-gray-300">
                              Selected: {pendingFiles.arb.name}
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 mt-1">
                              Waiting to upload on save
                            </p>
                          </>
                        ) : audioExists.arb ? (
                          <>
                            <p className="text-gray-600 dark:text-gray-300">
                              Existing audio detected
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 mt-1">
                              Ready to replace or keep
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-600 dark:text-gray-300">
                              Drag & drop MP3 here
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 mt-1">
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
                          className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                        >
                          Choose File
                        </label>
                      </div>
                      <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                        /{getAudioDirectory("arb")}/step{getNormalizedStepId()}
                        .mp3
                      </p>
                      {(uploading.arb || uploadStatus.arb) && (
                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                          {uploading.arb ? "Uploading..." : uploadStatus.arb}
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
