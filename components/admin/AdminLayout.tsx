import React, { useState } from "react";
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
            fixed lg:sticky top-0 h-screen z-50 lg:z-0
            w-64 border-r border-gray-200 dark:border-gray-800 
            bg-white/90 dark:bg-gray-900/80 backdrop-blur
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="h-full flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                PWAssemblyGuide
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Admin Panel
              </p>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/admin")
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/cabinets"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/admin/cabinets") ||
                  router.pathname.startsWith("/admin/cabinets")
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span>Cabinets</span>
              </Link>
              <Link
                href="/admin/qr-codes"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/admin/qr-codes")
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span>QR Codes</span>
              </Link>
            </nav>

            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                View Site
              </Link>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                )}
                <span>Theme</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
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
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
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
