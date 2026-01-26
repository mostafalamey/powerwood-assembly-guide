import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "../../../../../components/admin/AdminLayout";
import AuthGuard from "../../../../../components/admin/AuthGuard";

interface Step {
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
  steps?: Step[];
}

export default function StepManagementPage() {
  const router = useRouter();
  const { id } = router.query;
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
        setSteps(data.steps || []);
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

  const saveSteps = async (updatedSteps: Step[]) => {
    try {
      const token = localStorage.getItem("admin_token");
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
        setSteps(updatedSteps);
        return true;
      } else {
        alert("Failed to save steps");
        return false;
      }
    } catch (err) {
      alert("Error saving steps");
      console.error(err);
      return false;
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSteps = [...steps];
    const draggedStep = newSteps[draggedIndex];
    newSteps.splice(draggedIndex, 1);
    newSteps.splice(index, 0, draggedStep);

    // Update step IDs to match new order
    const reorderedSteps = newSteps.map((step, idx) => ({
      ...step,
      id: (idx + 1).toString(),
    }));

    setSteps(reorderedSteps);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    // Save the reordered steps
    await saveSteps(steps);
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm("Are you sure you want to delete this step?")) return;

    const newSteps = steps
      .filter((s) => s.id !== stepId)
      .map((step, idx) => ({
        ...step,
        id: (idx + 1).toString(),
      }));

    await saveSteps(newSteps);
  };

  if (loading) {
    return (
      <AuthGuard>
        <Head>
          <title>Manage Steps - Admin Panel</title>
        </Head>
        <AdminLayout title="Manage Steps">
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading steps...
            </p>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (error || !cabinet) {
    return (
      <AuthGuard>
        <Head>
          <title>Error - Admin Panel</title>
        </Head>
        <AdminLayout title="Error">
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-200">
                {error || "Cabinet not found"}
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
        <title>Manage Steps - {cabinet.name.en} - Admin Panel</title>
      </Head>
      <AdminLayout title={`Manage Steps: ${cabinet.name.en}`}>
        <div className="p-4 sm:p-6">
          {/* Breadcrumb */}
          <div className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm overflow-x-auto">
            <Link
              href="/admin/cabinets"
              className="text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              Cabinets
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href={`/admin/cabinets/${id}/edit`}
              className="text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              {cabinet.id}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-400">Steps</span>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Assembly Steps
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {steps.length} step{steps.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => router.push(`/admin/cabinets/${id}/steps/new`)}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                + Add Step
              </button>
              <button
                onClick={() =>
                  router.push(`/admin/cabinets/${id}/steps/authoring`)
                }
                className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-1"
              >
                <span>🎨</span>
                <span className="hidden sm:inline">Visual Editor</span>
                <span className="sm:hidden">Editor</span>
              </button>
            </div>
          </div>

          {/* Steps List */}
          {steps.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No steps yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new assembly step.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push(`/admin/cabinets/${id}/steps/new`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  + Add Your First Step
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-move ${
                      draggedIndex === index
                        ? "opacity-50 bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Drag Handle */}
                      <div className="flex-shrink-0 mt-1">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                        </svg>
                      </div>

                      {/* Step Number Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-gray-900 dark:text-white">
                              {step.title.en}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {step.description.en}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              {step.duration && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ⏱️ {step.duration} min
                                </span>
                              )}
                              {step.animation && (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  ✓ Animation
                                </span>
                              )}
                              {(step.audioUrl?.en || step.audioUrl?.ar) && (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  ✓ Audio
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/cabinets/${id}/steps/authoring?step=${step.id}`,
                                )
                              }
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Open Visual Editor"
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
                                  d="M12 2a10 10 0 100 20 10 10 0 000-20z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 8.75v6.5L15.5 12 10 8.75z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/cabinets/${id}/steps/${step.id}/edit`,
                                )
                              }
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Edit step"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteStep(step.id)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Delete step"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Text */}
          {steps.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              💡 Tip: Drag and drop steps to reorder them
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
