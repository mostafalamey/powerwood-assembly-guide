import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/admin/AdminLayout";
import AuthGuard from "../../components/admin/AuthGuard";
import {
  AssemblyFormModal,
  AssemblyFormData,
} from "../../components/admin/AssemblyFormModal";
import { useToast } from "../../components/admin/ToastProvider";
import {
  AlertTriangle,
  Info,
  Plus,
  Package,
  ArrowRight,
  ListOrdered,
  Box,
  FolderOpen,
  PieChart,
  CheckCircle,
  Zap,
  List,
  QrCode,
  ExternalLink,
  Clock,
  Folder,
  ChevronRight,
} from "lucide-react";

interface AssemblyIndex {
  id: string;
  name: { en: string; ar: string };
  category: string;
  stepCount?: number;
  estimatedTime?: number;
  model?: string;
  image?: string;
}

interface Category {
  id: string;
  name: string;
  nameAr: string;
}

interface DashboardStats {
  totalAssemblies: number;
  totalSteps: number;
  assembliesWithModels: number;
  assembliesWithImages: number;
  categoryCounts: Record<string, number>;
  recentAssemblies: AssemblyIndex[];
  assembliesNeedingAttention: AssemblyIndex[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isAssemblyModalOpen, setIsAssemblyModalOpen] = useState(false);
  const isProduction =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
    (typeof window !== "undefined" &&
      window.location.hostname.includes("vercel.app"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add cache-busting to prevent stale cached responses
        const cacheBuster = `_=${Date.now()}`;

        // Fetch assemblies index
        const assembliesRes = await fetch(`/api/assemblies?${cacheBuster}`, {
          cache: "no-store",
        });
        const assembliesData = await assembliesRes.json();
        // API returns array directly, not wrapped in object
        const assemblies: AssemblyIndex[] = Array.isArray(assembliesData)
          ? assembliesData
          : assembliesData.assemblies || [];

        // Fetch categories
        const categoriesRes = await fetch(`/api/categories?${cacheBuster}`, {
          cache: "no-store",
        });
        const categoriesData = await categoriesRes.json();
        // Categories API also returns array directly
        const categoriesList = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData.categories || [];
        setCategories(categoriesList);

        // Calculate stats
        const totalSteps = assemblies.reduce(
          (sum, c) => sum + (c.stepCount || 0),
          0,
        );
        const assembliesWithModels = assemblies.filter((c) => c.model).length;
        const assembliesWithImages = assemblies.filter((c) => c.image).length;

        // Count by category
        const categoryCounts: Record<string, number> = {};
        assemblies.forEach((c) => {
          categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
        });

        // Assemblies needing attention (no steps or no model)
        const assembliesNeedingAttention = assemblies.filter(
          (c) => !c.stepCount || c.stepCount === 0 || !c.model,
        );

        setStats({
          totalAssemblies: assemblies.length,
          totalSteps,
          assembliesWithModels,
          assembliesWithImages,
          categoryCounts,
          recentAssemblies: assemblies.slice(0, 5),
          assembliesNeedingAttention: assembliesNeedingAttention.slice(0, 5),
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setFetchError(
          "Failed to load dashboard data. Please try refreshing the page.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, loading]);

  if (isProduction) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="max-w-2xl mx-auto bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-2xl border border-amber-200 dark:border-amber-700/50 shadow-xl overflow-hidden">
            <div className="bg-warning px-6 py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-white w-8 h-8" />
                <h2 className="text-xl font-bold text-white">
                  Admin Panel Unavailable in Production
                </h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-charcoal dark:text-silver mb-6">
                The admin panel requires a writable filesystem and is only
                available when running locally.
              </p>
              <div className="bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-5 mb-6 border border-silver/50 dark:border-stone/20">
                <p className="text-sm font-medium text-charcoal dark:text-papyrus mb-3">
                  To use the admin panel:
                </p>
                <ol className="list-decimal list-inside text-sm text-stone dark:text-silver space-y-2">
                  <li>Clone the repository locally</li>
                  <li>
                    Run{" "}
                    <code className="bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded-lg font-mono text-xs">
                      npm install
                    </code>
                  </li>
                  <li>
                    Run{" "}
                    <code className="bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded-lg font-mono text-xs">
                      npm run dev
                    </code>
                  </li>
                  <li>
                    Access admin panel at{" "}
                    <code className="bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded-lg font-mono text-xs">
                      http://localhost:3001/admin
                    </code>
                  </li>
                </ol>
              </div>
              <div className="flex items-start gap-2 text-xs text-stone dark:text-silver">
                <Info className="w-4 h-4" />
                <p>
                  <strong>Note:</strong> For production content management,
                  consider migrating to a database-backed CMS (Vercel KV,
                  Postgres, or Sanity).
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleCreateAssembly = async (formData: AssemblyFormData) => {
    const token = localStorage.getItem("admin_token");
    const response = await fetch("/api/assemblies", {
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
        error.error || error.message || "Failed to create assembly",
      );
    }

    toast.success("Assembly created successfully");
    setIsAssemblyModalOpen(false);
    // Refresh dashboard data
    window.location.reload();
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <AuthGuard>
      <AdminLayout title="Dashboard">
        <div className="p-4 md:p-6 space-y-6">
          {/* Error Banner */}
          {fetchError && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {fetchError}
                </p>
                <button
                  onClick={() => {
                    setFetchError(null);
                    setIsLoading(true);
                    window.location.reload();
                  }}
                  className="ms-auto px-3 py-1 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-charcoal via-neutral-700 to-charcoal dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 rounded-2xl p-6 text-papyrus shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  Welcome to ML Assemble Admin Panel
                </h1>
                <p className="text-silver/80 text-sm">
                  Manage your assembly guides, 3D models, and animations
                </p>
              </div>
              <button
                onClick={() => setIsAssemblyModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-medium transition-all duration-200 text-white shadow-lg shadow-emerald-500/30"
              >
                <Plus className="w-5 h-5" />
                Add New Assembly
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl p-5 border border-silver/50 dark:border-stone/20 animate-pulse"
                >
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Assemblies */}
                <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl p-5 border border-silver/50 dark:border-stone/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone dark:text-silver">
                        Total Assemblies
                      </p>
                      <p className="text-3xl font-bold text-charcoal dark:text-papyrus mt-1">
                        {stats.totalAssemblies}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-sky-500/15 dark:bg-sky-400/15 flex items-center justify-center">
                      <Package className="text-sky-600 dark:text-sky-400 w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-silver/30 dark:border-stone/20">
                    <Link
                      href="/admin/assemblies"
                      className="text-xs text-stone dark:text-silver hover:text-charcoal dark:hover:text-papyrus hover:underline flex items-center gap-1"
                    >
                      View all assemblies
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Total Steps */}
                <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl p-5 border border-silver/50 dark:border-stone/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone dark:text-silver">
                        Total Steps
                      </p>
                      <p className="text-3xl font-bold text-charcoal dark:text-papyrus mt-1">
                        {stats.totalSteps}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-violet-500/15 dark:bg-violet-400/15 flex items-center justify-center">
                      <ListOrdered className="text-violet-600 dark:text-violet-400 w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-silver/30 dark:border-stone/20">
                    <p className="text-xs text-stone dark:text-silver">
                      ~
                      {Math.round(
                        stats.totalSteps / (stats.totalAssemblies || 1),
                      )}{" "}
                      steps per assembly
                    </p>
                  </div>
                </div>

                {/* 3D Models */}
                <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl p-5 border border-silver/50 dark:border-stone/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone dark:text-silver">
                        3D Models
                      </p>
                      <p className="text-3xl font-bold text-charcoal dark:text-papyrus mt-1">
                        {stats.assembliesWithModels}
                        <span className="text-lg text-pewter dark:text-stone">
                          /{stats.totalAssemblies}
                        </span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 dark:bg-emerald-400/15 flex items-center justify-center">
                      <Box className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-silver/30 dark:border-stone/20">
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                      <div
                        className="bg-emerald-500 dark:bg-emerald-400 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${(stats.assembliesWithModels / (stats.totalAssemblies || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl p-5 border border-silver/50 dark:border-stone/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone dark:text-silver">
                        Categories
                      </p>
                      <p className="text-3xl font-bold text-charcoal dark:text-papyrus mt-1">
                        {Object.keys(stats.categoryCounts).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 dark:bg-amber-400/15 flex items-center justify-center">
                      <FolderOpen className="text-amber-600 dark:text-amber-400 w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-silver/30 dark:border-stone/20">
                    <p className="text-xs text-stone dark:text-silver">
                      {categories.length} categories defined
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl border border-silver/50 dark:border-stone/20 shadow-lg overflow-hidden">
                  <div className="px-5 py-4 border-b border-silver/30 dark:border-stone/20">
                    <h2 className="text-sm font-semibold text-charcoal dark:text-papyrus flex items-center gap-2">
                      <PieChart className="text-sky-500 dark:text-sky-400 w-5 h-5" />
                      Assemblies by Category
                    </h2>
                  </div>
                  <div className="p-5 space-y-3">
                    {Object.entries(stats.categoryCounts).map(
                      ([categoryId, count]) => (
                        <div
                          key={categoryId}
                          className="flex items-center gap-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-charcoal dark:text-silver">
                                {getCategoryName(categoryId)}
                              </span>
                              <span className="text-sm text-stone dark:text-silver">
                                {count}
                              </span>
                            </div>
                            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                              <div
                                className="bg-sky-500 dark:bg-sky-400 h-2 rounded-full transition-all"
                                style={{
                                  width: `${(count / stats.totalAssemblies) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                    {Object.keys(stats.categoryCounts).length === 0 && (
                      <p className="text-sm text-stone dark:text-silver text-center py-4">
                        No assemblies added yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Needs Attention */}
                <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl border border-silver/50 dark:border-stone/20 shadow-lg overflow-hidden">
                  <div className="px-5 py-4 border-b border-silver/30 dark:border-stone/20">
                    <h2 className="text-sm font-semibold text-charcoal dark:text-papyrus flex items-center gap-2">
                      <AlertTriangle className="text-warning w-5 h-5" />
                      Needs Attention
                    </h2>
                  </div>
                  <div className="divide-y divide-silver/30 dark:divide-stone/20">
                    {stats.assembliesNeedingAttention.length > 0 ? (
                      stats.assembliesNeedingAttention.map((assembly) => (
                        <Link
                          key={assembly.id}
                          href={`/admin/assemblies/${assembly.id}/edit`}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            {!assembly.model ? (
                              <Box className="text-amber-600 dark:text-amber-400 w-5 h-5" />
                            ) : (
                              <ListOrdered className="text-amber-600 dark:text-amber-400 w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-charcoal dark:text-papyrus truncate">
                              {assembly.name.en}
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              {!assembly.model && "Missing 3D model"}
                              {!assembly.model &&
                                (!assembly.stepCount ||
                                  assembly.stepCount === 0) &&
                                " • "}
                              {(!assembly.stepCount ||
                                assembly.stepCount === 0) &&
                                "No steps"}
                            </p>
                          </div>
                          <ChevronRight className="text-silver w-5 h-5" />
                        </Link>
                      ))
                    ) : (
                      <div className="px-5 py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="text-green-600 dark:text-green-400 w-6 h-6" />
                        </div>
                        <p className="text-sm text-stone dark:text-silver">
                          All assemblies are complete!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl border border-silver/50 dark:border-stone/20 shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-silver/30 dark:border-stone/20">
                  <h2 className="text-sm font-semibold text-charcoal dark:text-papyrus flex items-center gap-2">
                    <Zap className="text-amber-500 dark:text-amber-400 w-5 h-5" />
                    Quick Actions
                  </h2>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => setIsAssemblyModalOpen(true)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 border border-silver/30 dark:border-stone/20 hover:shadow-md transition-all group w-full text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/15 dark:bg-emerald-400/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal dark:text-papyrus">
                        Add Assembly
                      </p>
                      <p className="text-xs text-stone dark:text-silver">
                        Create new assembly
                      </p>
                    </div>
                  </button>

                  <Link
                    href="/admin/assemblies"
                    className="flex items-center gap-3 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 border border-silver/30 dark:border-stone/20 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-sky-500/15 dark:bg-sky-400/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <List className="text-sky-600 dark:text-sky-400 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal dark:text-papyrus">
                        Manage Assemblies
                      </p>
                      <p className="text-xs text-stone dark:text-silver">
                        View all assemblies
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/admin/qr-codes"
                    className="flex items-center gap-3 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 border border-silver/30 dark:border-stone/20 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-violet-500/15 dark:bg-violet-400/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <QrCode className="text-violet-600 dark:text-violet-400 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal dark:text-papyrus">
                        QR Codes
                      </p>
                      <p className="text-xs text-stone dark:text-silver">
                        Generate QR codes
                      </p>
                    </div>
                  </Link>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 border border-silver/30 dark:border-stone/20 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-500/15 dark:bg-amber-400/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ExternalLink className="text-amber-600 dark:text-amber-400 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal dark:text-papyrus">
                        View Site
                      </p>
                      <p className="text-xs text-stone dark:text-silver">
                        Open public site
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Recent Assemblies */}
              <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl border border-silver/50 dark:border-stone/20 shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-silver/30 dark:border-stone/20 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-charcoal dark:text-papyrus flex items-center gap-2">
                    <Clock className="text-stone dark:text-silver w-5 h-5" />
                    Recent Assemblies
                  </h2>
                  <Link
                    href="/admin/assemblies"
                    className="text-xs text-stone dark:text-silver hover:text-charcoal dark:hover:text-papyrus hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-silver/30 dark:divide-stone/20">
                  {stats.recentAssemblies.map((assembly) => (
                    <Link
                      key={assembly.id}
                      href={`/admin/assemblies/${assembly.id}/steps`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                        {assembly.image ? (
                          <img
                            src={assembly.image}
                            alt={assembly.name.en}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="text-silver w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal dark:text-papyrus truncate">
                          {assembly.name.en}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-stone dark:text-silver flex items-center gap-1">
                            <Folder className="w-3 h-3" />
                            {getCategoryName(assembly.category)}
                          </span>
                          <span className="text-xs text-stone dark:text-silver flex items-center gap-1">
                            <ListOrdered className="w-3 h-3" />
                            {assembly.stepCount || 0} steps
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="text-silver w-5 h-5" />
                    </Link>
                  ))}
                  {stats.recentAssemblies.length === 0 && (
                    <div className="px-5 py-8 text-center">
                      <p className="text-sm text-stone dark:text-silver">
                        No assemblies yet.{" "}
                        <button
                          onClick={() => setIsAssemblyModalOpen(true)}
                          className="text-charcoal dark:text-papyrus hover:underline font-medium"
                        >
                          Add your first assembly
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-stone dark:text-silver">
                Failed to load dashboard data
              </p>
            </div>
          )}
        </div>

        {/* Assembly Form Modal */}
        <AssemblyFormModal
          isOpen={isAssemblyModalOpen}
          onClose={() => setIsAssemblyModalOpen(false)}
          onSubmit={handleCreateAssembly}
          categories={categories}
          mode="create"
        />
      </AdminLayout>
    </AuthGuard>
  );
}
