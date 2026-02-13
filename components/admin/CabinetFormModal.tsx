import React, { useState, useEffect } from "react";
import Link from "next/link";
import FileUploadField from "./FileUploadField";
import { X, List } from "lucide-react";

interface CabinetFormData {
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
  model?: string;
  image?: string;
  steps?: any[];
  stepCount?: number;
}

interface CabinetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editCabinet?: CabinetFormData | null;
}

export default function CabinetFormModal({
  isOpen,
  onClose,
  onSuccess,
  editCabinet,
}: CabinetFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CabinetFormData>({
    id: "",
    name: { en: "", ar: "" },
    category: "base",
    estimatedTime: 0,
    description: { en: "", ar: "" },
    steps: [],
  });

  useEffect(() => {
    if (editCabinet) {
      setFormData(editCabinet);
    } else {
      setFormData({
        id: "",
        name: { en: "", ar: "" },
        category: "base",
        estimatedTime: 0,
        description: { en: "", ar: "" },
        steps: [],
      });
    }
    setError("");
  }, [editCabinet, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.id || !formData.name.en || !formData.name.ar) {
      setError("Please fill in all required fields (ID and both names)");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("admin_token");
      const method = editCabinet ? "PUT" : "POST";

      // Ensure description has default values if not provided
      const dataToSend = {
        ...formData,
        description: formData.description || { en: "", ar: "" },
      };

      const response = await fetch("/api/assemblies", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(
          data.message ||
            `Failed to ${editCabinet ? "update" : "create"} cabinet`,
        );
        setLoading(false);
      }
    } catch (err) {
      setError(`Error ${editCabinet ? "updating" : "creating"} cabinet`);
      setLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-papyrus dark:bg-charcoal rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-silver/30 dark:border-stone/20">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-neutral-100/50 dark:bg-neutral-800/30 px-6 py-4 border-b border-silver/30 dark:border-stone/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-charcoal dark:text-papyrus">
                  {editCabinet ? "Edit Cabinet" : "Add New Cabinet"}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-stone hover:text-charcoal dark:text-silver dark:hover:text-papyrus"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Cabinet ID */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                  Cabinet ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) =>
                    handleChange("id", e.target.value.toUpperCase())
                  }
                  className="w-full px-4 py-2.5 border border-silver/50 dark:border-stone/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 bg-white dark:bg-neutral-900 text-charcoal dark:text-papyrus"
                  placeholder="BC-001"
                  required
                  disabled={!!editCabinet}
                />
                <p className="mt-1 text-sm text-stone dark:text-silver">
                  Format: XX-000 (e.g., BC-001, WC-002)
                </p>
              </div>

              {/* Name (English & Arabic) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                  Cabinet Name <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-stone dark:text-silver mb-1">
                      English
                    </label>
                    <input
                      type="text"
                      value={formData.name.en}
                      onChange={(e) => handleChange("name.en", e.target.value)}
                      className="w-full px-4 py-2.5 border border-silver/50 dark:border-stone/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 bg-white dark:bg-neutral-900 text-charcoal dark:text-papyrus"
                      placeholder='2-Door Base Cabinet 36"'
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone dark:text-silver mb-1">
                      Arabic
                    </label>
                    <input
                      type="text"
                      value={formData.name.ar}
                      onChange={(e) => handleChange("name.ar", e.target.value)}
                      className="w-full px-4 py-2.5 border border-silver/50 dark:border-stone/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 text-right bg-white dark:bg-neutral-900 text-charcoal dark:text-papyrus"
                      placeholder="خزانة أرضية بابين 36 بوصة"
                      dir="rtl"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-4 py-2.5 border border-silver/50 dark:border-stone/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 bg-white dark:bg-neutral-900 text-charcoal dark:text-papyrus"
                  title="Select cabinet category"
                  required
                >
                  <option value="base">Base Cabinets</option>
                  <option value="wall">Wall Cabinets</option>
                  <option value="high">High Cabinets</option>
                  <option value="tall">Tall Cabinets</option>
                  <option value="corner-base">Corner Base</option>
                  <option value="corner-wall">Corner Wall</option>
                  <option value="filler">Fillers</option>
                </select>
              </div>

              {/* Estimated Time */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                  Estimated Assembly Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) =>
                    handleChange("estimatedTime", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2.5 border border-silver/50 dark:border-stone/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 bg-white dark:bg-neutral-900 text-charcoal dark:text-papyrus"
                  placeholder="25"
                  min="0"
                />
              </div>

              {/* Description (English & Arabic) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                  Description
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-stone dark:text-silver mb-1">
                      English
                    </label>
                    <textarea
                      value={formData.description?.en || ""}
                      onChange={(e) =>
                        handleChange("description.en", e.target.value)
                      }
                      className="w-full px-4 py-2.5 border border-silver/50 dark:border-stone/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 bg-white dark:bg-neutral-900 text-charcoal dark:text-papyrus"
                      rows={3}
                      placeholder="Standard 2-door base assembly..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone dark:text-silver mb-1">
                      Arabic
                    </label>
                    <textarea
                      value={formData.description?.ar || ""}
                      onChange={(e) =>
                        handleChange("description.ar", e.target.value)
                      }
                      className="w-full px-4 py-2.5 border border-silver/50 dark:border-stone/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 text-right bg-white dark:bg-neutral-900 text-charcoal dark:text-papyrus"
                      rows={3}
                      placeholder="خزانة أرضية قياسية بابين..."
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>

              {/* Model Upload */}
              <FileUploadField
                label="3D Model"
                value={formData.model || ""}
                onChange={(path) => handleChange("model", path)}
                accept=".glb,.gltf"
                placeholder="/models/BC_001.glb"
                directory="models"
                helpText="GLB or GLTF files (max 50MB)"
              />

              {/* Image Upload */}
              <FileUploadField
                label="Cabinet Image"
                value={formData.image || ""}
                onChange={(path) => handleChange("image", path)}
                accept="image/*,.png,.jpg,.jpeg,.webp"
                placeholder="/images/cabinets/BC-001.png"
                directory="images/cabinets"
                helpText="PNG, JPG, or WebP images"
              />
            </div>

            {/* Footer */}
            <div className="bg-neutral-100/50 dark:bg-neutral-800/30 px-6 py-4 border-t border-silver/30 dark:border-stone/20 flex justify-between items-center">
              <div>
                {editCabinet && (
                  <Link
                    href={`/admin/cabinets/${formData.id}/steps`}
                    className="text-sm text-charcoal dark:text-papyrus hover:underline inline-flex items-center gap-1 font-medium"
                    onClick={onClose}
                  >
                    <List className="w-4 h-4" />
                    Manage Steps ({formData.stepCount || 0})
                  </Link>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm text-stone dark:text-silver hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-medium text-sm bg-charcoal dark:bg-papyrus text-papyrus dark:text-charcoal hover:bg-neutral-800 dark:hover:bg-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading
                    ? editCabinet
                      ? "Updating..."
                      : "Creating..."
                    : editCabinet
                      ? "Update Cabinet"
                      : "Create Cabinet"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
