import React, { useState, useEffect } from "react";
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
  const router = useRouter();

  useEffect(() => {
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
    if (!confirm(`Are you sure you want to delete cabinet ${id}?`)) {
      return;
    }

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
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right + window.scrollX,
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

  return (
    <AuthGuard>
      <Head>
        <title>Cabinets - Admin Panel</title>
      </Head>
      <AdminLayout title="Cabinets">
        <div className="p-4 sm:p-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search cabinets..."
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                href="/admin/qr-codes"
                className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 inline-flex items-center gap-2 text-sm"
              >
                <span className="material-symbols-rounded text-lg sm:text-xl">
                  qr_code_scanner
                </span>
                <span className="hidden sm:inline">QR Codes</span>
              </Link>
              <button
                onClick={handleAddNew}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Loading cabinets...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Cabinets Table */}
          {!loading && !error && (
            <>
              <div className="mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredCabinets.length} of {cabinets.length} cabinets
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Thumbnail
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name (EN)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Steps
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Time (min)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCabinets.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          {searchTerm
                            ? "No cabinets match your search"
                            : "No cabinets yet"}
                        </td>
                      </tr>
                    ) : (
                      filteredCabinets.map((cabinet) => (
                        <tr
                          key={cabinet.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {/* Thumbnail (Desktop only) */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="w-16 h-16 relative bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                              {cabinet.image ? (
                                <Image
                                  src={cabinet.image}
                                  alt={cabinet.name.en}
                                  width={64}
                                  height={64}
                                  className="object-cover"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="material-symbols-rounded text-2xl text-gray-400">
                                  image
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {cabinet.id}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {cabinet.name.en}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {cabinet.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {cabinet.stepCount !== undefined
                              ? cabinet.stepCount
                              : cabinet.steps?.length || 0}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {cabinet.estimatedTime}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={(e) => toggleDropdown(cabinet.id, e)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none"
                              aria-label="Open actions menu"
                            >
                              <span className="material-symbols-rounded text-lg">
                                more_vert
                              </span>
                            </button>

                            {/* Dropdown Menu */}
                            {activeDropdown === cabinet.id &&
                              dropdownPosition && (
                                <div
                                  className="fixed w-48 rounded-md shadow-lg dark:shadow-2xl bg-white dark:bg-gray-700 z-50 border border-gray-200 dark:border-gray-600"
                                  style={{
                                    top: `${dropdownPosition.top}px`,
                                    right: `${dropdownPosition.right}px`,
                                  }}
                                >
                                  <div className="py-1">
                                    <Link
                                      href={`/cabinet/${cabinet.id}`}
                                      target="_blank"
                                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                      <span className="flex items-center">
                                        <span className="material-symbols-rounded text-base mr-2">
                                          visibility
                                        </span>
                                        View
                                      </span>
                                    </Link>
                                    <button
                                      onClick={() => handleEdit(cabinet)}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                      <span className="flex items-center">
                                        <span className="material-symbols-rounded text-base mr-2">
                                          edit
                                        </span>
                                        Edit
                                      </span>
                                    </button>
                                    <Link
                                      href={`/admin/cabinets/${cabinet.id}/steps`}
                                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                      <span className="flex items-center">
                                        <span className="material-symbols-rounded text-base mr-2">
                                          list_alt
                                        </span>
                                        Manage Steps
                                      </span>
                                    </Link>
                                    <button
                                      onClick={() => handleDelete(cabinet.id)}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                      <span className="flex items-center">
                                        <span className="material-symbols-rounded text-base mr-2">
                                          delete
                                        </span>
                                        Delete
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredCabinets.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? "No cabinets match your search"
                      : "No cabinets yet"}
                  </div>
                ) : (
                  filteredCabinets.map((cabinet) => (
                    <div
                      key={cabinet.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 flex-shrink-0 relative bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
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
                            <span className="material-symbols-rounded text-2xl text-gray-400">
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
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {cabinet.id}
                              </p>
                            </div>
                            <button
                              onClick={(e) => toggleDropdown(cabinet.id, e)}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none flex-shrink-0"
                              aria-label="Open actions menu"
                            >
                              <span className="material-symbols-rounded text-lg">
                                more_vert
                              </span>
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {cabinet.category}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {cabinet.stepCount !== undefined
                                ? cabinet.stepCount
                                : cabinet.steps?.length || 0}{" "}
                              steps
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {cabinet.estimatedTime} min
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Menu */}
                      {activeDropdown === cabinet.id && dropdownPosition && (
                        <div
                          className="fixed w-48 rounded-md shadow-lg dark:shadow-2xl bg-white dark:bg-gray-700 z-50 border border-gray-200 dark:border-gray-600"
                          style={{
                            top: `${dropdownPosition.top}px`,
                            right: `${dropdownPosition.right}px`,
                          }}
                        >
                          <div className="py-1">
                            <Link
                              href={`/cabinet/${cabinet.id}`}
                              target="_blank"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <span className="flex items-center">
                                <span className="material-symbols-rounded text-base mr-2">
                                  visibility
                                </span>
                                View
                              </span>
                            </Link>
                            <button
                              onClick={() => handleEdit(cabinet)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <span className="flex items-center">
                                <span className="material-symbols-rounded text-base mr-2">
                                  edit
                                </span>
                                Edit
                              </span>
                            </button>
                            <button
                              onClick={() => handleManageSteps(cabinet)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <span className="flex items-center">
                                <span className="material-symbols-rounded text-base mr-2">
                                  list_alt
                                </span>
                                Manage Steps
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(cabinet.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <span className="flex items-center">
                                <span className="material-symbols-rounded text-base mr-2">
                                  delete
                                </span>
                                Delete
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
