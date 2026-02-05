import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Film, Clock, Plus } from "lucide-react";
import AdminLayout from "../../../../../components/admin/AdminLayout";
import AuthGuard from "../../../../../components/admin/AuthGuard";

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

export default function NewStepPage() {
  const router = useRouter();
  const { id } = router.query; // cabinet ID
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<StepFormData>({
    id: "",
    title: { en: "", ar: "" },
    description: { en: "", ar: "" },
    duration: 3,
  });

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

  const getAudioPublicPathForLocale = (lang: "en" | "ar", step: string) => {
    const langCode = lang === "ar" ? "arb" : "eng";
    return `/${getAudioDirectory(langCode)}/step${step}.mp3`;
  };

  useEffect(() => {
    if (id) {
      fetchCabinet();
    }
  }, [id]);

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
        // Set the next step ID
        const nextStepId = ((data.steps?.length || 0) + 1).toString();
        setFormData((prev) => ({
          ...prev,
          id: nextStepId,
          audioUrl: {
            en: getAudioPublicPathForLocale("en", nextStepId),
            ar: getAudioPublicPathForLocale("ar", nextStepId),
          },
        }));
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
      const updatedSteps = [...(cabinet?.steps || []), formData];

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
        router.push(`/admin/cabinets/${id}/steps`);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to create step");
        setSaving(false);
      }
    } catch (err) {
      setError("Error creating step");
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

  if (loading) {
    return (
      <AuthGuard>
        <Head>
          <title>Add Step - Admin Panel</title>
        </Head>
        <AdminLayout title="Add Step">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <svg
                className="animate-spin h-10 w-10 mx-auto text-blue-600 dark:text-blue-400"
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
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading cabinet data...
              </p>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (!cabinet) {
    return (
      <AuthGuard>
        <Head>
          <title>Error - Admin Panel</title>
        </Head>
        <AdminLayout title="Error">
          <div className="p-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-red-200 dark:border-red-800/50 shadow-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Cabinet Not Found
                  </h3>
                  <p className="text-red-600 dark:text-red-400 mt-1">
                    The cabinet you're looking for doesn't exist.
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/admin/cabinets"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cabinets
            </Link>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Head>
        <title>Add Step - {cabinet.name.en} - Admin Panel</title>
      </Head>
      <AdminLayout title={`Add Step to ${cabinet.name.en}`}>
        <div className="p-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href={`/admin/cabinets/${id}/steps`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Steps
            </Link>
          </div>

          {/* Form */}
          <div className="max-w-5xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-red-200 dark:border-red-800/50 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-6 space-y-5">
                {/* Step ID (Read-only) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                    Step Number
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                      {formData.id}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This will be step #{formData.id} in the assembly sequence
                    </p>
                  </div>
                </div>

                {/* Title (Bilingual) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        English
                      </label>
                      <input
                        type="text"
                        value={formData.title.en}
                        onChange={(e) =>
                          handleChange("title.en", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 
                          bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        placeholder="Attach one leg to base panel"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        Arabic
                      </label>
                      <input
                        type="text"
                        value={formData.title.ar}
                        onChange={(e) =>
                          handleChange("title.ar", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 
                          bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-right
                          focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
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
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        English
                      </label>
                      <textarea
                        value={formData.description.en}
                        onChange={(e) =>
                          handleChange("description.en", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 
                          bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                        rows={4}
                        placeholder="Detailed assembly instructions..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        Arabic
                      </label>
                      <textarea
                        value={formData.description.ar}
                        onChange={(e) =>
                          handleChange("description.ar", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 
                          bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-right
                          focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
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
                  <div className="relative w-full max-w-xs">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.duration || ""}
                      onChange={(e) =>
                        handleChange("duration", parseInt(e.target.value) || 0)
                      }
                      className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 
                        bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      min="1"
                      placeholder="3"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    Approximate time to complete this step
                  </p>
                </div>

                {/* Animation Note */}
                <div className="bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Film className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm">
                        Add 3D Animation Later
                      </h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                        After creating the step, you can add or edit 3D
                        animations using the Visual Editor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href={`/admin/cabinets/${id}/steps`}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 
                    hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-sm font-medium rounded-xl
                    bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                    hover:from-blue-600 hover:to-indigo-700
                    shadow-lg shadow-blue-500/30 hover:shadow-xl
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 flex items-center gap-2"
                >
                  {saving ? (
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Step
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
