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
      
      // Update the step in the steps array
      const updatedSteps = cabinet?.steps?.map((step) =>
        step.id === stepId ? formData : step
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

          {/* Form */}
          <div className="max-w-4xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
                {/* Step ID (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Step Number
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Step order can be changed by dragging in the steps list
                  </p>
                </div>

                {/* Title (Bilingual) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        English
                      </label>
                      <input
                        type="text"
                        value={formData.title.en}
                        onChange={(e) =>
                          handleChange("title.en", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Attach one leg to base panel"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Arabic
                      </label>
                      <input
                        type="text"
                        value={formData.title.ar}
                        onChange={(e) =>
                          handleChange("title.ar", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-right"
                        dir="rtl"
                        placeholder="تثبيت ساق واحدة على اللوحة الأساسية"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Description (Bilingual) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        English
                      </label>
                      <textarea
                        value={formData.description.en}
                        onChange={(e) =>
                          handleChange("description.en", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        rows={6}
                        placeholder="Detailed assembly instructions..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Arabic
                      </label>
                      <textarea
                        value={formData.description.ar}
                        onChange={(e) =>
                          handleChange("description.ar", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-right"
                        dir="rtl"
                        rows={6}
                        placeholder="تعليمات التجميع التفصيلية..."
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration || ""}
                    onChange={(e) =>
                      handleChange("duration", parseInt(e.target.value) || 0)
                    }
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    min="1"
                    placeholder="3"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Approximate time to complete this step
                  </p>
                </div>

                {/* Animation Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    3D Animation
                  </label>
                  {formData.animation ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
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
                            <h4 className="font-medium text-green-900 dark:text-green-200">
                              Animation Configured
                            </h4>
                            <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                              Duration: {formData.animation.duration}ms,{" "}
                              {formData.animation.keyframes?.length || 0}{" "}
                              keyframes
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/admin/cabinets/${id}/steps/authoring?step=${stepId}`}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Edit in Visual Editor
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
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
                            <h4 className="font-medium text-blue-900 dark:text-blue-200">
                              No Animation Yet
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                              Add 3D animation using the Visual Editor
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/admin/cabinets/${id}/steps/authoring?step=${stepId}`}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
