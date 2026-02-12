import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";
import AuthGuard from "../../components/admin/AuthGuard";
import QRCode from "qrcode.react";
import {
  QrCode,
  CheckSquare,
  Printer,
  Check,
  Download,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import LoadingSpinner from "../../components/admin/LoadingSpinner";

interface Assembly {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  category: string;
  stepCount?: number;
  image?: string;
}

export default function QRCodesPage() {
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssemblies, setSelectedAssemblies] = useState<Set<string>>(
    new Set(),
  );
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // Set base URL from window location
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
    fetchAssemblies();
  }, []);

  const fetchAssemblies = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/assemblies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssemblies(data);
        // Select all by default
        setSelectedAssemblies(new Set(data.map((c: Assembly) => c.id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAssembly = (id: string) => {
    const newSelected = new Set(selectedAssemblies);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAssemblies(newSelected);
  };

  const toggleAll = () => {
    if (selectedAssemblies.size === assemblies.length) {
      setSelectedAssemblies(new Set());
    } else {
      setSelectedAssemblies(new Set(assemblies.map((c) => c.id)));
    }
  };

  const downloadQRCode = (assemblyId: string, assemblyName: string) => {
    const canvas = document.getElementById(
      `qr-${assemblyId}`,
    ) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `QR-${assemblyId}-${assemblyName.replace(/\s+/g, "-")}.png`;
      link.href = url;
      link.click();
    }
  };

  const printSelected = () => {
    window.print();
  };

  const selectedAssembliesList = assemblies.filter((c) =>
    selectedAssemblies.has(c.id),
  );

  return (
    <AuthGuard>
      <Head>
        <title>QR Codes - Admin Panel</title>
      </Head>

      {/* Print-only version */}
      <div className="hidden print:block">
        <div className="text-center py-6 border-b-2 border-gray-800 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PWAssemblyGuide</h1>
          <p className="text-sm text-gray-600 mt-2">Assembly Guide QR Codes</p>
        </div>

        {/* Print QR Codes Grid */}
        <div className="grid grid-cols-2 gap-8 px-8">
          {selectedAssembliesList.map((assembly) => {
            const url = `${baseUrl}/assembly/${assembly.id}`;
            return (
              <div
                key={assembly.id}
                className="border border-gray-800 rounded-lg p-6 text-center"
              >
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <QRCode
                    id={`qr-print-${assembly.id}`}
                    value={url}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                  {assembly.name.en}
                </h3>
                <p className="text-sm text-gray-600">{assembly.id}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen-only version */}
      <div className="print:hidden">
        <AdminLayout title="QR Codes">
          <div className="p-6">
            {/* Header Card */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    QR Code Generator
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Generate and print QR codes for assembly guides. Users can
                    scan these codes to access instructions directly on their
                    mobile devices.
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-12 text-center">
                <LoadingSpinner
                  size="lg"
                  message="Loading assemblies..."
                  centered
                />
              </div>
            ) : (
              <>
                {/* Actions Bar */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleAll}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      {selectedAssemblies.size === assemblies.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700/50">
                      <CheckSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedAssemblies.size} of {assemblies.length}{" "}
                        selected
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={printSelected}
                    disabled={selectedAssemblies.size === 0}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium
                      hover:from-blue-600 hover:to-indigo-700 
                      disabled:opacity-50 disabled:cursor-not-allowed 
                      shadow-lg shadow-blue-500/30 hover:shadow-xl
                      transition-all duration-200 flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Selected
                  </button>
                </div>

                {/* QR Codes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assemblies.map((assembly) => {
                    const url = `${baseUrl}/assembly/${assembly.id}`;
                    const isSelected = selectedAssemblies.has(assembly.id);

                    return (
                      <div
                        key={assembly.id}
                        className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300 ${
                          isSelected
                            ? "border-blue-500 dark:border-blue-400 shadow-xl shadow-blue-500/20"
                            : "border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50"
                        } ${!isSelected ? "print:hidden" : ""}`}
                      >
                        {/* Selection Checkbox - Hidden in print */}
                        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 print:hidden">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div
                              className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500"
                                  : "border-gray-300 dark:border-gray-600 group-hover:border-blue-400"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleAssembly(assembly.id)}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Include in print
                            </span>
                          </label>
                        </div>

                        {/* QR Code Display */}
                        <div className="p-6 text-center">
                          <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-inner">
                            <QRCode
                              id={`qr-${assembly.id}`}
                              value={url}
                              size={180}
                              level="H"
                              includeMargin={true}
                            />
                          </div>

                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                            {assembly.name.en}
                          </h3>
                          <span className="inline-block px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-mono text-gray-600 dark:text-gray-400 mb-3">
                            {assembly.id}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all px-2 mb-4">
                            {url}
                          </p>

                          {/* Actions - Hidden in print */}
                          <div className="flex gap-2 print:hidden">
                            <button
                              onClick={() =>
                                downloadQRCode(assembly.id, assembly.name.en)
                              }
                              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl
                                bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                                hover:bg-gray-200 dark:hover:bg-gray-600 
                                transition-colors flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              PNG
                            </button>
                            <Link
                              href={`/assembly/${assembly.id}`}
                              target="_blank"
                              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl
                                bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                                hover:bg-blue-100 dark:hover:bg-blue-900/50 
                                transition-colors flex items-center justify-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Test
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {assemblies.length === 0 && (
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mx-auto mb-4">
                      <QrCode className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      No assemblies yet
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      Create assemblies to generate QR codes.
                    </p>
                    <Link
                      href="/admin/assemblies"
                      className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 
                        bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium
                        hover:from-blue-600 hover:to-indigo-700 
                        shadow-lg shadow-blue-500/30 hover:shadow-xl
                        transition-all duration-200"
                    >
                      <ArrowRight className="w-5 h-5" />
                      Go to Assemblies
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Print Styles */}
          <style jsx global>{`
            @media print {
              body {
                background: white !important;
              }

              /* Simple approach - everything defaults to hidden except print layout */
              .print\\:hidden {
                display: none !important;
              }

              .print\\:block {
                display: block !important;
              }

              /* Ensure print grid displays properly */
              .grid.grid-cols-2 {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 2rem !important;
              }

              /* Clean borders and spacing */
              * {
                color: black !important;
              }
            }
          `}</style>
        </AdminLayout>
      </div>
    </AuthGuard>
  );
}
