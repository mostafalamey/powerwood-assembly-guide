import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useRouter } from "next/router";
import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({
  children,
  title = "Admin Panel",
}: AdminLayoutProps) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Initialize from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      return saved === "true";
    }
    return false;
  });

  // Persist sidebar state and trigger window resize for 3D viewport
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_sidebar_collapsed", String(isSidebarCollapsed));
      // Trigger window resize event after transition completes
      const timeoutId = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 300); // Match the CSS transition duration
      return () => clearTimeout(timeoutId);
    }
  }, [isSidebarCollapsed]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex min-h-screen">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 h-screen z-50 lg:z-[60]
            w-64 ${isSidebarCollapsed ? "lg:w-24" : "lg:w-64"} border-r border-gray-200 dark:border-gray-800 
            bg-white/90 dark:bg-gray-900/80 backdrop-blur
            transform transition-[transform,width] duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="relative h-full flex flex-col">
            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex items-center justify-center absolute -right-3 top-4 w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-700 z-[80]"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={
                isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              <span className="material-symbols-rounded text-base leading-none">
                {isSidebarCollapsed ? "chevron_right" : "chevron_left"}
              </span>
            </button>
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <h1
                className={`text-lg font-bold text-gray-900 dark:text-white ${
                  isSidebarCollapsed ? "lg:hidden" : ""
                }`}
              >
                PW Assembly Guide
              </h1>
              <p
                className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                  isSidebarCollapsed ? "lg:hidden" : ""
                }`}
              >
                Admin Panel
              </p>
              {isSidebarCollapsed && (
                <div className="hidden lg:flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-200">
                  PW
                </div>
              )}
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              <Link
                href="/admin"
                title="Dashboard"
                className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium ${
                  isActive("/admin")
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                } ${
                  isSidebarCollapsed
                    ? "lg:justify-center lg:px-2 lg:py-2 lg:gap-0"
                    : ""
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span
                  className={`material-symbols-rounded ${
                    isSidebarCollapsed ? "text-xl" : "text-lg"
                  }`}
                >
                  dashboard
                </span>
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  Dashboard
                </span>
              </Link>
              <Link
                href="/admin/cabinets"
                title="Cabinets"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/admin/cabinets") ||
                  router.pathname.startsWith("/admin/cabinets")
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                } ${
                  isSidebarCollapsed
                    ? "lg:justify-center lg:px-2 lg:py-2 lg:gap-0"
                    : ""
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span
                  className={`material-symbols-rounded ${
                    isSidebarCollapsed ? "text-xl" : "text-lg"
                  }`}
                >
                  inventory_2
                </span>
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  Cabinets
                </span>
              </Link>
              <Link
                href="/admin/qr-codes"
                title="QR Codes"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/admin/qr-codes")
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                } ${
                  isSidebarCollapsed
                    ? "lg:justify-center lg:px-2 lg:py-2 lg:gap-0"
                    : ""
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span
                  className={`material-symbols-rounded ${
                    isSidebarCollapsed ? "text-xl" : "text-lg"
                  }`}
                >
                  qr_code_2
                </span>
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  QR Codes
                </span>
              </Link>
            </nav>

            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <Link
                href="/"
                target="_blank"
                title="View Site"
                className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md ${
                  isSidebarCollapsed
                    ? "lg:justify-center lg:px-2 lg:py-3 lg:gap-0"
                    : ""
                }`}
              >
                <span
                  className={`material-symbols-rounded ${
                    isSidebarCollapsed ? "text-xl" : "text-lg"
                  }`}
                >
                  open_in_new
                </span>
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  View Site
                </span>
              </Link>
              <button
                onClick={toggleTheme}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md ${
                  isSidebarCollapsed
                    ? "lg:justify-center lg:px-2 lg:py-3 lg:gap-0"
                    : ""
                }`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                <span
                  className={`material-symbols-rounded ${
                    isSidebarCollapsed ? "text-xl" : "text-lg"
                  }`}
                >
                  {theme === "light" ? "dark_mode" : "light_mode"}
                </span>
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  Theme
                </span>
              </button>
              <button
                onClick={handleLogout}
                className={`w-full px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                  isSidebarCollapsed ? "lg:px-2" : ""
                }`}
              >
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  Logout
                </span>
                <span
                  className={`material-symbols-rounded ${
                    isSidebarCollapsed ? "hidden lg:inline text-xl" : "hidden"
                  }`}
                >
                  logout
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
            <div className="px-4 sm:px-6 py-4 flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Open sidebar"
              >
                <span className="material-symbols-rounded text-2xl">menu</span>
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {title}
              </h2>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {children}
            </div>
          </main>

          <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80">
            <div className="px-4 sm:px-6 py-4">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                PWAssemblyGuide Admin Panel © {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
