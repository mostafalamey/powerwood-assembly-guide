import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import AdminLayout from "../../../../components/admin/AdminLayout";
import AuthGuard from "../../../../components/admin/AuthGuard";
import Link from "next/link";
import FileUploadField from "../../../../components/admin/FileUploadField";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  ListOrdered,
  FileEdit,
  Upload,
  Save,
} from "lucide-react";

interface AssemblyFormData {
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

export default function EditAssemblyPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<AssemblyFormData>({
    id: "",
    name: { en: "", ar: "" },
    category: "base",
    estimatedTime: 0,
    description: { en: "", ar: "" },
    steps: [],
  });

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
        setFormData(data);
      } else {
        setError("Failed to fetch assembly");
      }
    } catch (err) {
      setError("Error loading assembly");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.id || !formData.name.en || !formData.name.ar) {
      setError("Please fill in all required fields (ID and both names)");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/assemblies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/assemblies");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update assembly");
        setSaving(false);
      }
    } catch (err) {
      setError("Error updating assembly");
      setSaving(false);
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

  if (loading) {
    return (
      <AuthGuard>
        <Head>
          <title>Edit Assembly - Admin Panel</title>
        </Head>
        <AdminLayout title="Edit Assembly">
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
            <p className="text-gray-600 dark:text-gray-400">
              Loading assembly...
            </p>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Head>
        <title>Edit Assembly {formData.id} - Admin Panel</title>
      </Head>
      <AdminLayout title={`Edit Assembly: ${formData.id}`}>
        <div className="p-4 sm:p-6">
          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/admin/assemblies"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Assemblies
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] items-start">
              {/* Left Column - Cabinet Details */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-6 space-y-5">
                {/* Cabinet ID (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cabinet ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
                      bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-mono
                      cursor-not-allowed"
                    disabled
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Cabinet ID cannot be changed
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
                        onChange={(e) =>
                          handleChange("name.en", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleChange("name.ar", e.target.value)
                        }
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      title="category"
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
                        placeholder="Standard 2-door base assembly..."
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

                {/* Step Count (Read-only info) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assembly Steps
                  </label>
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <ListOrdered className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formData.steps?.length || 0} step(s) configured
                      </span>
                    </div>
                    <Link
                      href={`/admin/assemblies/${formData.id}/steps`}
                      className="px-4 py-2 text-sm font-medium rounded-xl
                        bg-gradient-to-r from-purple-500 to-purple-600 text-white
                        hover:from-purple-600 hover:to-purple-700
                        shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40
                        transition-all duration-300 inline-flex items-center gap-2"
                    >
                      <FileEdit className="w-5 h-5" />
                      Manage Steps
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column - File Uploads */}
              <div className="space-y-4">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Cabinet Assets
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        3D model and preview image
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
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
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/admin/cabinets"
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-center
                  border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-gray-700/50
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                  transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-medium
                  bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                  hover:from-blue-600 hover:to-indigo-700
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 flex items-center justify-center gap-2"
                disabled={saving}
              >
                {saving ? (
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Cabinet
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
