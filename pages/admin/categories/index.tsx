import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AuthGuard from "@/components/admin/AuthGuard";
import {
  CategoryFormModal,
  CategoryFormData,
} from "@/components/admin/CategoryFormModal";
import { useToast } from "@/components/admin/ToastProvider";
import { Plus, Edit2, Trash2, FolderOpen } from "lucide-react";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface Category {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  icon?: string;
}

export default function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        toast.error("Failed to load categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleDeleteCategory = async (id: string) => {
    const confirmed = await toast.confirm({
      title: "Delete Category",
      message:
        "Are you sure you want to delete this category? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/categories?id=${id}`, {
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

  const openCreateModal = () => {
    setSelectedCategory(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  return (
    <AuthGuard>
      <AdminLayout title="Manage Categories">
        <div className="space-y-6 p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-charcoal dark:text-papyrus">
                Categories
              </h1>
              <p className="text-stone dark:text-silver mt-1">
                Organize your assemblies into categories
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 
                bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium
                shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35
                transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <LoadingSpinner
                size="lg"
                message="Loading categories..."
                centered
              />
            </div>
          )}

          {/* Categories Grid */}
          {!loading && categories.length === 0 && (
            <div className="text-center py-12 bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-2xl border-2 border-dashed border-silver dark:border-stone">
              <FolderOpen className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal dark:text-papyrus mb-2">
                No categories yet
              </h3>
              <p className="text-stone dark:text-silver mb-4">
                Get started by creating your first category
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 
                  bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium
                  shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35
                  transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Create Category
              </button>
            </div>
          )}

          {!loading && categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-2xl border border-silver/50 dark:border-stone/20 shadow-xl p-5 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-charcoal dark:text-papyrus text-lg">
                        {category.name}
                      </h3>
                      <p className="text-stone dark:text-silver text-sm mt-1 rtl">
                        {category.nameAr}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 text-stone hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-stone dark:text-silver">ID:</p>
                      <p className="text-sm font-mono text-charcoal dark:text-silver">
                        {category.id}
                      </p>
                    </div>

                    {category.description && (
                      <div>
                        <p className="text-xs text-stone dark:text-silver">
                          Description:
                        </p>
                        <p className="text-sm text-charcoal dark:text-silver">
                          {category.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Form Modal */}
        <CategoryFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={
            modalMode === "create" ? handleCreateCategory : handleUpdateCategory
          }
          category={selectedCategory}
          mode={modalMode}
        />
      </AdminLayout>
    </AuthGuard>
  );
}
