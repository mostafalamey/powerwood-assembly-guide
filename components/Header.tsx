import { useTranslation } from "@/lib/i18n";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

interface HeaderProps {
  showBackButton?: boolean;
}

export default function Header({ showBackButton = false }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <span className="material-symbols-rounded text-2xl text-gray-600">
                  arrow_back
                </span>
              </Link>
            )}
            <Link href="/">
              <h1 className="text-xl md:text-2xl font-bold text-primary-600">
                {t("appTitle")}
              </h1>
            </Link>
          </div>

          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
