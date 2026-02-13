import { useState, useEffect } from "react";
import Head from "next/head";
import AuthGuard from "@/components/admin/AuthGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/admin/ToastProvider";
import FileUploadField from "@/components/admin/FileUploadField";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import {
  Palette,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Type,
  Droplet,
} from "lucide-react";

interface TenantBranding {
  companyName: string;
  companyNameAr: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  favicon?: string;
}

export default function BrandingPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<TenantBranding>({
    companyName: "",
    companyNameAr: "",
    logo: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#6366f1",
    favicon: "",
  });
  const [originalData, setOriginalData] = useState<TenantBranding | null>(null);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const response = await fetch("/api/tenant/branding/");
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
        setOriginalData(data);
      }
    } catch (error) {
      console.error("Error fetching branding:", error);
      toast.error("Failed to load branding settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.companyName || !formData.companyNameAr) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/tenant/branding/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save branding settings");
      }

      const updated = await response.json();
      setFormData(updated);
      setOriginalData(updated);
      toast.success("Branding settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save branding settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = await toast.confirm({
      title: "Reset Changes",
      message: "Are you sure you want to reset to the last saved version?",
      confirmText: "Reset",
      cancelText: "Cancel",
      type: "warning",
    });

    if (confirmed && originalData) {
      setFormData(originalData);
      toast.success("Changes reset");
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <AuthGuard>
        <Head>
          <title>Branding - Admin Panel</title>
        </Head>
        <AdminLayout title="Branding">
          <LoadingSpinner size="lg" message="Loading..." centered />
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Head>
        <title>Branding - Admin Panel</title>
      </Head>
      <AdminLayout title="Branding">
        <div className="p-4 sm:p-6 max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                <Palette className="w-5 h-5 text-stone dark:text-silver" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-charcoal dark:text-papyrus">
                  Branding Settings
                </h1>
                <p className="text-sm text-stone dark:text-silver">
                  Customize your public app appearance
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl shadow-lg border border-silver/50 dark:border-stone/20 overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Company Name Section */}
              <div>
                <h2 className="text-lg font-semibold text-charcoal dark:text-papyrus mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5 text-stone" />
                  Company Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                      Company Name (EN) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-silver dark:border-stone 
                        bg-papyrus dark:bg-neutral-900 text-charcoal dark:text-papyrus
                        focus:ring-2 focus:ring-charcoal dark:focus:ring-papyrus focus:border-charcoal dark:focus:border-papyrus transition-colors"
                      placeholder="e.g., PowerWood"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                      Company Name (AR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyNameAr}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyNameAr: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-silver dark:border-stone 
                        bg-papyrus dark:bg-neutral-900 text-charcoal dark:text-papyrus
                        focus:ring-2 focus:ring-charcoal dark:focus:ring-papyrus focus:border-charcoal dark:focus:border-papyrus transition-colors"
                      placeholder="e.g., Ø¨Ø§ÙˆØ± ÙˆÙˆØ¯"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Section */}
              <div>
                <h2 className="text-lg font-semibold text-charcoal dark:text-papyrus mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-stone" />
                  Logo & Favicon
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                      Logo Image
                    </label>
                    <FileUploadField
                      label="Upload Logo"
                      value={formData.logo || ""}
                      onChange={(path: string) =>
                        setFormData({ ...formData, logo: path })
                      }
                      accept=".png,.jpg,.jpeg,.svg,.webp"
                      placeholder="/images/logos/company-logo.svg"
                      directory="logos"
                      helpText="Recommended: SVG or PNG with transparent background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                      Favicon
                    </label>
                    <FileUploadField
                      label="Upload Favicon"
                      value={formData.favicon || ""}
                      onChange={(path: string) =>
                        setFormData({ ...formData, favicon: path })
                      }
                      accept=".png,.ico"
                      placeholder="/favicon.ico"
                      directory="favicons"
                      helpText="Recommended: 32x32px PNG or ICO file"
                    />
                  </div>
                </div>
              </div>

              {/* Color Section */}
              <div>
                <h2 className="text-lg font-semibold text-charcoal dark:text-papyrus mb-4 flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-stone" />
                  Brand Colors
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryColor: e.target.value,
                          })
                        }
                        className="w-16 h-12 rounded-lg border-2 border-silver dark:border-stone cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryColor: e.target.value,
                          })
                        }
                        className="flex-1 px-4 py-2.5 rounded-lg border border-silver dark:border-stone 
                          bg-papyrus dark:bg-neutral-900 text-charcoal dark:text-papyrus font-mono
                          focus:ring-2 focus:ring-charcoal dark:focus:ring-papyrus focus:border-charcoal dark:focus:border-papyrus transition-colors"
                        placeholder="#3b82f6"
                      />
                    </div>
                    <p className="text-xs text-stone dark:text-silver mt-2">
                      Used for buttons, links, and accents
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-silver mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secondaryColor: e.target.value,
                          })
                        }
                        className="w-16 h-12 rounded-lg border-2 border-silver dark:border-stone cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secondaryColor: e.target.value,
                          })
                        }
                        className="flex-1 px-4 py-2.5 rounded-lg border border-silver dark:border-stone 
                          bg-papyrus dark:bg-neutral-900 text-charcoal dark:text-papyrus font-mono
                          focus:ring-2 focus:ring-charcoal dark:focus:ring-papyrus focus:border-charcoal dark:focus:border-papyrus transition-colors"
                        placeholder="#6366f1"
                      />
                    </div>
                    <p className="text-xs text-stone dark:text-silver mt-2">
                      Used for gradients and secondary elements
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div>
                <h2 className="text-lg font-semibold text-charcoal dark:text-papyrus mb-4">
                  Preview
                </h2>
                <div className="p-6 rounded-lg border-2 border-dashed border-silver dark:border-stone bg-neutral-50 dark:bg-neutral-900/50">
                  <div className="flex items-center gap-4 mb-4">
                    {formData.logo && (
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="h-12 w-auto object-contain"
                      />
                    )}
                    <div>
                      <h3
                        className="text-xl font-bold"
                        style={{ color: formData.primaryColor }}
                      >
                        {formData.companyName || "Company Name"}
                      </h3>
                      <p className="text-sm text-stone dark:text-silver">
                        {formData.companyNameAr || "Ø§Ø³Ù… Ø§Ù„Ø´Ø±ÙƒØ©"}
                      </p>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
                    style={{
                      background: `linear-gradient(to right, ${formData.primaryColor}, ${formData.secondaryColor})`,
                    }}
                  >
                    Sample Button
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-silver/50 dark:border-stone/20 flex flex-wrap gap-3 justify-end">
              <button
                onClick={handleReset}
                disabled={!hasChanges || saving}
                className="px-4 py-2.5 rounded-xl font-medium text-sm
                  bg-papyrus dark:bg-charcoal text-charcoal dark:text-silver
                  border border-silver dark:border-stone
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="px-4 py-2.5 rounded-xl font-medium text-sm
                  text-papyrus dark:text-charcoal bg-charcoal dark:bg-papyrus
                  hover:bg-neutral-800 dark:hover:bg-neutral-200
                  shadow-lg hover:shadow-xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
