import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/admin/AdminLayout";
import AuthGuard from "../../components/admin/AuthGuard";

interface CabinetIndex {
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
  totalCabinets: number;
  totalSteps: number;
  cabinetsWithModels: number;
  cabinetsWithImages: number;
  categoryCounts: Record<string, number>;
  recentCabinets: CabinetIndex[];
  cabinetsNeedingAttention: CabinetIndex[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isProduction =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
    (typeof window !== "undefined" &&
      window.location.hostname.includes("vercel.app"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cabinets index
        const cabinetsRes = await fetch("/api/cabinets");
        const cabinetsData = await cabinetsRes.json();
        // API returns array directly, not wrapped in object
        const cabinets: CabinetIndex[] = Array.isArray(cabinetsData)
          ? cabinetsData
          : cabinetsData.cabinets || [];

        // Fetch categories
        const categoriesRes = await fetch("/api/categories");
        const categoriesData = await categoriesRes.json();
        // Categories API also returns array directly
        const categoriesList = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData.categories || [];
        setCategories(categoriesList);

        // Calculate stats
        const totalSteps = cabinets.reduce(
          (sum, c) => sum + (c.stepCount || 0),
          0,
        );
        const cabinetsWithModels = cabinets.filter((c) => c.model).length;
        const cabinetsWithImages = cabinets.filter((c) => c.image).length;

        // Count by category
        const categoryCounts: Record<string, number> = {};
        cabinets.forEach((c) => {
          categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
        });

        // Cabinets needing attention (no steps or no model)
        const cabinetsNeedingAttention = cabinets.filter(
          (c) => !c.stepCount || c.stepCount === 0 || !c.model,
        );

        setStats({
          totalCabinets: cabinets.length,
          totalSteps,
          cabinetsWithModels,
          cabinetsWithImages,
          categoryCounts,
          recentCabinets: cabinets.slice(0, 5),
          cabinetsNeedingAttention: cabinetsNeedingAttention.slice(0, 5),
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
          <div className="max-w-2xl mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-amber-200 dark:border-amber-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-rounded text-white text-3xl">
                  warning
                </span>
                <h2 className="text-xl font-bold text-white">
                  Admin Panel Unavailable in Production
                </h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                The admin panel requires a writable filesystem and is only
                available when running locally.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 mb-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  To use the admin panel:
                </p>
                <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Clone the repository locally</li>
                  <li>
                    Run{" "}
                    <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-lg font-mono text-xs">
                      npm install
                    </code>
                  </li>
                  <li>
                    Run{" "}
                    <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-lg font-mono text-xs">
                      npm run dev
                    </code>
                  </li>
                  <li>
                    Access admin panel at{" "}
                    <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-lg font-mono text-xs">
                      http://localhost:3001/admin
                    </code>
                  </li>
                </ol>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="material-symbols-rounded text-base">info</span>
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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <AuthGuard>
      <AdminLayout title="Dashboard">
        <div className="p-4 md:p-6 space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  Welcome to PW Assembly Admin
                </h1>
                <p className="text-blue-100 text-sm">
                  Manage your cabinet assembly guides, 3D models, and animations
                </p>
              </div>
              <Link
                href="/admin/cabinets/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-medium transition-all duration-200"
              >
                <span className="material-symbols-rounded text-lg">add</span>
                Add New Cabinet
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-5 border border-white/50 dark:border-gray-700/50 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Cabinets */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-5 border border-white/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-gray-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Cabinets
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {stats.totalCabinets}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <span className="material-symbols-rounded text-white text-2xl">
                        kitchen
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                    <Link
                      href="/admin/cabinets"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View all cabinets
                      <span className="material-symbols-rounded text-sm">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Total Steps */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-5 border border-white/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-gray-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Steps
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {stats.totalSteps}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <span className="material-symbols-rounded text-white text-2xl">
                        format_list_numbered
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ~
                      {Math.round(
                        stats.totalSteps / (stats.totalCabinets || 1),
                      )}{" "}
                      steps per cabinet
                    </p>
                  </div>
                </div>

                {/* 3D Models */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-5 border border-white/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-gray-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        3D Models
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {stats.cabinetsWithModels}
                        <span className="text-lg text-gray-400 dark:text-gray-500">
                          /{stats.totalCabinets}
                        </span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <span className="material-symbols-rounded text-white text-2xl">
                        view_in_ar
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-purple-600 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${(stats.cabinetsWithModels / (stats.totalCabinets || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-5 border border-white/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-gray-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Categories
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {Object.keys(stats.categoryCounts).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <span className="material-symbols-rounded text-white text-2xl">
                        category
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {categories.length} categories defined
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl border border-white/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-gray-900/30 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-rounded text-amber-500">
                        pie_chart
                      </span>
                      Cabinets by Category
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
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {getCategoryName(categoryId)}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {count}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${(count / stats.totalCabinets) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                    {Object.keys(stats.categoryCounts).length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No cabinets added yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Needs Attention */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl border border-white/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-gray-900/30 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-rounded text-amber-500">
                        warning
                      </span>
                      Needs Attention
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                    {stats.cabinetsNeedingAttention.length > 0 ? (
                      stats.cabinetsNeedingAttention.map((cabinet) => (
                        <Link
                          key={cabinet.id}
                          href={`/admin/cabinets/${cabinet.id}/edit`}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <span className="material-symbols-rounded text-amber-600 dark:text-amber-400">
                              {!cabinet.model
                                ? "view_in_ar"
                                : "format_list_numbered"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {cabinet.name.en}
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              {!cabinet.model && "Missing 3D model"}
                              {!cabinet.model &&
                                (!cabinet.stepCount ||
                                  cabinet.stepCount === 0) &&
                                " • "}
                              {(!cabinet.stepCount ||
                                cabinet.stepCount === 0) &&
                                "No steps"}
                            </p>
                          </div>
                          <span className="material-symbols-rounded text-gray-400">
                            chevron_right
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="px-5 py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                          <span className="material-symbols-rounded text-green-600 dark:text-green-400 text-2xl">
                            check_circle
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          All cabinets are complete!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl border border-white/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-gray-900/30 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-rounded text-blue-500">
                      bolt
                    </span>
                    Quick Actions
                  </h2>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Link
                    href="/admin/cabinets/new"
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/30 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-rounded text-white">
                        add
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Add Cabinet
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Create new cabinet
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/admin/cabinets"
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/30 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-rounded text-white">
                        list
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Manage Cabinets
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        View all cabinets
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/admin/qr-codes"
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200/50 dark:border-violet-700/30 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-rounded text-white">
                        qr_code
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        QR Codes
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Generate QR codes
                      </p>
                    </div>
                  </Link>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-rounded text-white">
                        open_in_new
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        View Site
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Open public site
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Recent Cabinets */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl border border-white/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-gray-900/30 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-rounded text-blue-500">
                      history
                    </span>
                    Recent Cabinets
                  </h2>
                  <Link
                    href="/admin/cabinets"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {stats.recentCabinets.map((cabinet) => (
                    <Link
                      key={cabinet.id}
                      href={`/admin/cabinets/${cabinet.id}/steps`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {cabinet.image ? (
                          <img
                            src={cabinet.image}
                            alt={cabinet.name.en}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-rounded text-gray-400">
                            kitchen
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {cabinet.name.en}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <span className="material-symbols-rounded text-xs">
                              folder
                            </span>
                            {getCategoryName(cabinet.category)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <span className="material-symbols-rounded text-xs">
                              format_list_numbered
                            </span>
                            {cabinet.stepCount || 0} steps
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-rounded text-gray-400">
                        chevron_right
                      </span>
                    </Link>
                  ))}
                  {stats.recentCabinets.length === 0 && (
                    <div className="px-5 py-8 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No cabinets yet.{" "}
                        <Link
                          href="/admin/cabinets/new"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Add your first cabinet
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Failed to load dashboard data
              </p>
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
