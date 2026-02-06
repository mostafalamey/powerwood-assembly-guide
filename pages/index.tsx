import { useTranslation } from "@/lib/i18n";
import Head from "next/head";
import TransitionLink from "@/components/TransitionLink";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";
import { useBranding } from "@/contexts/BrandingContext";
import {
  Box,
  ScanLine,
  Info,
  Languages,
  Volume2,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const { t, locale } = useTranslation();
  const { branding } = useBranding();

  // Category images mapping
  const categoryImages: Record<string, string> = {
    base: "/cabinets/button_baseUnits.png",
    wall: "/cabinets/button_wallUnits.png",
    high: "/cabinets/button_highUnits.png",
    tall: "/cabinets/button_tallUnits.png",
    cornerBase: "/cabinets/button_baseCornerUnits.png",
    cornerWall: "/cabinets/button_wallCornerUnits.png",
    fillers: "/cabinets/button_fillerUnits.png",
  };

  const categories = [
    "base",
    "wall",
    "high",
    "tall",
    "cornerBase",
    "cornerWall",
    "fillers",
  ];

  return (
    <>
      <Head>
        <title>
          {locale === "en" ? branding.companyName : branding.companyNameAr}
        </title>
        <meta name="description" content={t("appDescription")} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="icon" href={branding.favicon || "/favicon.svg"} />
        {branding.secondaryColor && (
          <meta name="theme-color" content={branding.secondaryColor} />
        )}
      </Head>

      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
        {/* Top Bar */}
        <header className="flex-shrink-0 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30">
          <div className="flex items-center gap-3">
            {branding.logo ? (
              <div
                className="w-16 h-14 rounded-xl overflow-hidden relative p-1.5"
                style={{ backgroundColor: branding.secondaryColor }}
              >
                <Image
                  src={branding.logo}
                  alt={
                    locale === "en"
                      ? branding.companyName
                      : branding.companyNameAr
                  }
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Box className="w-7 h-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                {locale === "en"
                  ? branding.companyName
                  : branding.companyNameAr}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {t("homeDescription")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto md:overflow-hidden">
          <div className="h-full flex flex-col md:flex-row p-3 md:p-6 gap-3 md:gap-6">
            {/* Left Panel - QR Scanner Card - Compact on mobile */}
            <div className="flex-shrink-0 md:w-80 lg:w-96">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-white/50 dark:border-gray-700/50 p-3 md:p-6 md:h-full flex flex-col">
                {/* Mobile: Horizontal compact layout */}
                <div className="flex md:flex-col items-center md:items-stretch gap-3 md:gap-0">
                  {/* QR Icon */}
                  <div className="relative w-12 h-12 md:w-20 md:h-20 flex-shrink-0 md:mx-auto md:mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl md:rounded-2xl opacity-20 animate-pulse" />
                    <div className="absolute inset-1 bg-white dark:bg-gray-800 rounded-lg md:rounded-xl flex items-center justify-center">
                      <ScanLine className="w-6 h-6 md:w-10 md:h-10 text-primary-500" />
                    </div>
                  </div>

                  <div className="flex-1 md:flex-none">
                    <h2 className="text-base md:text-xl font-bold text-gray-900 dark:text-white md:text-center md:mb-2">
                      {t("scanQRCode")}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 md:text-center md:mb-4 leading-relaxed hidden md:block">
                      {t("scanInstructions")}
                    </p>
                  </div>
                </div>

                {/* Info Badge - Hidden on mobile */}
                <div className="hidden md:block mt-auto bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                  <div className="flex items-start gap-3">
                    <Info className="w-[18px] h-[18px] text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      {t("qrCodeLocation")}
                    </p>
                  </div>
                </div>

                {/* Features - Hidden on mobile */}
                <div className="hidden md:grid mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid-cols-3 gap-2">
                  <div className="text-center p-2">
                    <Box className="w-[18px] h-[18px] text-primary-500 mb-1 mx-auto" />
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                      3D View
                    </span>
                  </div>
                  <div className="text-center p-2">
                    <Languages className="w-[18px] h-[18px] text-primary-500 mb-1 mx-auto" />
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                      Bilingual
                    </span>
                  </div>
                  <div className="text-center p-2">
                    <Volume2 className="w-[18px] h-[18px] text-primary-500 mb-1 mx-auto" />
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                      Audio
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Categories Grid - Takes priority on mobile */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <h2 className="text-base md:text-xl font-bold text-gray-900 dark:text-white">
                  {t("browseCategories")}
                </h2>
                <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 md:py-1 rounded-full">
                  {categories.length} categories
                </span>
              </div>

              {/* Categories Grid */}
              <div className="flex-1 overflow-y-auto md:overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 md:gap-3 pb-2 md:pb-0 md:h-full md:content-start">
                  {categories.map((category) => (
                    <TransitionLink
                      key={category}
                      href={`/categories/${category}`}
                      className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl md:rounded-xl shadow-lg shadow-gray-200/30 dark:shadow-gray-900/30 border border-white/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {/* Category Image */}
                      <div className="relative aspect-square md:aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-2 md:p-3">
                        <Image
                          src={categoryImages[category]}
                          alt={t(`categories.${category}`)}
                          fill
                          className="object-contain p-8 md:p-10 group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Category Label */}
                      <div className="p-2 bg-white/80 dark:bg-gray-800/80">
                        <h3 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                          {t(`categories.${category}`)}
                        </h3>
                      </div>

                      {/* Arrow indicator */}
                      <span className="absolute top-2 end-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/80 dark:bg-gray-700/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary-500 rtl:rotate-180" />
                      </span>
                    </TransitionLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 px-4 py-2 text-center border-t border-gray-200/50 dark:border-gray-800/50 bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm">
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            © 2026 PW Assembly Guide • Interactive 3D Cabinet Assembly
            Instructions
          </p>
        </footer>
      </div>
    </>
  );
}
