import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-12 h-12 rounded-full
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        border border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-out
        flex items-center justify-center
        shadow-sm hover:shadow-md
        ${className}
      `}
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
    >
      {/* Sun icon */}
      <span
        className={`
          material-symbols-rounded text-xl
          absolute transition-all duration-300
          ${
            theme === "light"
              ? "opacity-100 rotate-0 scale-100 text-amber-500"
              : "opacity-0 rotate-90 scale-0 text-amber-500"
          }
        `}
      >
        light_mode
      </span>
      {/* Moon icon */}
      <span
        className={`
          material-symbols-rounded text-xl
          absolute transition-all duration-300
          ${
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100 text-blue-400"
              : "opacity-0 -rotate-90 scale-0 text-blue-400"
          }
        `}
      >
        dark_mode
      </span>
    </button>
  );
}
