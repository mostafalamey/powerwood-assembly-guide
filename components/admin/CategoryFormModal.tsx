import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, FolderTree } from "lucide-react";
import FileUploadField from "./FileUploadField";

export interface CategoryFormData {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  icon?: string;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: CategoryFormData) => Promise<void>;
  category?: CategoryFormData | null;
  mode: "create" | "edit";
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  mode,
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    id: "",
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    icon: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus trap and ESC key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [isSubmitting, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(
        () =>
          modalRef.current
            ?.querySelector<HTMLElement>("input, button")
            ?.focus(),
        50,
      );
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (category && mode === "edit") {
      setFormData({
        id: category.id,
        name: category.name,
        nameAr: category.nameAr,
        description: category.description || "",
        descriptionAr: category.descriptionAr || "",
        icon: category.icon || "",
      });
    } else {
      setFormData({
        id: "",
        name: "",
        nameAr: "",
        description: "",
        descriptionAr: "",
        icon: "",
      });
    }
    setError(null);
  }, [category, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.id || !formData.name || !formData.nameAr) {
      setError("Please fill in all required fields");
      return;
    }

    // ID validation (lowercase, alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/.test(formData.id)) {
      setError(
        "Category ID must be lowercase letters, numbers, and hyphens only",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "create" ? "Create New Category" : "Edit Category"}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <FolderTree className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {mode === "create" ? "Create New Category" : "Edit Category"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === "create"
                  ? "Add a new category to organize your assemblies"
                  : "Update category information and settings"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="p-6 space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            {/* Category ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category ID *
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value.toLowerCase() })
                }
                disabled={mode === "edit" || isSubmitting}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                transition-all duration-200
                disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                placeholder="e.g., base-cabinets, wall-units"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Lowercase letters, numbers, and hyphens only. Cannot be changed
                after creation.
              </p>
            </div>

            {/* Names - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* English Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                  transition-all duration-200"
                  placeholder="e.g., Base Cabinets"
                  required
                />
              </div>

              {/* Arabic Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name (Arabic) *
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) =>
                    setFormData({ ...formData, nameAr: e.target.value })
                  }
                  disabled={isSubmitting}
                  dir="rtl"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-right
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                  transition-all duration-200"
                  placeholder="مثل: الخزائن الأرضية"
                  required
                />
              </div>
            </div>

            {/* Descriptions - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* English Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (English)
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                  transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="Brief description of this category..."
                />
              </div>

              {/* Arabic Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Arabic)
                </label>
                <textarea
                  value={formData.descriptionAr || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionAr: e.target.value })
                  }
                  disabled={isSubmitting}
                  dir="rtl"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-right
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                  transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="وصف مختصر لهذه الفئة..."
                />
              </div>
            </div>

            {/* Category Thumbnail/Icon Upload */}
            <FileUploadField
              label="Category Thumbnail"
              value={formData.icon || ""}
              onChange={(path) => setFormData({ ...formData, icon: path })}
              accept="image/*,.png,.jpg,.jpeg,.webp,.svg"
              placeholder="/images/categories/category-icon.png"
              directory="images/categories"
              helpText="PNG, JPG, WebP, or SVG images for category display"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl font-medium text-sm
                text-gray-700 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-medium text-sm
                bg-gradient-to-r from-amber-500 to-orange-600 text-white
                hover:from-amber-600 hover:to-orange-700
                shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create Category"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
