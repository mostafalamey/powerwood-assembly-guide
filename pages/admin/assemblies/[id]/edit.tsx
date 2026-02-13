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
import LoadingSpinner from "../../../../components/admin/LoadingSpinner";

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
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

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
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4">
              <LoadingSpinner size="md" />
            </div>
            <p className="text-stone dark:text-silver">Loading assembly...</p>
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
              className="inline-flex items-center gap-2 text-sm text-stone dark:text-silver hover:text-charcoal dark:hover:text-papyrus transition-colors"
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
              <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-2xl border border-silver/50 dark:border-stone/20 shadow-xl p-6 space-y-5">
                {/* Assembly ID (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                    Assembly ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    className="w-full px-4 py-3 rounded-xl border border-silver/50 dark:border-stone/20 
                      bg-neutral-50 dark:bg-neutral-800/50 text-stone dark:text-silver font-mono
                      cursor-not-allowed"
                    disabled
                  />
                  <p className="mt-2 text-sm text-stone dark:text-silver">
                    Assembly ID cannot be changed
                  </p>
                </div>

                {/* Name (English & Arabic) */}
                <div>
                  <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                    Assembly Name <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-stone dark:text-silver mb-1.5">
                        English
                      </label>
                      <input
                        type="text"
                        value={formData.name.en}
                        onChange={(e) =>
                          handleChange("name.en", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-silver/50 dark:border-stone/30 
                          bg-white/50 dark:bg-neutral-800/50 text-charcoal dark:text-papyrus
                          placeholder-pewter dark:placeholder-stone
                          focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 focus:border-charcoal dark:focus:border-papyrus
                          transition-all duration-200"
                        placeholder='2-Door Base Cabinet 36"'
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone dark:text-silver mb-1.5">
                        Arabic
                      </label>
                      <input
                        type="text"
                        value={formData.name.ar}
                        onChange={(e) =>
                          handleChange("name.ar", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-silver/50 dark:border-stone/30 
                          bg-white/50 dark:bg-neutral-800/50 text-charcoal dark:text-papyrus text-right
                          placeholder-pewter dark:placeholder-stone
                          focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 focus:border-charcoal dark:focus:border-papyrus
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
                    <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      title="category"
                      onChange={(e) => handleChange("category", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-silver/50 dark:border-stone/30 
                        bg-white/50 dark:bg-neutral-800/50 text-charcoal dark:text-papyrus
                        focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 focus:border-charcoal dark:focus:border-papyrus
                        transition-all duration-200"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                      Estimated Time (minutes)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pewter dark:text-stone" />
                      <input
                        type="number"
                        value={formData.estimatedTime}
                        onChange={(e) =>
                          handleChange(
                            "estimatedTime",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-silver/50 dark:border-stone/30 
                          bg-white/50 dark:bg-neutral-800/50 text-charcoal dark:text-papyrus
                          placeholder-pewter dark:placeholder-stone
                          focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 focus:border-charcoal dark:focus:border-papyrus
                          transition-all duration-200"
                        placeholder="25"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Description (English & Arabic) */}
                <div>
                  <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                    Description
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-stone dark:text-silver mb-1.5">
                        English
                      </label>
                      <textarea
                        value={formData.description.en}
                        onChange={(e) =>
                          handleChange("description.en", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-silver/50 dark:border-stone/30 
                          bg-white/50 dark:bg-neutral-800/50 text-charcoal dark:text-papyrus
                          placeholder-pewter dark:placeholder-stone
                          focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 focus:border-charcoal dark:focus:border-papyrus
                          transition-all duration-200 resize-none"
                        rows={3}
                        placeholder="Standard 2-door base assembly..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone dark:text-silver mb-1.5">
                        Arabic
                      </label>
                      <textarea
                        value={formData.description.ar}
                        onChange={(e) =>
                          handleChange("description.ar", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-silver/50 dark:border-stone/30 
                          bg-white/50 dark:bg-neutral-800/50 text-charcoal dark:text-papyrus text-right
                          placeholder-pewter dark:placeholder-stone
                          focus:outline-none focus:ring-2 focus:ring-charcoal/30 dark:focus:ring-papyrus/30 focus:border-charcoal dark:focus:border-papyrus
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
                  <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                    Assembly Steps
                  </label>
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-xl border border-silver/30 dark:border-stone/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <ListOrdered className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm font-medium text-charcoal dark:text-silver">
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
                <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-2xl border border-silver/50 dark:border-stone/20 shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-charcoal dark:bg-papyrus flex items-center justify-center shadow-lg">
                      <Upload className="w-5 h-5 text-papyrus dark:text-charcoal" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-charcoal dark:text-papyrus">
                        Assembly Assets
                      </h3>
                      <p className="text-xs text-stone dark:text-silver">
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
                      label="Assembly Image"
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
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-silver/50 dark:border-stone/20">
              <Link
                href="/admin/assemblies"
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-center
                  border border-silver dark:border-stone text-charcoal dark:text-silver
                  hover:bg-neutral-100 dark:hover:bg-neutral-800
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal dark:focus:ring-papyrus
                  transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-medium
                  text-papyrus dark:text-charcoal bg-charcoal dark:bg-papyrus
                  hover:bg-neutral-800 dark:hover:bg-neutral-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal dark:focus:ring-papyrus
                  shadow-lg hover:shadow-xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 flex items-center justify-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Assembly
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
