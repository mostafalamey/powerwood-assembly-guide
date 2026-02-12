import React from "react";

interface LoadingSpinnerProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional message to display below the spinner */
  message?: string;
  /** Whether to center in a container */
  centered?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export default function LoadingSpinner({
  size = "md",
  message,
  centered = false,
  className = "",
}: LoadingSpinnerProps) {
  const spinner = (
    <svg
      className={`animate-spin ${sizeMap[size]} text-blue-600 dark:text-blue-400 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        {spinner}
        {message && (
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
            {message}
          </p>
        )}
      </div>
    );
  }

  if (message) {
    return (
      <span className="inline-flex items-center gap-2">
        {spinner}
        <span className="text-sm">{message}</span>
      </span>
    );
  }

  return spinner;
}
