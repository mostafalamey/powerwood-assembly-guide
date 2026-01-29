import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";
import AuthGuard from "../../components/admin/AuthGuard";
import QRCode from "qrcode.react";

interface Cabinet {
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
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCabinets, setSelectedCabinets] = useState<Set<string>>(
    new Set(),
  );
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // Set base URL from window location
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
    fetchCabinets();
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
        // Select all by default
        setSelectedCabinets(new Set(data.map((c: Cabinet) => c.id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCabinet = (id: string) => {
    const newSelected = new Set(selectedCabinets);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCabinets(newSelected);
  };

  const toggleAll = () => {
    if (selectedCabinets.size === cabinets.length) {
      setSelectedCabinets(new Set());
    } else {
      setSelectedCabinets(new Set(cabinets.map((c) => c.id)));
    }
  };

  const downloadQRCode = (cabinetId: string, cabinetName: string) => {
    const canvas = document.getElementById(
      `qr-${cabinetId}`,
    ) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `QR-${cabinetId}-${cabinetName.replace(/\s+/g, "-")}.png`;
      link.href = url;
      link.click();
    }
  };

  const printSelected = () => {
    window.print();
  };

  const selectedCabinetsList = cabinets.filter((c) =>
    selectedCabinets.has(c.id),
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
          {selectedCabinetsList.map((cabinet) => {
            const url = `${baseUrl}/cabinet/${cabinet.id}`;
            return (
              <div
                key={cabinet.id}
                className="border border-gray-800 rounded-lg p-6 text-center"
              >
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <QRCode
                    id={`qr-print-${cabinet.id}`}
                    value={url}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                  {cabinet.name.en}
                </h3>
                <p className="text-sm text-gray-600">{cabinet.id}</p>
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
                  <span className="material-symbols-rounded text-2xl text-white">
                    qr_code_2
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    QR Code Generator
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Generate and print QR codes for cabinet assembly guides.
                    Users can scan these codes to access instructions directly
                    on their mobile devices.
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-12 text-center">
                <svg
                  className="animate-spin h-10 w-10 mx-auto text-blue-600 dark:text-blue-400"
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
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading cabinets...
                </p>
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
                      {selectedCabinets.size === cabinets.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700/50">
                      <span className="material-symbols-rounded text-lg text-gray-500 dark:text-gray-400">
                        check_box
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedCabinets.size} of {cabinets.length} selected
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={printSelected}
                    disabled={selectedCabinets.size === 0}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium
                      hover:from-blue-600 hover:to-indigo-700 
                      disabled:opacity-50 disabled:cursor-not-allowed 
                      shadow-lg shadow-blue-500/30 hover:shadow-xl
                      transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="material-symbols-rounded text-lg">
                      print
                    </span>
                    Print Selected
                  </button>
                </div>

                {/* QR Codes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cabinets.map((cabinet) => {
                    const url = `${baseUrl}/cabinet/${cabinet.id}`;
                    const isSelected = selectedCabinets.has(cabinet.id);

                    return (
                      <div
                        key={cabinet.id}
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
                                <span className="material-symbols-rounded text-sm text-white">
                                  check
                                </span>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCabinet(cabinet.id)}
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
                              id={`qr-${cabinet.id}`}
                              value={url}
                              size={180}
                              level="H"
                              includeMargin={true}
                            />
                          </div>

                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                            {cabinet.name.en}
                          </h3>
                          <span className="inline-block px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-mono text-gray-600 dark:text-gray-400 mb-3">
                            {cabinet.id}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all px-2 mb-4">
                            {url}
                          </p>

                          {/* Actions - Hidden in print */}
                          <div className="flex gap-2 print:hidden">
                            <button
                              onClick={() =>
                                downloadQRCode(cabinet.id, cabinet.name.en)
                              }
                              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl
                                bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                                hover:bg-gray-200 dark:hover:bg-gray-600 
                                transition-colors flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-rounded text-lg">
                                download
                              </span>
                              PNG
                            </button>
                            <Link
                              href={`/cabinet/${cabinet.id}`}
                              target="_blank"
                              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl
                                bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                                hover:bg-blue-100 dark:hover:bg-blue-900/50 
                                transition-colors flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-rounded text-lg">
                                open_in_new
                              </span>
                              Test
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {cabinets.length === 0 && (
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-rounded text-3xl text-gray-400 dark:text-gray-500">
                        qr_code
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      No cabinets yet
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      Create cabinets to generate QR codes.
                    </p>
                    <Link
                      href="/admin/cabinets"
                      className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 
                        bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium
                        hover:from-blue-600 hover:to-indigo-700 
                        shadow-lg shadow-blue-500/30 hover:shadow-xl
                        transition-all duration-200"
                    >
                      <span className="material-symbols-rounded">
                        arrow_forward
                      </span>
                      Go to Cabinets
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
