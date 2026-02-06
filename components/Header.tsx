import { useTranslation } from "@/lib/i18n";
import { useBranding } from "@/contexts/BrandingContext";
import TransitionLink from "./TransitionLink";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import Image from "next/image";
import { ArrowLeft, Box } from "lucide-react";

interface HeaderProps {
  showBackButton?: boolean;
}

export default function Header({ showBackButton = false }: HeaderProps) {
  const { t, locale } = useTranslation();
  const { branding } = useBranding();

  const companyName = locale === "ar" ? branding.companyNameAr : branding.companyName;

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <TransitionLink
                href="/"
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 rtl:rotate-180" />
              </TransitionLink>
            )}
            <TransitionLink href="/" className="flex items-center gap-3">
              {branding.logo ? (
                <div className="relative w-9 h-9">
                  <Image
                    src={branding.logo}
                    alt={companyName}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20">
                  <Box className="w-5 h-5 text-white" />
                </div>
              )}
              <h1 className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
                {companyName}
              </h1>
            </TransitionLink>
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
