import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Package, Clock } from "lucide-react";
import FileUploadField from "./FileUploadField";

export interface AssemblyFormData {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  category: string;
  estimatedTime: number;
  description: {
    en: string;
    ar: string;
  };
  model?: string;
  image?: string;
}

interface AssemblyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assembly: AssemblyFormData) => Promise<void>;
  assembly?: AssemblyFormData | null;
  categories: Array<{ id: string; name: string }>;
  mode: "create" | "edit";
}

export function AssemblyFormModal({
  isOpen,
  onClose,
  onSubmit,
  assembly,
  categories,
  mode,
}: AssemblyFormModalProps) {
  const [formData, setFormData] = useState<AssemblyFormData>({
    id: "",
    name: { en: "", ar: "" },
    category: categories[0]?.id || "base",
    estimatedTime: 0,
    description: { en: "", ar: "" },
    model: "",
    image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (assembly && mode === "edit") {
      setFormData({
        id: assembly.id,
        name: assembly.name,
        category: assembly.category,
        estimatedTime: assembly.estimatedTime,
        description: assembly.description,
        model: assembly.model || "",
        image: assembly.image || "",
      });
    } else {
      setFormData({
        id: "",
        name: { en: "", ar: "" },
        category: categories[0]?.id || "base",
        estimatedTime: 0,
        description: { en: "", ar: "" },
        model: "",
        image: "",
      });
    }
    setError(null);
  }, [assembly, mode, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.id || !formData.name.en || !formData.name.ar) {
      setError("Please fill in all required fields (ID and both names)");
      return;
    }

    // ID validation (uppercase letters, hyphens, numbers)
    if (!/^[A-Z0-9-]+$/.test(formData.id)) {
      setError(
        "Assembly ID must be uppercase letters, numbers, and hyphens only (e.g., BC-001)",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save assembly");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".");
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev as any)[keys[0]],
            [keys[1]]: value,
          },
        };
      }
      return prev;
    });
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {mode === "create"
                  ? "Add New Assembly"
                  : `Edit Assembly: ${formData.id}`}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === "create"
                  ? "Create a new assembly with details"
                  : "Update assembly information"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isSubmitting}
            type="button"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            {/* Assembly ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assembly ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) =>
                  handleChange("id", e.target.value.toUpperCase())
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                  transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                placeholder="BC-001"
                required
                disabled={mode === "edit"}
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {mode === "edit"
                  ? "Assembly ID cannot be changed"
                  : "Format: XX-000 (e.g., BC-001, WC-002)"}
              </p>
            </div>

            {/* Name (English & Arabic) - Side by Side */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assembly Name <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    English
                  </label>
                  <input
                    type="text"
                    value={formData.name.en}
                    onChange={(e) => handleChange("name.en", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      transition-all duration-200"
                    placeholder='2-Door Base 36"'
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    Arabic (عربي)
                  </label>
                  <input
                    type="text"
                    value={formData.name.ar}
                    onChange={(e) => handleChange("name.ar", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-right
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      transition-all duration-200"
                    placeholder="خزانة أرضية بابين 36"
                    dir="rtl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category & Estimated Time - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    transition-all duration-200"
                  required
                  title="Category"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Time (minutes)
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) =>
                      handleChange(
                        "estimatedTime",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      transition-all duration-200"
                    placeholder="30"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Description (English & Arabic) - Side by Side */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    English
                  </label>
                  <textarea
                    value={formData.description.en}
                    onChange={(e) =>
                      handleChange("description.en", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      transition-all duration-200 resize-none"
                    placeholder="Assembly description..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    Arabic (عربي)
                  </label>
                  <textarea
                    value={formData.description.ar}
                    onChange={(e) =>
                      handleChange("description.ar", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-right
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      transition-all duration-200 resize-none"
                    placeholder="وصف التجميع..."
                    dir="rtl"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* 3D Model & Image - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <FileUploadField
                label="3D Model (GLB)"
                value={formData.model || ""}
                onChange={(value) => handleChange("model", value)}
                accept=".glb,.gltf"
                placeholder="/models/BC-001.glb"
                directory="models"
              />
              <FileUploadField
                label="Thumbnail Image"
                value={formData.image || ""}
                onChange={(value) => handleChange("image", value)}
                accept=".png,.jpg,.jpeg,.webp"
                placeholder="/images/assemblies/BC-001.png"
                directory="images/assemblies"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-medium text-sm
                text-gray-700 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-medium text-sm
                bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                hover:from-blue-600 hover:to-indigo-700
                shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create Assembly"
                  : "Update Assembly"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
