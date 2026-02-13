import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

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
        bg-neutral-100 dark:bg-neutral-800
        hover:bg-neutral-200 dark:hover:bg-neutral-700
        border border-silver/50 dark:border-stone/20
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
      <Sun
        className={`
          w-5 h-5 text-stone
          absolute transition-all duration-300
          ${
            theme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0"
          }
        `}
      />
      {/* Moon icon */}
      <Moon
        className={`
          w-5 h-5 text-silver
          absolute transition-all duration-300
          ${
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }
        `}
      />
    </button>
  );
}
