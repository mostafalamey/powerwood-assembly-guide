import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import AdminLayout from "../../../../components/admin/AdminLayout";
import AuthGuard from "../../../../components/admin/AuthGuard";
import Link from "next/link";
import FileUploadField from "../../../../components/admin/FileUploadField";

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

export default function EditCabinetPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    if (id) {
      fetchCabinet();
    }
  }, [id]);

  const fetchCabinet = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/cabinets?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      } else {
        setError("Failed to fetch cabinet");
      }
    } catch (err) {
      setError("Error loading cabinet");
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
      const response = await fetch("/api/cabinets", {
        method: "PUT",
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
        setError(data.message || "Failed to update cabinet");
        setSaving(false);
      }
    } catch (err) {
      setError("Error updating cabinet");
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
          <title>Edit Cabinet - Admin Panel</title>
        </Head>
        <AdminLayout title="Edit Cabinet">
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading cabinet...
            </p>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Head>
        <title>Edit Cabinet {formData.id} - Admin Panel</title>
      </Head>
      <AdminLayout title={`Edit Cabinet: ${formData.id}`}>
        <div className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <Link
              href="/admin/cabinets"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Cabinets
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl space-y-4">
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Cabinet ID (Read-only) */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                Cabinet ID
              </label>
              <input
                type="text"
                value={formData.id}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                disabled
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Cabinet ID cannot be changed
              </p>
            </div>

            {/* Name (English & Arabic) */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                Cabinet Name <span className="text-red-500">*</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                    English
                  </label>
                  <input
                    type="text"
                    value={formData.name.en}
                    onChange={(e) => handleChange("name.en", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:bg-gray-900/60 dark:text-white"
                    placeholder='2-Door Base Cabinet 36"'
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                    Arabic
                  </label>
                  <input
                    type="text"
                    value={formData.name.ar}
                    onChange={(e) => handleChange("name.ar", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-right dark:bg-gray-900/60 dark:text-white"
                    placeholder="خزانة أرضية بابين 36 بوصة"
                    dir="rtl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                title="category"
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:bg-gray-900/60 dark:text-white"
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
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                Estimated Assembly Time (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) =>
                  handleChange("estimatedTime", parseInt(e.target.value) || 0)
                }
                className="w-full max-w-xs px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:bg-gray-900/60 dark:text-white"
                placeholder="25"
                min="0"
              />
            </div>

            {/* Description (English & Arabic) */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                Description
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                    English
                  </label>
                  <textarea
                    value={formData.description.en}
                    onChange={(e) =>
                      handleChange("description.en", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:bg-gray-900/60 dark:text-white"
                    rows={2}
                    placeholder="Standard 2-door base cabinet..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                    Arabic
                  </label>
                  <textarea
                    value={formData.description.ar}
                    onChange={(e) =>
                      handleChange("description.ar", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-right dark:bg-gray-900/60 dark:text-white"
                    rows={2}
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

            {/* Step Count (Read-only info) */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                Assembly Steps
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-md">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formData.steps?.length || 0} step(s) configured
                </span>
                <Link
                  href={`/admin/cabinets/${formData.id}/steps`}
                  className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Manage Steps
                </Link>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/admin/cabinets"
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Cabinet"}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
