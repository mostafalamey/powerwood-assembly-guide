import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
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
        <div className="p-6">
          <form onSubmit={handleSubmit} className="max-w-3xl">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Cabinet ID */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cabinet ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) =>
                  handleChange("id", e.target.value.toUpperCase())
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="BC-001"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Format: XX-000 (e.g., BC-001, WC-002)
              </p>
            </div>

            {/* Name (English & Arabic) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cabinet Name <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    English
                  </label>
                  <input
                    type="text"
                    value={formData.name.en}
                    onChange={(e) => handleChange("name.en", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder='2-Door Base Cabinet 36"'
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Arabic
                  </label>
                  <input
                    type="text"
                    value={formData.name.ar}
                    onChange={(e) => handleChange("name.ar", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    placeholder="خزانة أرضية بابين 36 بوصة"
                    dir="rtl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Assembly Time (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) =>
                  handleChange("estimatedTime", parseInt(e.target.value) || 0)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="25"
                min="0"
              />
            </div>

            {/* Description (English & Arabic) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    English
                  </label>
                  <textarea
                    value={formData.description.en}
                    onChange={(e) =>
                      handleChange("description.en", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Standard 2-door base cabinet..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Arabic
                  </label>
                  <textarea
                    value={formData.description.ar}
                    onChange={(e) =>
                      handleChange("description.ar", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
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
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push("/admin/cabinets")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Cabinet"}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
