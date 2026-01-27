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
            {/* Header */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Generate QR codes for cabinet assembly guides. Users can scan
                these codes to access instructions directly on their mobile
                devices.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Loading cabinets...
                </p>
              </div>
            ) : (
              <>
                {/* Actions Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 flex items-center justify-between print:hidden">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleAll}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {selectedCabinets.size === cabinets.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedCabinets.size} of {cabinets.length} selected
                    </span>
                  </div>
                  <button
                    onClick={printSelected}
                    disabled={selectedCabinets.size === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-all ${
                          isSelected
                            ? "ring-2 ring-blue-500"
                            : "ring-1 ring-gray-200 dark:ring-gray-700"
                        } ${!isSelected ? "print:hidden" : ""}`}
                      >
                        {/* Selection Checkbox - Hidden in print */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 print:hidden">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCabinet(cabinet.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Include in print
                            </span>
                          </label>
                        </div>

                        {/* QR Code Display */}
                        <div className="p-6 text-center">
                          <div className="bg-white p-4 rounded-lg inline-block mb-4">
                            <QRCode
                              id={`qr-${cabinet.id}`}
                              value={url}
                              size={200}
                              level="H"
                              includeMargin={true}
                            />
                          </div>

                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {cabinet.name.en}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {cabinet.id}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all mb-4">
                            {url}
                          </p>

                          {/* Actions - Hidden in print */}
                          <div className="flex gap-2 print:hidden">
                            <button
                              onClick={() =>
                                downloadQRCode(cabinet.id, cabinet.name.en)
                              }
                              className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              Download PNG
                            </button>
                            <Link
                              href={`/cabinet/${cabinet.id}`}
                              target="_blank"
                              className="flex-1 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-center"
                            >
                              Test Link
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {cabinets.length === 0 && (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <span className="material-symbols-rounded text-4xl text-gray-400 mx-auto block">
                      qr_code
                    </span>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No cabinets yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Create cabinets to generate QR codes.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/admin/cabinets"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Go to Cabinets
                      </Link>
                    </div>
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
