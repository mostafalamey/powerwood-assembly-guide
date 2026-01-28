import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const isProduction =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
    (typeof window !== "undefined" &&
      window.location.hostname.includes("vercel.app"));

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Redirect to cabinets page
      router.push("/admin/cabinets");
    }
  }, [isAuthenticated, loading, router]);

  if (isProduction) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="max-w-2xl mx-auto bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
            <div className="flex gap-3">
              <span className="material-symbols-rounded text-yellow-600 dark:text-yellow-400 text-3xl">
                warning
              </span>
              <div>
                <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                  Admin Panel Unavailable in Production
                </h2>
                <p className="text-yellow-800 dark:text-yellow-200 mb-4">
                  The admin panel requires a writable filesystem and is only
                  available when running locally.
                </p>
                <div className="bg-white/50 dark:bg-black/20 rounded p-4 mb-4">
                  <p className="text-sm text-yellow-900 dark:text-yellow-100 font-mono">
                    To use the admin panel:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-yellow-800 dark:text-yellow-200 mt-2 space-y-1">
                    <li>Clone the repository locally</li>
                    <li>
                      Run{" "}
                      <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">
                        npm install
                      </code>
                    </li>
                    <li>
                      Run{" "}
                      <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">
                        npm run dev
                      </code>
                    </li>
                    <li>
                      Access admin panel at{" "}
                      <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">
                        http://localhost:3001/admin
                      </code>
                    </li>
                  </ol>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
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

  return null;
}
