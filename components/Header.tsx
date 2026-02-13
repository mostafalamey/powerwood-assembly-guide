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

  const companyName =
    locale === "ar" ? branding.companyNameAr : branding.companyName;

  return (
    <header className="bg-papyrus/85 dark:bg-neutral-900/85 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-silver/50 dark:border-stone/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <TransitionLink
                href="/"
                className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-stone dark:text-silver rtl:rotate-180" />
              </TransitionLink>
            )}
            <TransitionLink href="/" className="flex items-center gap-3">
              {branding.logo ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden relative p-1.5 bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={branding.logo}
                    alt={companyName}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-16 h-14 rounded-xl bg-charcoal dark:bg-papyrus flex items-center justify-center shadow-md">
                  <Box className="w-7 h-7 text-papyrus dark:text-charcoal" />
                </div>
              )}
              <h1 className="text-2xl font-bold text-charcoal dark:text-papyrus hidden sm:block">
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
