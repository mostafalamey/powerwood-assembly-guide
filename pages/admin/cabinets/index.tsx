import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/admin/AdminLayout";
import AuthGuard from "../../../components/admin/AuthGuard";
import Image from "next/image";
import { useToast } from "../../../components/admin/ToastProvider";

interface Cabinet {
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
  stepCount?: number;
  steps?: any[];
  model?: string;
  image?: string;
}

export default function CabinetsListPage() {
  const toast = useToast();
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    fetchCabinets();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchCabinets = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/cabinets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCabinets(data);
      } else {
        setError("Failed to fetch cabinets");
        toast.error("Failed to fetch cabinets.");
      }
    } catch (err) {
      setError("Error loading cabinets");
      toast.error("Error loading cabinets.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await toast.confirm({
      title: "Delete Cabinet",
      message: `Are you sure you want to delete cabinet ${id}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/cabinets?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCabinets(cabinets.filter((c) => c.id !== id));
        toast.success(`Cabinet ${id} deleted.`);
      } else {
        toast.error("Failed to delete cabinet.");
      }
    } catch (err) {
      toast.error("Error deleting cabinet.");
      console.error(err);
    }
  };

  const handleEdit = (cabinet: Cabinet) => {
    router.push(`/admin/cabinets/${cabinet.id}/edit`);
    setActiveDropdown(null);
  };

  const handleManageSteps = (cabinet: Cabinet) => {
    router.push(`/admin/cabinets/${cabinet.id}/steps`);
    setActiveDropdown(null);
  };

  const handleAddNew = () => {
    router.push("/admin/cabinets/new");
  };

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeDropdown === id) {
      setActiveDropdown(null);
      setDropdownPosition(null);
    } else {
      const button = e.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
      setActiveDropdown(id);
    }
  };

  const filteredCabinets = cabinets.filter(
    (cabinet) =>
      cabinet.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cabinet.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cabinet.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      base: "from-blue-500 to-blue-600",
      wall: "from-emerald-500 to-emerald-600",
      high: "from-purple-500 to-purple-600",
      tall: "from-amber-500 to-amber-600",
      "corner-base": "from-rose-500 to-rose-600",
      "corner-wall": "from-cyan-500 to-cyan-600",
      filler: "from-gray-500 to-gray-600",
    };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  return (
    <AuthGuard>
      <Head>
        <title>Cabinets - Admin Panel</title>
      </Head>
      <AdminLayout title="Cabinets">
        <div className="p-4 sm:p-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-400 dark:text-gray-500">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search cabinets..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 
                    bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    transition-all duration-200 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                href="/admin/qr-codes"
                className="px-4 py-2.5 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-purple-500 to-purple-600 text-white
                  hover:from-purple-600 hover:to-purple-700
                  shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40
                  transition-all duration-300 inline-flex items-center gap-2"
              >
                <span className="material-symbols-rounded text-lg">
                  qr_code_scanner
                </span>
                <span className="hidden sm:inline">QR Codes</span>
              </Link>
              <button
                onClick={handleAddNew}
                className="px-4 py-2.5 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                  hover:from-blue-600 hover:to-indigo-700
                  shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                  transition-all duration-300 inline-flex items-center gap-2"
              >
                <span className="material-symbols-rounded text-lg">add</span>
                Add Cabinet
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
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
                Loading cabinets...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-rounded text-red-500 dark:text-red-400">
                  error
                </span>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Cabinets Grid */}
          {!loading && !error && (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredCabinets.length} of {cabinets.length} cabinets
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-visible">
                <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Thumbnail
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Name (EN)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Steps
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50 overflow-visible">
                    {filteredCabinets.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          <span className="material-symbols-rounded text-4xl mb-2 block">
                            inventory_2
                          </span>
                          {searchTerm
                            ? "No cabinets match your search"
                            : "No cabinets yet"}
                        </td>
                      </tr>
                    ) : (
                      filteredCabinets.map((cabinet) => (
                        <tr
                          key={cabinet.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          {/* Thumbnail */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="w-14 h-14 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                              {cabinet.image ? (
                                <Image
                                  src={cabinet.image}
                                  alt={cabinet.name.en}
                                  width={56}
                                  height={56}
                                  className="object-cover"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="material-symbols-rounded text-2xl text-gray-400 dark:text-gray-500">
                                  image
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {cabinet.id}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {cabinet.name.en}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg text-white bg-gradient-to-r ${getCategoryColor(cabinet.category)} shadow-sm`}
                            >
                              {cabinet.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <span className="material-symbols-rounded text-base">
                                format_list_numbered
                              </span>
                              {cabinet.stepCount !== undefined
                                ? cabinet.stepCount
                                : cabinet.steps?.length || 0}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <span className="material-symbols-rounded text-base">
                                schedule
                              </span>
                              {cabinet.estimatedTime}m
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={(e) => toggleDropdown(cabinet.id, e)}
                              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
                                hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                              aria-label="Open actions menu"
                            >
                              <span className="material-symbols-rounded text-xl">
                                more_vert
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden grid gap-4">
                {filteredCabinets.length === 0 ? (
                  <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-rounded text-4xl mb-2 block">
                      inventory_2
                    </span>
                    {searchTerm
                      ? "No cabinets match your search"
                      : "No cabinets yet"}
                  </div>
                ) : (
                  filteredCabinets.map((cabinet) => (
                    <div
                      key={cabinet.id}
                      className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 
                        hover:shadow-lg hover:border-gray-300/50 dark:hover:border-gray-600/50 transition-all duration-300"
                    >
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 flex-shrink-0 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                          {cabinet.image ? (
                            <Image
                              src={cabinet.image}
                              alt={cabinet.name.en}
                              width={64}
                              height={64}
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <span className="material-symbols-rounded text-2xl text-gray-400 dark:text-gray-500">
                              image
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {cabinet.name.en}
                              </h3>
                              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded inline-block">
                                {cabinet.id}
                              </p>
                            </div>
                            <div className="relative flex-shrink-0">
                              <button
                                onClick={(e) => toggleDropdown(cabinet.id, e)}
                                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
                                  hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                aria-label="Open actions menu"
                              >
                                <span className="material-symbols-rounded text-xl">
                                  more_vert
                                </span>
                              </button>

                              {/* Dropdown Menu for Mobile Cards */}
                              {activeDropdown === cabinet.id && (
                                <div
                                  className="absolute top-full right-0 mt-1 w-48 rounded-xl shadow-xl bg-white dark:bg-gray-800 z-50 
                                    border border-gray-200 dark:border-gray-700 overflow-hidden"
                                >
                                  <div className="py-1">
                                    <Link
                                      href={`/cabinet/${cabinet.id}`}
                                      target="_blank"
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                      <span className="material-symbols-rounded text-lg">
                                        visibility
                                      </span>
                                      View
                                    </Link>
                                    <button
                                      onClick={() => handleEdit(cabinet)}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                      <span className="material-symbols-rounded text-lg">
                                        edit
                                      </span>
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleManageSteps(cabinet)}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                      <span className="material-symbols-rounded text-lg">
                                        list_alt
                                      </span>
                                      Manage Steps
                                    </button>
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                                    <button
                                      onClick={() => handleDelete(cabinet.id)}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                      <span className="material-symbols-rounded text-lg">
                                        delete
                                      </span>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-lg text-white bg-gradient-to-r ${getCategoryColor(cabinet.category)} shadow-sm`}
                            >
                              {cabinet.category}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <span className="material-symbols-rounded text-sm">
                                format_list_numbered
                              </span>
                              {cabinet.stepCount !== undefined
                                ? cabinet.stepCount
                                : cabinet.steps?.length || 0}{" "}
                              steps
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <span className="material-symbols-rounded text-sm">
                                schedule
                              </span>
                              {cabinet.estimatedTime}m
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Portal-rendered dropdown for desktop table view */}
        {isMounted &&
          activeDropdown &&
          dropdownPosition &&
          createPortal(
            <div
              className="fixed w-48 rounded-xl shadow-xl bg-white dark:bg-gray-800 z-[9999] 
              border border-gray-200 dark:border-gray-700 overflow-hidden hidden lg:block"
              style={{
                top: dropdownPosition.top,
                right: dropdownPosition.right,
              }}
            >
              <div className="py-1">
                <Link
                  href={`/cabinet/${activeDropdown}`}
                  target="_blank"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="material-symbols-rounded text-lg">
                    visibility
                  </span>
                  View
                </Link>
                <button
                  onClick={() => {
                    router.push(`/admin/cabinets/${activeDropdown}/edit`);
                    setActiveDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="material-symbols-rounded text-lg">edit</span>
                  Edit
                </button>
                <Link
                  href={`/admin/cabinets/${activeDropdown}/steps`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="material-symbols-rounded text-lg">
                    list_alt
                  </span>
                  Manage Steps
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                <button
                  onClick={() => {
                    handleDelete(activeDropdown);
                    setActiveDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <span className="material-symbols-rounded text-lg">
                    delete
                  </span>
                  Delete
                </button>
              </div>
            </div>,
            document.body,
          )}
      </AdminLayout>
    </AuthGuard>
  );
}
