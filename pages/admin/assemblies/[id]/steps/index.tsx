import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Plus,
  Copy,
  Film,
  List,
  GripVertical,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Lightbulb,
  X,
  Search,
  Check,
} from "lucide-react";
import AdminLayout from "../../../../../components/admin/AdminLayout";
import AuthGuard from "../../../../../components/admin/AuthGuard";
import { useToast } from "../../../../../components/admin/ToastProvider";

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
  const toast = useToast();
  const { id } = router.query;
  const [assembly, setCabinet] = useState<Cabinet | null>(null);
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
      fetchAssembly();
    }
  }, [id]);

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

  const getAudioPublicPathForLocale = (lang: "en" | "ar", step: string) => {
    const langCode = lang === "ar" ? "arb" : "eng";
    return `/${getAudioDirectory(langCode)}/step${step}.mp3`;
  };

  const saveSteps = async (updatedSteps: Step[]) => {
    try {
      const token = localStorage.getItem("admin_token");
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
        setSteps(updatedSteps);
        return true;
      } else {
        toast.error("Failed to save steps");
        return false;
      }
    } catch (err) {
      toast.error("Error saving steps");
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
      const response = await fetch("/api/assemblies", {
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

  const loadSourceSteps = async (assemblyId: string) => {
    if (!assemblyId) return;
    setCopyLoading(true);

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/assemblies?id=${assemblyId}`, {
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

  const handleSelectSourceCabinet = async (assemblyId: string) => {
    setSourceCabinetId(assemblyId);
    await loadSourceSteps(assemblyId);
  };

  const handleCopyStep = async (sourceStep: Step) => {
    if (!assembly) return;

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
    router.push(`/admin/assemblies/${id}/steps/${newStepId}/edit`);
  };

  const handleDeleteStep = async (stepId: string) => {
    const confirmed = await toast.confirm({
      title: "Delete Step",
      message:
        "Are you sure you want to delete this step? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;

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
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <svg
                className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400"
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
            </div>
            <p className="text-gray-600 dark:text-gray-400">Loading steps...</p>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (error || !assembly) {
    return (
      <AuthGuard>
        <Head>
          <title>Error - Admin Panel</title>
        </Head>
        <AdminLayout title="Error">
          <div className="p-6">
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-300">
                  {error || "Cabinet not found"}
                </p>
              </div>
            </div>
            <Link
              href="/admin/assemblies"
              className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Assemblies
            </Link>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Head>
        <title>Manage Steps - {assembly.name.en} - Admin Panel</title>
      </Head>
      <AdminLayout title={`Manage Steps: ${assembly.name.en}`}>
        <div className="p-4 sm:p-6">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm overflow-x-auto">
            <Link
              href="/admin/assemblies"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              Assemblies
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              href={`/admin/assemblies/${id}/edit`}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap font-mono"
            >
              {assembly.id}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">
              Steps
            </span>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assembly Steps
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {steps.length} step{steps.length !== 1 ? "s" : ""} configured
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => router.push(`/admin/assemblies/${id}/steps/new`)}
                className="px-4 py-2.5 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                  hover:from-blue-600 hover:to-indigo-700
                  shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                  transition-all duration-300 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
              <button
                onClick={openCopyModal}
                className="px-4 py-2.5 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-indigo-500 to-indigo-600 text-white
                  hover:from-indigo-600 hover:to-indigo-700
                  shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40
                  transition-all duration-300 inline-flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy Step</span>
              </button>
              <button
                onClick={() =>
                  router.push(`/admin/assemblies/${id}/steps/authoring`)
                }
                className="px-4 py-2.5 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-purple-500 to-purple-600 text-white
                  hover:from-purple-600 hover:to-purple-700
                  shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40
                  transition-all duration-300 inline-flex items-center gap-2"
              >
                <Film className="w-4 h-4" />
                <span className="hidden sm:inline">Visual Editor</span>
              </button>
            </div>
          </div>

          {/* Steps List */}
          {steps.length === 0 ? (
            <div className="rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-12 text-center bg-gray-50/50 dark:bg-gray-800/50">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <List className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                No steps yet
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new assembly step.
              </p>
              <div className="mt-6">
                <button
                  onClick={() =>
                    router.push(`/admin/assemblies/${id}/steps/new`)
                  }
                  className="px-6 py-2.5 rounded-xl font-medium text-sm
                    bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                    hover:from-blue-600 hover:to-indigo-700
                    shadow-lg shadow-blue-500/30 hover:shadow-xl
                    transition-all duration-300 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Step
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-move ${
                      draggedIndex === index
                        ? "opacity-50 bg-blue-50 dark:bg-blue-900/20 scale-[0.98]"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Drag Handle */}
                      <div className="flex-shrink-0 mt-1">
                        <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>

                      {/* Step Number Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/30">
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
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              {step.duration && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                  <Clock className="w-3 h-3" />
                                  {step.duration}m
                                </span>
                              )}
                              {step.animation && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                  <CheckCircle className="w-3 h-3" />
                                  Animation
                                </span>
                              )}
                              {(step.audioUrl?.en || step.audioUrl?.ar) && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                  <CheckCircle className="w-3 h-3" />
                                  Audio
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 ml-4">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/assemblies/${id}/steps/authoring?step=${step.id}`,
                                )
                              }
                              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 
                                hover:text-purple-600 dark:hover:text-purple-400 
                                hover:bg-purple-50 dark:hover:bg-purple-900/20 
                                transition-all duration-200"
                              title="Open Visual Editor"
                            >
                              <Film className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/assemblies/${id}/steps/${step.id}/edit`,
                                )
                              }
                              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 
                                hover:text-blue-600 dark:hover:text-blue-400 
                                hover:bg-blue-50 dark:hover:bg-blue-900/20 
                                transition-all duration-200"
                              title="Edit step"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStep(step.id)}
                              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 
                                hover:text-red-600 dark:hover:text-red-400 
                                hover:bg-red-50 dark:hover:bg-red-900/20 
                                transition-all duration-200"
                              title="Delete step"
                            >
                              <Trash2 className="w-5 h-5" />
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
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Lightbulb className="w-4 h-4" />
              <span>Drag and drop steps to reorder them</span>
            </div>
          )}
        </div>

        {/* Copy Modal */}
        {isCopyModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Copy Step from Another Cabinet
                </h3>
                <button
                  onClick={() => setIsCopyModalOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Source Cabinet
                    </label>
                    <select
                      aria-label="Source Cabinet"
                      value={sourceCabinetId}
                      onChange={(e) =>
                        handleSelectSourceCabinet(e.target.value)
                      }
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">Select assembly...</option>
                      {cabinetIndex.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.id} - {item.name.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search Steps
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={copySearch}
                        onChange={(e) => setCopySearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Insert at Position
                    </label>
                    <select
                      aria-label="Insert at Position"
                      value={copyInsertIndex}
                      onChange={(e) =>
                        setCopyInsertIndex(Number(e.target.value))
                      }
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {Array.from(
                        { length: steps.length + 1 },
                        (_, idx) => idx + 1,
                      ).map((position) => (
                        <option key={position} value={position}>
                          Position {position}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="max-h-[50vh] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                    {copyLoading && (
                      <div className="p-8 text-center">
                        <svg
                          className="animate-spin h-6 w-6 mx-auto text-blue-600 dark:text-blue-400"
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
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Loading steps...
                        </p>
                      </div>
                    )}
                    {!copyLoading && !sourceCabinetId && (
                      <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Select a source cabinet to view available steps
                      </div>
                    )}
                    {!copyLoading &&
                      sourceCabinetId &&
                      sourceSteps.length === 0 && (
                        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          No steps available in this cabinet
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
                            className="p-4 flex items-start justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                  {step.id}
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {step.title.en}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 ml-9">
                                {step.description.en}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2 ml-9">
                                {step.duration && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {step.duration}m
                                  </span>
                                )}
                                {step.animation && (
                                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Animation
                                  </span>
                                )}
                                {(step.audioUrl?.en || step.audioUrl?.ar) && (
                                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Audio
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleCopyStep(step)}
                              className="px-4 py-2 rounded-xl text-sm font-medium
                                bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                                hover:from-blue-600 hover:to-indigo-700
                                shadow-md shadow-blue-500/20 hover:shadow-lg
                                transition-all duration-200"
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
