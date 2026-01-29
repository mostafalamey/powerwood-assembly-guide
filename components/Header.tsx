import { useTranslation } from "@/lib/i18n";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  showBackButton?: boolean;
}

export default function Header({ showBackButton = false }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Link
                href="/"
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label="Go back"
              >
                <span className="material-symbols-rounded text-xl text-gray-600 dark:text-gray-400 rtl:rotate-180">
                  arrow_back
                </span>
              </Link>
            )}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20">
                <span className="material-symbols-rounded text-lg text-white">
                  view_in_ar
                </span>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
                {t("appTitle")}
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
