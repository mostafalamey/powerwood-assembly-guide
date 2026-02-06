import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useRouter } from "next/router";
import Link from "next/link";
import TransitionLink from "../TransitionLink";
import { useToast } from "./ToastProvider";
import {
  Wrench,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Package,
  FolderOpen,
  QrCode,
  Palette,
  ExternalLink,
  Moon,
  Sun,
  LogOut,
  Menu,
} from "lucide-react";

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
  const toast = useToast();
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
      localStorage.setItem(
        "admin_sidebar_collapsed",
        String(isSidebarCollapsed),
      );
      // Trigger window resize event after transition completes
      const timeoutId = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 300); // Match the CSS transition duration
      return () => clearTimeout(timeoutId);
    }
  }, [isSidebarCollapsed]);

  const handleLogout = async () => {
    const confirmed = await toast.confirm({
      title: "Log Out",
      message: "Are you sure you want to log out?",
      confirmText: "Log Out",
      cancelText: "Cancel",
      type: "warning",
    });

    if (confirmed) {
      logout();
    }
  };

  const isActive = (path: string) => router.pathname === path;
  const isActivePrefix = (path: string) => router.pathname.startsWith(path);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
      <div className="flex h-full">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 h-full z-50 lg:z-[60]
            w-64 ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"}
            bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
            border-r border-white/50 dark:border-gray-700/50
            shadow-xl shadow-gray-200/30 dark:shadow-gray-900/50
            transform transition-[transform,width] duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="relative h-full flex flex-col">
            {/* Collapse toggle button */}
            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex items-center justify-center absolute -right-3 top-6 w-6 h-6 rounded-full 
                bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600
                text-gray-500 dark:text-gray-400 shadow-lg
                hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200
                transition-all duration-200 z-[80]"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={
                isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Logo section */}
            <div className="px-5 py-5 border-b border-gray-200/50 dark:border-gray-700/50">
              <div
                className={`flex items-center gap-3 ${isSidebarCollapsed ? "lg:justify-center" : ""}`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  <h1 className="text-sm font-bold text-gray-900 dark:text-white">
                    ML Assemble
                  </h1>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    Admin Panel
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <TransitionLink
                href="/admin"
                title="Dashboard"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive("/admin")
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-md"
                  } ${isSidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <LayoutDashboard
                  className={
                    isSidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
                  }
                />
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  Dashboard
                </span>
              </TransitionLink>

              <TransitionLink
                href="/admin/categories"
                title="Categories"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActivePrefix("/admin/categories")
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-md"
                  } ${isSidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <FolderOpen
                  className={
                    isSidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
                  }
                />
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  Categories
                </span>
              </TransitionLink>

              <TransitionLink
                href="/admin/assemblies"
                title="Assemblies"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActivePrefix("/admin/assemblies")
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-md"
                  } ${isSidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Package
                  className={
                    isSidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
                  }
                />
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  Assemblies
                </span>
              </TransitionLink>

              <TransitionLink
                href="/admin/qr-codes"
                title="QR Codes"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive("/admin/qr-codes")
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-md"
                  } ${isSidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <QrCode
                  className={
                    isSidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
                  }
                />
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  QR Codes
                </span>
              </TransitionLink>

              <TransitionLink
                href="/admin/branding"
                title="Branding"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive("/admin/branding")
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-md"
                  } ${isSidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Palette
                  className={
                    isSidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
                  }
                />
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  Branding
                </span>
              </TransitionLink>
            </nav>

            {/* Bottom actions */}
            <div className="px-3 py-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
              <Link
                href="/"
                target="_blank"
                title="View Site"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-md
                  transition-all duration-200
                  ${isSidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}
              >
                <ExternalLink
                  className={
                    isSidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
                  }
                />
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  View Site
                </span>
              </Link>

              <button
                onClick={toggleTheme}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-md
                  transition-all duration-200
                  ${isSidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon
                    className={
                      isSidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
                    }
                  />
                ) : (
                  <Sun
                    className={
                      isSidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
                    }
                  />
                )}
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-md
                  transition-all duration-200
                  ${isSidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}
              >
                <LogOut
                  className={
                    isSidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
                  }
                />
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>
                  Logout
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Header */}
          <header className="flex-shrink-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-b border-white/50 dark:border-gray-700/50 sticky top-0 z-30">
            <div className="px-4 sm:px-6 py-4 flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 
                  hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-md transition-all duration-200"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {title}
              </h2>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-white/50 dark:border-gray-700/50">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="flex-shrink-0 border-t border-white/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="px-4 sm:px-6 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PWAssemblyGuide Admin © {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
