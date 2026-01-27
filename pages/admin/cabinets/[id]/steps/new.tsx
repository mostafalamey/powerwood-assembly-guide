import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
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
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
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
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-200">
                Cabinet not found
              </p>
            </div>
            <Link
              href="/admin/cabinets"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Cabinets
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
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              ← Back to Steps
            </Link>
          </div>

          {/* Form */}
          <div className="max-w-5xl">
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

                {/* Animation Note */}
                <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/70 dark:border-blue-800/70 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-rounded text-lg text-blue-600 dark:text-blue-400 mt-0.5">
                      info
                    </span>
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-200 text-sm">
                        Add 3D Animation Later
                      </h4>
                      <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5">
                        After creating the step, you can add or edit 3D
                        animations using the Visual Editor.
                      </p>
                    </div>
                  </div>
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
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Creating..." : "Create Step"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
