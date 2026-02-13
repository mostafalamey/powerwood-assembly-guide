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
import LoadingSpinner from "../../../../../components/admin/LoadingSpinner";
import { useToast } from "../../../../../components/admin/ToastProvider";
import {
  StepFormModal,
  StepFormData,
} from "../../../../../components/admin/StepFormModal";

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
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [stepModalMode, setStepModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [selectedStepForEdit, setSelectedStepForEdit] =
    useState<StepFormData | null>(null);

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
        setError("Failed to load assembly");
      }
    } catch (err) {
      setError("Error loading assembly");
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

  const uploadAudioFile = async (
    file: File,
    langCode: "eng" | "arb",
    stepId: string,
  ) => {
    const dir = getAudioDirectory(langCode);
    const filePath = `${dir}/step${stepId}.mp3`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "audio");
    formData.append("replacePath", filePath);

    const token = localStorage.getItem("admin_token");
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error(`Audio upload failed for ${langCode}`);
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
      console.error("Error loading assembly list:", err);
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
    // Preserve the original audio URLs from the source step
    // Audio belongs to the step content, not the assembly
    const copiedStep: Step = {
      ...sourceStep,
      audioUrl: sourceStep.audioUrl, // Keep original audio URLs
    };

    const updatedSteps = [...steps];
    updatedSteps.splice(insertIndex - 1, 0, copiedStep);

    // Renumber steps but preserve audio URLs
    const renumberedSteps = updatedSteps.map((step, idx) => {
      const nextStepId = (idx + 1).toString();
      return {
        ...step,
        id: nextStepId,
        // Keep original audioUrl - don't regenerate paths during renumbering
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

  const openAddStepModal = () => {
    setSelectedStepForEdit(null);
    setStepModalMode("create");
    setIsStepModalOpen(true);
  };

  const openEditStepModal = (step: Step) => {
    setSelectedStepForEdit(step as StepFormData);
    setStepModalMode("edit");
    setIsStepModalOpen(true);
  };

  const handleStepModalSubmit = async (
    formData: StepFormData,
    pendingFiles: { eng?: File; arb?: File },
  ) => {
    if (stepModalMode === "create") {
      const newStepId = (steps.length + 1).toString();
      const newStep: Step = {
        id: newStepId,
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        animation: formData.animation,
        audioUrl:
          pendingFiles.eng || pendingFiles.arb
            ? {
                en: pendingFiles.eng
                  ? getAudioPublicPathForLocale("en", newStepId)
                  : undefined,
                ar: pendingFiles.arb
                  ? getAudioPublicPathForLocale("ar", newStepId)
                  : undefined,
              }
            : formData.audioUrl,
      };

      const updatedSteps = [...steps, newStep];
      const saved = await saveSteps(updatedSteps);
      if (!saved) throw new Error("Failed to save step");

      // Upload audio files
      if (pendingFiles.eng)
        await uploadAudioFile(pendingFiles.eng, "eng", newStepId);
      if (pendingFiles.arb)
        await uploadAudioFile(pendingFiles.arb, "arb", newStepId);

      toast.success(`Step ${newStepId} created successfully`);
    } else {
      // Edit mode
      const updatedSteps = steps.map((s) => {
        if (s.id !== formData.id) return s;
        return {
          ...s,
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          animation: formData.animation,
          audioUrl:
            pendingFiles.eng || pendingFiles.arb
              ? {
                  en: pendingFiles.eng
                    ? getAudioPublicPathForLocale("en", formData.id)
                    : s.audioUrl?.en,
                  ar: pendingFiles.arb
                    ? getAudioPublicPathForLocale("ar", formData.id)
                    : s.audioUrl?.ar,
                }
              : formData.audioUrl || s.audioUrl,
        };
      });

      const saved = await saveSteps(updatedSteps);
      if (!saved) throw new Error("Failed to save step");

      // Upload audio files
      if (pendingFiles.eng)
        await uploadAudioFile(pendingFiles.eng, "eng", formData.id);
      if (pendingFiles.arb)
        await uploadAudioFile(pendingFiles.arb, "arb", formData.id);

      toast.success(`Step ${formData.id} updated successfully`);
    }

    setIsStepModalOpen(false);
  };

  if (loading) {
    return (
      <AuthGuard>
        <Head>
          <title>Manage Steps - Admin Panel</title>
        </Head>
        <AdminLayout title="Manage Steps">
          <LoadingSpinner size="lg" message="Loading steps..." centered />
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
                  {error || "Assembly not found"}
                </p>
              </div>
            </div>
            <Link
              href="/admin/assemblies"
              className="inline-flex items-center gap-2 text-sm text-stone dark:text-silver hover:underline"
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
              className="text-stone dark:text-silver hover:text-charcoal dark:hover:text-papyrus transition-colors whitespace-nowrap"
            >
              Assemblies
            </Link>
            <ChevronRight className="w-4 h-4 text-pewter" />
            <Link
              href={`/admin/assemblies/${id}/edit`}
              className="text-stone dark:text-silver hover:text-charcoal dark:hover:text-papyrus transition-colors whitespace-nowrap font-mono"
            >
              {assembly.id}
            </Link>
            <ChevronRight className="w-4 h-4 text-pewter" />
            <span className="text-charcoal dark:text-papyrus font-medium">
              Steps
            </span>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-charcoal dark:text-papyrus">
                Assembly Steps
              </h2>
              <p className="text-sm text-stone dark:text-silver mt-1">
                {steps.length} step{steps.length !== 1 ? "s" : ""} configured
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={openAddStepModal}
                className="px-4 py-2.5 rounded-xl font-medium text-sm
                  bg-emerald-500 hover:bg-emerald-600 text-white
                  shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35
                  transition-all duration-300 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
              <button
                onClick={openCopyModal}
                className="px-4 py-2.5 rounded-xl font-medium text-sm
                  bg-sky-500 hover:bg-sky-600 text-white
                  shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/35
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
            <div className="rounded-xl border border-silver/30 dark:border-stone/20 p-12 text-center bg-neutral-50/50 dark:bg-neutral-800/50">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-500/15 dark:bg-sky-400/15 flex items-center justify-center mb-4">
                <List className="w-8 h-8 text-sky-500 dark:text-sky-400" />
              </div>
              <h3 className="text-base font-medium text-charcoal dark:text-papyrus">
                No steps yet
              </h3>
              <p className="mt-2 text-sm text-stone dark:text-silver">
                Get started by creating a new assembly step.
              </p>
              <div className="mt-6">
                <button
                  onClick={openAddStepModal}
                  className="px-6 py-2.5 rounded-xl font-medium text-sm
                    bg-emerald-500 hover:bg-emerald-600 text-white
                    shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35
                    transition-all duration-300 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Step
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-silver/30 dark:border-stone/20 overflow-hidden">
              <div className="divide-y divide-silver/30 dark:divide-stone/20">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-all duration-200 cursor-move ${
                      draggedIndex === index
                        ? "opacity-50 bg-neutral-100 dark:bg-neutral-800/30 scale-[0.98]"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Drag Handle */}
                      <div className="flex-shrink-0 mt-1">
                        <GripVertical className="w-4 h-4 text-pewter dark:text-stone" />
                      </div>

                      {/* Step Number Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/15 dark:bg-sky-400/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm shadow-sm">
                          {index + 1}
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-charcoal dark:text-papyrus">
                              {step.title.en}
                            </h3>
                            <p className="text-sm text-stone dark:text-silver mt-1 line-clamp-2">
                              {step.description.en}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              {step.duration && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-stone dark:text-silver">
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
                              className="p-2 rounded-lg text-stone dark:text-silver 
                                hover:text-purple-600 dark:hover:text-purple-400 
                                hover:bg-purple-50 dark:hover:bg-purple-900/20 
                                transition-all duration-200"
                              title="Open Visual Editor"
                            >
                              <Film className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openEditStepModal(step)}
                              className="p-2 rounded-lg text-stone dark:text-silver 
                                hover:text-charcoal dark:hover:text-papyrus 
                                hover:bg-neutral-100 dark:hover:bg-neutral-800 
                                transition-all duration-200"
                              title="Edit step"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStep(step.id)}
                              className="p-2 rounded-lg text-stone dark:text-silver 
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
            <div className="mt-4 flex items-center gap-2 text-sm text-stone dark:text-silver">
              <Lightbulb className="w-4 h-4" />
              <span>Drag and drop steps to reorder them</span>
            </div>
          )}
        </div>

        {/* Copy Modal */}
        {isCopyModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-papyrus dark:bg-charcoal rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-hidden border border-silver/50 dark:border-stone/20">
              <div className="flex items-center justify-between px-6 py-4 border-b border-silver/50 dark:border-stone/20">
                <h3 className="text-lg font-semibold text-charcoal dark:text-papyrus">
                  Copy Step from Another Cabinet
                </h3>
                <button
                  onClick={() => setIsCopyModalOpen(false)}
                  className="p-2 rounded-lg text-stone hover:text-charcoal dark:text-silver dark:hover:text-papyrus 
                    hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                      Source Cabinet
                    </label>
                    <select
                      aria-label="Source Cabinet"
                      value={sourceCabinetId}
                      onChange={(e) =>
                        handleSelectSourceCabinet(e.target.value)
                      }
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-silver/50 dark:border-stone/30 
                        bg-papyrus dark:bg-charcoal text-charcoal dark:text-papyrus
                        focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30"
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
                    <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                      Search Steps
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pewter" />
                      <input
                        type="text"
                        value={copySearch}
                        onChange={(e) => setCopySearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-silver/50 dark:border-stone/30 
                          bg-papyrus dark:bg-charcoal text-charcoal dark:text-papyrus
                          focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                      Insert at Position
                    </label>
                    <select
                      aria-label="Insert at Position"
                      value={copyInsertIndex}
                      onChange={(e) =>
                        setCopyInsertIndex(Number(e.target.value))
                      }
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-silver/50 dark:border-stone/30 
                        bg-papyrus dark:bg-charcoal text-charcoal dark:text-papyrus
                        focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30"
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

                <div className="rounded-xl border border-silver/50 dark:border-stone/20 overflow-hidden">
                  <div className="max-h-[50vh] overflow-y-auto divide-y divide-silver/30 dark:divide-stone/20">
                    {copyLoading && (
                      <div className="p-8 text-center">
                        <LoadingSpinner
                          size="md"
                          message="Loading steps..."
                          centered
                        />
                      </div>
                    )}
                    {!copyLoading && !sourceCabinetId && (
                      <div className="p-8 text-center text-sm text-stone dark:text-silver">
                        Select a source cabinet to view available steps
                      </div>
                    )}
                    {!copyLoading &&
                      sourceCabinetId &&
                      sourceSteps.length === 0 && (
                        <div className="p-8 text-center text-sm text-stone dark:text-silver">
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
                            className="p-4 flex items-start justify-between gap-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-charcoal dark:text-papyrus flex items-center justify-center text-xs font-bold">
                                  {step.id}
                                </span>
                                <span className="text-sm font-medium text-charcoal dark:text-papyrus">
                                  {step.title.en}
                                </span>
                              </div>
                              <p className="text-xs text-stone dark:text-silver mt-2 line-clamp-2 ml-9">
                                {step.description.en}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2 ml-9">
                                {step.duration && (
                                  <span className="text-xs text-stone dark:text-silver flex items-center gap-1">
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
                                text-papyrus dark:text-charcoal bg-charcoal dark:bg-papyrus
                                hover:bg-neutral-800 dark:hover:bg-neutral-200
                                shadow-md hover:shadow-lg
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
        {/* Step Form Modal */}
        <StepFormModal
          isOpen={isStepModalOpen}
          onClose={() => setIsStepModalOpen(false)}
          onSubmit={handleStepModalSubmit}
          step={selectedStepForEdit}
          mode={stepModalMode}
          stepNumber={
            stepModalMode === "create"
              ? steps.length + 1
              : Number(selectedStepForEdit?.id || 1)
          }
          assemblyId={id as string}
        />
      </AdminLayout>
    </AuthGuard>
  );
}
