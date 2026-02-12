import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/admin/AdminLayout";
import AuthGuard from "../../../components/admin/AuthGuard";
import Image from "next/image";
import { useToast } from "../../../components/admin/ToastProvider";
import {
  CategoryFormModal,
  CategoryFormData,
} from "../../../components/admin/CategoryFormModal";
import {
  AssemblyFormModal,
  AssemblyFormData,
} from "../../../components/admin/AssemblyFormModal";
import {
  Search,
  QrCode,
  Plus,
  AlertCircle,
  Image as ImageIcon,
  ListOrdered,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  List,
  Trash2,
  Package,
  FolderPlus,
  FolderTree,
  GripVertical,
} from "lucide-react";

interface Assembly {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  category: string;
  estimatedTime: number;
  description?: {
    en: string;
    ar: string;
  };
  stepCount?: number;
  steps?: any[];
  model?: string;
  image?: string;
}

interface Category {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  icon?: string;
}

export default function AssembliesListPage() {
  const toast = useToast();
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categoryModalMode, setCategoryModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [isAssemblyModalOpen, setIsAssemblyModalOpen] = useState(false);
  const [selectedAssembly, setSelectedAssembly] =
    useState<AssemblyFormData | null>(null);
  const [assemblyModalMode, setAssemblyModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [draggedAssemblyId, setDraggedAssemblyId] = useState<string | null>(
    null,
  );
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(
    null,
  );
  const [isDragActive, setIsDragActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    fetchAssemblys();
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchAssemblys = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/assemblies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssemblies(data);
      } else {
        setError("Failed to fetch assemblies");
        toast.error("Failed to fetch assemblies.");
      }
    } catch (err) {
      setError("Error loading assemblies");
      toast.error("Error loading assemblies.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAssemblyById = async (assemblyId: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/assemblies?id=${assemblyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as Assembly;
    } catch (error) {
      console.error("Error loading assembly:", error);
      return null;
    }
  };

  const handleCreateCategory = async (formData: CategoryFormData) => {
    const token = localStorage.getItem("admin_token");
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || error.message || "Failed to create category",
      );
    }

    toast.success("Category created successfully");
    fetchCategories();
  };

  const handleUpdateCategory = async (formData: CategoryFormData) => {
    const token = localStorage.getItem("admin_token");
    const response = await fetch("/api/categories", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || error.message || "Failed to update category",
      );
    }

    toast.success("Category updated successfully");
    fetchCategories();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const confirmed = await toast.confirm({
      title: "Delete Category",
      message:
        "Are you sure you want to delete this category? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/categories?id=${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "Failed to delete category",
        );
      }

      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  const openCreateCategoryModal = () => {
    setSelectedCategory(null);
    setCategoryModalMode("create");
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: Category) => {
    setSelectedCategory(category);
    setCategoryModalMode("edit");
    setIsCategoryModalOpen(true);
  };

  const handleCreateAssembly = async (formData: AssemblyFormData) => {
    const token = localStorage.getItem("admin_token");
    const response = await fetch("/api/assemblies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || error.message || "Failed to create assembly",
      );
    }

    toast.success("Assembly created successfully");
    fetchAssemblys();
  };

  const handleUpdateAssembly = async (
    formData: AssemblyFormData & { steps?: any[] },
  ) => {
    const token = localStorage.getItem("admin_token");
    const response = await fetch("/api/assemblies", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || error.message || "Failed to update assembly",
      );
    }

    toast.success("Assembly updated successfully");
    fetchAssemblys();
  };

  const handleAssemblyDragStart =
    (assemblyId: string) => (event: React.DragEvent) => {
      event.dataTransfer.setData("text/plain", assemblyId);
      event.dataTransfer.effectAllowed = "move";
      const dragImageTarget = (event.currentTarget as HTMLElement).closest(
        "tr",
      ) as HTMLElement | null;
      if (dragImageTarget) {
        const rect = dragImageTarget.getBoundingClientRect();
        event.dataTransfer.setDragImage(
          dragImageTarget,
          event.clientX - rect.left,
          event.clientY - rect.top,
        );
      }
      setDraggedAssemblyId(assemblyId);
      setIsDragActive(true);
    };

  const handleAssemblyDragEnd = () => {
    setDraggedAssemblyId(null);
    setDragOverCategoryId(null);
    setIsDragActive(false);
  };

  const handleCategoryDragOver =
    (categoryId: string) => (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setDragOverCategoryId(categoryId);
    };

  const handleCategoryDragLeave = (event: React.DragEvent) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    setDragOverCategoryId(null);
  };

  const handleCategoryDrop =
    (categoryId: string) => async (event: React.DragEvent) => {
      event.preventDefault();
      const assemblyId =
        event.dataTransfer.getData("text/plain") || draggedAssemblyId;

      setDragOverCategoryId(null);
      setIsDragActive(false);
      setDraggedAssemblyId(null);

      if (!assemblyId) {
        return;
      }

      const currentAssembly = assemblies.find((a) => a.id === assemblyId);
      if (!currentAssembly || currentAssembly.category === categoryId) {
        return;
      }

      const fullAssembly = await fetchAssemblyById(assemblyId);
      if (!fullAssembly) {
        toast.error("Failed to load assembly details.");
        return;
      }

      try {
        await handleUpdateAssembly({
          ...fullAssembly,
          category: categoryId,
          description: fullAssembly.description ?? { en: "", ar: "" },
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to update assembly category.");
      }
    };

  const openCreateAssemblyModal = () => {
    setSelectedAssembly(null);
    setAssemblyModalMode("create");
    setIsAssemblyModalOpen(true);
  };

  const openEditAssemblyModal = (assembly: Assembly) => {
    // Convert Assembly to AssemblyFormData format
    const assemblyFormData: AssemblyFormData = {
      id: assembly.id,
      name: assembly.name,
      category: assembly.category,
      estimatedTime: assembly.estimatedTime,
      description: assembly.description || { en: "", ar: "" },
      model: assembly.model,
      image: assembly.image,
    };
    setSelectedAssembly(assemblyFormData);
    setAssemblyModalMode("edit");
    setIsAssemblyModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await toast.confirm({
      title: "Delete Assembly",
      message: `Are you sure you want to delete assembly ${id}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/assemblies?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAssemblies(assemblies.filter((c) => c.id !== id));
        toast.success(`Assembly ${id} deleted.`);
      } else {
        toast.error("Failed to delete assembly.");
      }
    } catch (err) {
      toast.error("Error deleting assembly.");
      console.error(err);
    }
  };

  const handleEdit = (assembly: Assembly) => {
    openEditAssemblyModal(assembly);
  };

  const handleManageSteps = (assembly: Assembly) => {
    router.push(`/admin/assemblies/${assembly.id}/steps`);
    setActiveDropdown(null);
  };

  const handleAddNew = () => {
    openCreateAssemblyModal();
  };

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeDropdown === id) {
      setActiveDropdown(null);
      setDropdownPosition(null);
    } else {
      const button = e.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
      setActiveDropdown(id);
    }
  };

  const filteredAssemblies = assemblies.filter(
    (assembly) =>
      assembly.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assembly.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assembly.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Group assemblies by category
  const assemblyGroups: Record<string, Assembly[]> = {};
  filteredAssemblies.forEach((assembly) => {
    if (!assemblyGroups[assembly.category]) {
      assemblyGroups[assembly.category] = [];
    }
    assemblyGroups[assembly.category].push(assembly);
  });

  const getCategoryData = (categoryId: string): Category | undefined => {
    return categories.find((cat) => cat.id === categoryId);
  };

  return (
    <AuthGuard>
      <Head>
        <title>Assemblies - Admin Panel</title>
      </Head>
      <AdminLayout title="Assemblies">
        <div className="p-4 sm:p-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search assemblies..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 
                    bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    transition-all duration-200 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={openCreateCategoryModal}
                className="px-4 py-2.5 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-amber-500 to-orange-600 text-white
                  hover:from-amber-600 hover:to-orange-700
                  shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40
                  transition-all duration-300 inline-flex items-center gap-2"
              >
                <FolderPlus className="w-5 h-5" />
                Add Category
              </button>
              <Link
                href="/admin/qr-codes"
                className="px-4 py-2.5 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-purple-500 to-purple-600 text-white
                  hover:from-purple-600 hover:to-purple-700
                  shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40
                  transition-all duration-300 inline-flex items-center gap-2"
              >
                <QrCode className="w-5 h-5" />
                <span className="hidden sm:inline">QR Codes</span>
              </Link>
              <button
                onClick={handleAddNew}
                className="px-4 py-2.5 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                  hover:from-blue-600 hover:to-indigo-700
                  shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                  transition-all duration-300 inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Assembly
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
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
              <p className="text-gray-600 dark:text-gray-400">
                Loading assemblies...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Category-Grouped Assemblies */}
          {!loading && !error && (
            <div className="space-y-8">
              {categories.map((category) => {
                const assembliesInCategory = assemblyGroups[category.id] || [];
                const filteredInCategory = assembliesInCategory.filter(
                  (assembly) =>
                    assembly.id
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    assembly.name.en
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    assembly.name.ar
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                );

                const isDropTarget = dragOverCategoryId === category.id;

                return (
                  <div
                    key={category.id}
                    className={`space-y-4 rounded-xl transition-colors ${
                      isDropTarget ? "bg-blue-50/40 dark:bg-blue-900/10" : ""
                    }`}
                    onDragOver={handleCategoryDragOver(category.id)}
                    onDragLeave={handleCategoryDragLeave}
                    onDrop={handleCategoryDrop(category.id)}
                  >
                    {/* Category Header */}
                    <div
                      className={`flex items-center justify-between gap-4 pb-3 border-b-2 transition-colors ${
                        isDropTarget
                          ? "border-blue-400 bg-blue-50/60 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      } ${isDragActive ? "rounded-xl px-2 py-2 -mx-2" : ""}`}
                      onDragOver={handleCategoryDragOver(category.id)}
                      onDrop={handleCategoryDrop(category.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                          <FolderTree className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {category.name}
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {assembliesInCategory.length}{" "}
                            {assembliesInCategory.length === 1
                              ? "assembly"
                              : "assemblies"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditCategoryModal(category)}
                          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 
                            hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                          aria-label="Edit category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={assembliesInCategory.length > 0}
                          className="p-2 rounded-lg transition-all duration-200
                            disabled:opacity-40 disabled:cursor-not-allowed
                            text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                            disabled:hover:bg-transparent"
                          aria-label="Delete category"
                          title={
                            assembliesInCategory.length > 0
                              ? "Cannot delete category with assemblies"
                              : "Delete category"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Desktop Table View */}
                    {filteredInCategory.length > 0 ? (
                      <>
                        <div className="hidden lg:block rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-visible">
                          <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                              <tr>
                                <th className="px-2 py-3" aria-hidden="true" />
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                  Thumbnail
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                  ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                  Name (EN)
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                  Steps
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                  Time
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50 overflow-visible">
                              {filteredInCategory.map((assembly) => (
                                <tr
                                  key={assembly.id}
                                  className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${
                                    draggedAssemblyId === assembly.id
                                      ? "opacity-60"
                                      : ""
                                  }`}
                                >
                                  <td className="px-2 py-4 whitespace-nowrap">
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                                      aria-label={`Drag ${assembly.id}`}
                                      draggable
                                      onDragStart={handleAssemblyDragStart(
                                        assembly.id,
                                      )}
                                      onDragEnd={handleAssemblyDragEnd}
                                    >
                                      <GripVertical className="w-4 h-4" />
                                    </button>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="w-14 h-14 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                                      {assembly.image ? (
                                        <Image
                                          src={assembly.image}
                                          alt={assembly.name.en}
                                          width={56}
                                          height={56}
                                          className="object-cover"
                                          onError={(e) => {
                                            (
                                              e.target as HTMLImageElement
                                            ).style.display = "none";
                                          }}
                                        />
                                      ) : (
                                        <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="text-sm font-mono font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                      {assembly.id}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {assembly.name.en}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                      <ListOrdered className="w-4 h-4" />
                                      {assembly.stepCount !== undefined
                                        ? assembly.stepCount
                                        : assembly.steps?.length || 0}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                      <Clock className="w-4 h-4" />
                                      {assembly.estimatedTime}m
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    <button
                                      onClick={(e) =>
                                        toggleDropdown(assembly.id, e)
                                      }
                                      className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
                                        hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                      aria-label="Open actions menu"
                                    >
                                      <MoreVertical className="w-5 h-5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden grid gap-4">
                          {filteredInCategory.map((assembly) => (
                            <div
                              key={assembly.id}
                              className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 
                                hover:shadow-lg hover:border-gray-300/50 dark:hover:border-gray-600/50 transition-all duration-300"
                              draggable
                              onDragStart={handleAssemblyDragStart(assembly.id)}
                              onDragEnd={handleAssemblyDragEnd}
                            >
                              <div className="flex gap-4">
                                <div className="w-16 h-16 flex-shrink-0 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                                  {assembly.image ? (
                                    <Image
                                      src={assembly.image}
                                      alt={assembly.name.en}
                                      width={64}
                                      height={64}
                                      className="object-cover"
                                      onError={(e) => {
                                        (
                                          e.target as HTMLImageElement
                                        ).style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {assembly.name.en}
                                      </h3>
                                      <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded inline-block">
                                        {assembly.id}
                                      </p>
                                    </div>
                                    <div className="relative flex-shrink-0">
                                      <button
                                        onClick={(e) =>
                                          toggleDropdown(assembly.id, e)
                                        }
                                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
                                          hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                        aria-label="Open actions menu"
                                      >
                                        <MoreVertical className="w-5 h-5" />
                                      </button>
                                      {activeDropdown === assembly.id && (
                                        <div
                                          className="absolute top-full right-0 mt-1 w-48 rounded-xl shadow-xl bg-white dark:bg-gray-800 z-50 
                                          border border-gray-200 dark:border-gray-700 overflow-hidden"
                                        >
                                          <div className="py-1">
                                            <Link
                                              href={`/assembly/${assembly.id}`}
                                              target="_blank"
                                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                              <Eye className="w-4 h-4" />
                                              View
                                            </Link>
                                            <button
                                              onClick={() =>
                                                handleEdit(assembly)
                                              }
                                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                              <Edit className="w-4 h-4" />
                                              Edit
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleManageSteps(assembly)
                                              }
                                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                              <List className="w-4 h-4" />
                                              Manage Steps
                                            </button>
                                            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                                            <button
                                              onClick={() =>
                                                handleDelete(assembly.id)
                                              }
                                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                              Delete
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-3">
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                      <ListOrdered className="w-3.5 h-3.5" />
                                      {assembly.stepCount !== undefined
                                        ? assembly.stepCount
                                        : assembly.steps?.length || 0}{" "}
                                      steps
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                      <Clock className="w-3.5 h-3.5" />
                                      {assembly.estimatedTime}m
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {searchTerm
                            ? "No assemblies match your search in this category"
                            : "No assemblies in this category yet"}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty state when no categories */}
              {categories.length === 0 && (
                <div className="px-4 py-16 text-center text-gray-500 dark:text-gray-400">
                  <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-1">No categories yet</p>
                  <p className="text-sm">
                    Create your first category to organize your assemblies
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Category Form Modal */}
          {isCategoryModalOpen && (
            <CategoryFormModal
              isOpen={isCategoryModalOpen}
              onClose={() => {
                setIsCategoryModalOpen(false);
                setSelectedCategory(null);
                setCategoryModalMode("create");
              }}
              onSubmit={
                categoryModalMode === "create"
                  ? handleCreateCategory
                  : handleUpdateCategory
              }
              category={selectedCategory || undefined}
              mode={categoryModalMode}
            />
          )}

          {/* Assembly Form Modal */}
          {isAssemblyModalOpen && (
            <AssemblyFormModal
              isOpen={isAssemblyModalOpen}
              onClose={() => {
                setIsAssemblyModalOpen(false);
                setSelectedAssembly(null);
                setAssemblyModalMode("create");
              }}
              onSubmit={
                assemblyModalMode === "create"
                  ? handleCreateAssembly
                  : handleUpdateAssembly
              }
              assembly={selectedAssembly || undefined}
              categories={categories}
              mode={assemblyModalMode}
            />
          )}
        </div>

        {/* Portal-rendered dropdown for desktop table view */}
        {isMounted &&
          activeDropdown &&
          dropdownPosition &&
          createPortal(
            <div
              className="fixed w-48 rounded-xl shadow-xl bg-white dark:bg-gray-800 z-[9999] 
              border border-gray-200 dark:border-gray-700 overflow-hidden hidden lg:block"
              style={{
                top: dropdownPosition.top,
                right: dropdownPosition.right,
              }}
            >
              <div className="py-1">
                <Link
                  href={`/assembly/${activeDropdown}`}
                  target="_blank"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <button
                  onClick={() => {
                    const assembly = assemblies.find(
                      (a) => a.id === activeDropdown,
                    );
                    if (assembly) openEditAssemblyModal(assembly);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <Link
                  href={`/admin/assemblies/${activeDropdown}/steps`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <List className="w-4 h-4" />
                  Manage Steps
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                <button
                  onClick={() => {
                    handleDelete(activeDropdown);
                    setActiveDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>,
            document.body,
          )}
      </AdminLayout>
    </AuthGuard>
  );
}
