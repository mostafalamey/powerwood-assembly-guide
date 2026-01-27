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
  tools?: { en?: string[]; ar?: string[] };
}

interface Cabinet {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  steps?: Step[];
}

interface CabinetIndexItem {
  id: string;
  name: { en: string; ar: string };
  category?: string;
}

export default function StepManagementPage() {
  const router = useRouter();
  const { id } = router.query;
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [cabinetIndex, setCabinetIndex] = useState<CabinetIndexItem[]>([]);
  const [sourceCabinetId, setSourceCabinetId] = useState<string>("");
  const [sourceSteps, setSourceSteps] = useState<Step[]>([]);
  const [copySearch, setCopySearch] = useState("");
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyInsertIndex, setCopyInsertIndex] = useState(0);

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

  const openCopyModal = async () => {
    setIsCopyModalOpen(true);
    setCopySearch("");
    setSourceCabinetId("");
    setSourceSteps([]);
    setCopyInsertIndex(steps.length + 1);

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/cabinets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCabinetIndex(data || []);
      }
    } catch (err) {
      console.error("Error loading cabinet list:", err);
    }
  };

  const loadSourceSteps = async (cabinetId: string) => {
    if (!cabinetId) return;
    setCopyLoading(true);

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/cabinets?id=${cabinetId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSourceSteps(data.steps || []);
      } else {
        setSourceSteps([]);
      }
    } catch (err) {
      console.error("Error loading source steps:", err);
      setSourceSteps([]);
    } finally {
      setCopyLoading(false);
    }
  };

  const handleSelectSourceCabinet = async (cabinetId: string) => {
    setSourceCabinetId(cabinetId);
    await loadSourceSteps(cabinetId);
  };

  const handleCopyStep = async (sourceStep: Step) => {
    if (!cabinet) return;

    const insertIndex = Math.max(
      1,
      Math.min(copyInsertIndex, steps.length + 1),
    );
    const copiedStep: Step = {
      ...sourceStep,
      audioUrl: sourceStep.audioUrl
        ? {
            en: getAudioPublicPathForLocale("en", insertIndex.toString()),
            ar: getAudioPublicPathForLocale("ar", insertIndex.toString()),
          }
        : undefined,
    };

    const updatedSteps = [...steps];
    updatedSteps.splice(insertIndex - 1, 0, copiedStep);

    const renumberedSteps = updatedSteps.map((step, idx) => {
      const nextStepId = (idx + 1).toString();
      return {
        ...step,
        id: nextStepId,
        audioUrl: step.audioUrl
          ? {
              en: getAudioPublicPathForLocale("en", nextStepId),
              ar: getAudioPublicPathForLocale("ar", nextStepId),
            }
          : undefined,
      };
    });

    const newStepId = insertIndex.toString();
    const saved = await saveSteps(renumberedSteps);
    if (!saved) return;

    setIsCopyModalOpen(false);
    router.push(`/admin/cabinets/${id}/steps/${newStepId}/edit`);
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
                onClick={openCopyModal}
                className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                ♻️ Copy/Reuse Step
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
              <span className="material-symbols-rounded text-4xl text-gray-400 mx-auto block">
                list_alt
              </span>
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
                        <span className="material-symbols-rounded text-lg text-gray-400">
                          drag_indicator
                        </span>
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
                              <span className="material-symbols-rounded text-lg">
                                play_circle
                              </span>
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
                              <span className="material-symbols-rounded text-lg">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteStep(step.id)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Delete step"
                            >
                              <span className="material-symbols-rounded text-lg">
                                delete
                              </span>
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

        {isCopyModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Copy/Reuse Step
                </h3>
                <button
                  onClick={() => setIsCopyModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Source Cabinet
                    </label>
                    <select
                      value={sourceCabinetId}
                      onChange={(e) =>
                        handleSelectSourceCabinet(e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select cabinet...</option>
                      {cabinetIndex.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.id} - {item.name.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Search Steps
                    </label>
                    <input
                      type="text"
                      value={copySearch}
                      onChange={(e) => setCopySearch(e.target.value)}
                      placeholder="Search by title or description"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Insert Position
                    </label>
                    <select
                      value={copyInsertIndex}
                      onChange={(e) =>
                        setCopyInsertIndex(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {Array.from(
                        { length: steps.length + 1 },
                        (_, idx) => idx + 1,
                      ).map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="max-h-[50vh] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                    {copyLoading && (
                      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                        Loading steps...
                      </div>
                    )}
                    {!copyLoading &&
                      sourceCabinetId &&
                      sourceSteps.length === 0 && (
                        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                          No steps available in this cabinet.
                        </div>
                      )}
                    {!copyLoading &&
                      sourceSteps
                        .filter((step) => {
                          const query = copySearch.toLowerCase();
                          if (!query) return true;
                          return (
                            step.title.en.toLowerCase().includes(query) ||
                            step.title.ar.toLowerCase().includes(query) ||
                            step.description.en.toLowerCase().includes(query) ||
                            step.description.ar.toLowerCase().includes(query) ||
                            step.id.includes(query)
                          );
                        })
                        .map((step) => (
                          <div
                            key={`${sourceCabinetId}-${step.id}`}
                            className="p-4 flex items-start justify-between gap-4"
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Step {step.id}: {step.title.en}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {step.description.en}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex gap-3">
                                {step.duration && (
                                  <span>⏱️ {step.duration} min</span>
                                )}
                                {step.animation && <span>✓ Animation</span>}
                                {(step.audioUrl?.en || step.audioUrl?.ar) && (
                                  <span>✓ Audio</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleCopyStep(step)}
                              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AuthGuard>
  );
}
