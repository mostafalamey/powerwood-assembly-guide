import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";
import AuthGuard from "../../../components/admin/AuthGuard";
import FileUploadField from "../../../components/admin/FileUploadField";

interface CabinetFormData {
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
  steps?: any[];
}

export default function NewCabinetPage() {
  const router = useRouter();
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
      const response = await fetch("/api/cabinets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/cabinets");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to create cabinet");
        setLoading(false);
      }
    } catch (err) {
      setError("Error creating cabinet");
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

  return (
    <AuthGuard>
      <Head>
        <title>Add Cabinet - Admin Panel</title>
      </Head>
      <AdminLayout title="Add New Cabinet">
        <div className="p-4 sm:p-6">
          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/admin/cabinets"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span className="material-symbols-rounded text-lg">
                arrow_back
              </span>
              Back to Cabinets
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
            {/* Error message */}
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-rounded text-red-500 dark:text-red-400">
                    error
                  </span>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Cabinet ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cabinet ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) =>
                  handleChange("id", e.target.value.toUpperCase())
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                  bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white font-mono
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                  transition-all duration-200"
                placeholder="BC-001"
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Format: XX-000 (e.g., BC-001, WC-002)
              </p>
            </div>

            {/* Name (English & Arabic) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cabinet Name <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    English
                  </label>
                  <input
                    type="text"
                    value={formData.name.en}
                    onChange={(e) => handleChange("name.en", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                      bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      transition-all duration-200"
                    placeholder='2-Door Base Cabinet 36"'
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    Arabic
                  </label>
                  <input
                    type="text"
                    value={formData.name.ar}
                    onChange={(e) => handleChange("name.ar", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                      bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-right
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      transition-all duration-200"
                    placeholder="خزانة أرضية بابين 36 بوصة"
                    dir="rtl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category & Estimated Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                    bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    transition-all duration-200"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Time (minutes)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-400 dark:text-gray-500">
                    schedule
                  </span>
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
                      bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      transition-all duration-200"
                    placeholder="25"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Description (English & Arabic) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      transition-all duration-200 resize-none"
                    rows={3}
                    placeholder="Standard 2-door base cabinet..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    Arabic
                  </label>
                  <textarea
                    value={formData.description.ar}
                    onChange={(e) =>
                      handleChange("description.ar", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                      bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-right
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      transition-all duration-200 resize-none"
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

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push("/admin/cabinets")}
                className="px-6 py-2.5 rounded-xl text-sm font-medium
                  border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-gray-700/50
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                  transition-all duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-medium
                  bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                  hover:from-blue-600 hover:to-indigo-700
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-rounded text-lg">
                      add
                    </span>
                    Create Cabinet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
