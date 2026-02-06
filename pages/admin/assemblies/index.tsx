import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/admin/AdminLayout";
import AuthGuard from "../../../components/admin/AuthGuard";
import Image from "next/image";
import { useToast } from "../../../components/admin/ToastProvider";
import {
  Search,
  QrCode,
  Plus,
  AlertCircle,
  Image as ImageIcon,
  ListOrdered,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  List,
  Trash2,
  Package,
} from "lucide-react";

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
  const [assemblies, setCabinets] = useState<Assembly[]>([]);
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
    fetchAssemblys();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchAssemblys = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/assemblies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCabinets(data);
      } else {
        setError("Failed to fetch cabinets");
        toast.error("Failed to fetch assemblies.");
      }
    } catch (err) {
      setError("Error loading cabinets");
      toast.error("Error loading assemblies.");
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
      const response = await fetch(`/api/assemblies?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCabinets(assemblies.filter((c) => c.id !== id));
        toast.success(`Cabinet ${id} deleted.`);
      } else {
        toast.error("Failed to delete assembly.");
      }
    } catch (err) {
      toast.error("Error deleting assembly.");
      console.error(err);
    }
  };

  const handleEdit = (cabinet: Assembly) => {
    router.push(`/admin/cabinets/${assembly.id}/edit`);
    setActiveDropdown(null);
  };

  const handleManageSteps = (cabinet: Assembly) => {
    router.push(`/admin/cabinets/${assembly.id}/steps`);
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

  const filteredCabinets = assemblies.filter(
    (assembly) =>
      assembly.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assembly.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assembly.category.toLowerCase().includes(searchTerm.toLowerCase()),
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search assemblies..."
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
                <QrCode className="w-5 h-5" />
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
                <Plus className="w-5 h-5" />
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
                Loading assemblies...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Cabinets Grid */}
          {!loading && !error && (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredCabinets.length} of {assemblies.length} cabinets
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
                          <Package className="w-10 h-10 mx-auto mb-2" />
                          {searchTerm
                            ? "No cabinets match your search"
                            : "No cabinets yet"}
                        </td>
                      </tr>
                    ) : (
                      filteredCabinets.map((assembly) => (
                        <tr
                          key={assembly.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          {/* Thumbnail */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="w-14 h-14 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                              {assembly.image ? (
                                <Image
                                  src={assembly.image}
                                  alt={assembly.name.en}
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
                                <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {assembly.id}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {assembly.name.en}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg text-white bg-gradient-to-r ${getCategoryColor(assembly.category)} shadow-sm`}
                            >
                              {assembly.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <ListOrdered className="w-4 h-4" />
                              {assembly.stepCount !== undefined
                                ? assembly.stepCount
                                : assembly.steps?.length || 0}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              {assembly.estimatedTime}m
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={(e) => toggleDropdown(assembly.id, e)}
                              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
                                hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                              aria-label="Open actions menu"
                            >
                              <MoreVertical className="w-5 h-5" />
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
                    <Package className="w-10 h-10 mx-auto mb-2" />
                    {searchTerm
                      ? "No cabinets match your search"
                      : "No cabinets yet"}
                  </div>
                ) : (
                  filteredCabinets.map((assembly) => (
                    <div
                      key={assembly.id}
                      className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 
                        hover:shadow-lg hover:border-gray-300/50 dark:hover:border-gray-600/50 transition-all duration-300"
                    >
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 flex-shrink-0 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                          {assembly.image ? (
                            <Image
                              src={assembly.image}
                              alt={assembly.name.en}
                              width={64}
                              height={64}
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {assembly.name.en}
                              </h3>
                              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded inline-block">
                                {assembly.id}
                              </p>
                            </div>
                            <div className="relative flex-shrink-0">
                              <button
                                onClick={(e) => toggleDropdown(assembly.id, e)}
                                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
                                  hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                aria-label="Open actions menu"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>

                              {/* Dropdown Menu for Mobile Cards */}
                              {activeDropdown === assembly.id && (
                                <div
                                  className="absolute top-full right-0 mt-1 w-48 rounded-xl shadow-xl bg-white dark:bg-gray-800 z-50 
                                    border border-gray-200 dark:border-gray-700 overflow-hidden"
                                >
                                  <div className="py-1">
                                    <Link
                                      href={`/assembly/${assembly.id}`}
                                      target="_blank"
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View
                                    </Link>
                                    <button
                                      onClick={() => handleEdit(assembly)}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                      <Edit className="w-4 h-4" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleManageSteps(assembly)}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                      <List className="w-4 h-4" />
                                      Manage Steps
                                    </button>
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                                    <button
                                      onClick={() => handleDelete(assembly.id)}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-lg text-white bg-gradient-to-r ${getCategoryColor(assembly.category)} shadow-sm`}
                            >
                              {assembly.category}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <ListOrdered className="w-3.5 h-3.5" />
                              {assembly.stepCount !== undefined
                                ? assembly.stepCount
                                : assembly.steps?.length || 0}{" "}
                              steps
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3.5 h-3.5" />
                              {assembly.estimatedTime}m
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
                  href={`/assembly/${activeDropdown}`}
                  target="_blank"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <button
                  onClick={() => {
                    router.push(`/admin/cabinets/${activeDropdown}/edit`);
                    setActiveDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <Link
                  href={`/admin/cabinets/${activeDropdown}/steps`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <List className="w-4 h-4" />
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
                  <Trash2 className="w-4 h-4" />
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
