import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "../../../../../components/admin/AdminLayout";
import AuthGuard from "../../../../../components/admin/AuthGuard";

export default function StepAuthoringPage() {
  const router = useRouter();
  const { id, step } = router.query;

  return (
    <AuthGuard>
      <Head>
        <title>Visual Step Editor - Admin Panel</title>
      </Head>
      <AdminLayout title="Visual Step Editor">
        <div className="p-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href={`/admin/cabinets/${id}/steps`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              ← Back to Steps
            </Link>
          </div>

          {/* Coming Soon Notice */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Visual 3D Step Editor
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                This advanced tool will allow you to create and edit 3D
                animations for assembly steps using an interactive visual
                interface.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                  Planned Features:
                </h3>
                <ul className="space-y-2 text-blue-800 dark:text-blue-300">
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Interactive 3D scene with GLB model loading</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Object selection from 3D model hierarchy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      Transform controls for positioning and rotating objects
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Timeline-based keyframe recording system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Camera position and movement recording</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      Real-time animation preview with playback controls
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Export animation data to JSON format</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
                <p className="text-yellow-800 dark:text-yellow-300">
                  <span className="font-semibold">Status:</span> Coming in Phase
                  6.4
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Link
                  href={`/admin/cabinets/${id}/steps`}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Steps
                </Link>
                {step && (
                  <Link
                    href={`/admin/cabinets/${id}/steps/${step}/edit`}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Step Details
                  </Link>
                )}
              </div>
            </div>

            {/* Temporary Workaround */}
            <div className="mt-8 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Current Workaround:
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                For now, you can create animations by manually editing the JSON
                files in the{" "}
                <code className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-sm">
                  /data/cabinets/
                </code>{" "}
                directory. See{" "}
                <Link
                  href="/docs/KEYFRAME_ANIMATION.md"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  KEYFRAME_ANIMATION.md
                </Link>{" "}
                for the animation data structure.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Example:{" "}
                <code className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">
                  /data/cabinets/BC-002.json
                </code>
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
