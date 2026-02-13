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

      <div className="h-screen flex flex-col overflow-hidden bg-papyrus dark:bg-neutral-900">
        {/* Top Bar */}
        <header className="flex-shrink-0 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between border-b border-silver/50 dark:border-stone/20 backdrop-blur-sm bg-papyrus/85 dark:bg-neutral-900/85">
          <div className="flex items-center gap-3">
            {branding.logo ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden relative p-1.5 bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={branding.logo}
                  alt={
                    locale === "en"
                      ? branding.companyName
                      : branding.companyNameAr
                  }
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-charcoal dark:bg-papyrus flex items-center justify-center shadow-lg">
                <Box className="w-7 h-7 text-papyrus dark:text-charcoal" />
              </div>
            )}
            <div>
              <h1 className="text-lg md:text-xl font-bold text-charcoal dark:text-papyrus leading-tight">
                {locale === "en"
                  ? branding.companyName
                  : branding.companyNameAr}
              </h1>
              <p className="text-xs text-stone dark:text-silver hidden sm:block">
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
              <div className="bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-lg border border-silver/50 dark:border-stone/20 p-3 md:p-6 md:h-full flex flex-col">
                {/* Mobile: Horizontal compact layout */}
                <div className="flex md:flex-col items-center md:items-stretch gap-3 md:gap-0">
                  {/* QR Icon */}
                  <div className="relative w-12 h-12 md:w-20 md:h-20 flex-shrink-0 md:mx-auto md:mb-4">
                    <div
                      className="absolute inset-0 rounded-xl md:rounded-2xl opacity-20 animate-pulse"
                      style={{
                        background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.primaryColor})`,
                      }}
                    />
                    <div className="absolute inset-1 bg-white dark:bg-neutral-800 rounded-lg md:rounded-xl flex items-center justify-center">
                      <ScanLine
                        className="w-6 h-6 md:w-10 md:h-10"
                        style={{ color: branding.primaryColor }}
                      />
                    </div>
                  </div>

                  <div className="flex-1 md:flex-none">
                    <h2 className="text-base md:text-xl font-bold text-charcoal dark:text-papyrus md:text-center md:mb-2">
                      {t("scanQRCode")}
                    </h2>
                    <p className="text-xs md:text-sm text-stone dark:text-silver md:text-center md:mb-4 leading-relaxed hidden md:block">
                      {t("scanInstructions")}
                    </p>
                  </div>
                </div>

                {/* Info Badge - Hidden on mobile */}
                <div
                  className="hidden md:block mt-auto rounded-xl p-4 border"
                  style={{
                    background: `linear-gradient(to right, ${branding.primaryColor}15, ${branding.primaryColor}20)`,
                    borderColor: `${branding.primaryColor}40`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Info
                      className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
                      style={{ color: branding.primaryColor }}
                    />
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: branding.primaryColor }}
                    >
                      {t("qrCodeLocation")}
                    </p>
                  </div>
                </div>

                {/* Features - Hidden on mobile */}
                <div className="hidden md:grid mt-4 pt-4 border-t border-silver/50 dark:border-stone/20 grid-cols-3 gap-2">
                  <div className="text-center p-2">
                    <Box
                      className="w-[18px] h-[18px] mb-1 mx-auto"
                      style={{ color: branding.primaryColor }}
                    />
                    <span className="text-[10px] text-stone dark:text-silver font-medium">
                      3D View
                    </span>
                  </div>
                  <div className="text-center p-2">
                    <Languages
                      className="w-[18px] h-[18px] mb-1 mx-auto"
                      style={{ color: branding.primaryColor }}
                    />
                    <span className="text-[10px] text-stone dark:text-silver font-medium">
                      Bilingual
                    </span>
                  </div>
                  <div className="text-center p-2">
                    <Volume2
                      className="w-[18px] h-[18px] mb-1 mx-auto"
                      style={{ color: branding.primaryColor }}
                    />
                    <span className="text-[10px] text-stone dark:text-silver font-medium">
                      Audio
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Categories Grid - Takes priority on mobile */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <h2 className="text-base md:text-xl font-bold text-charcoal dark:text-papyrus">
                  {t("browseCategories")}
                </h2>
                <span className="text-[10px] md:text-xs text-stone dark:text-silver bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 md:py-1 rounded-full">
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
                      className="group relative bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl md:rounded-xl shadow-lg border border-silver/50 dark:border-stone/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {/* Category Image */}
                      <div className="relative aspect-square md:aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 p-2 md:p-3">
                        <Image
                          src={categoryImages[category]}
                          alt={t(`categories.${category}`)}
                          fill
                          className="object-contain p-8 md:p-10 group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Category Label */}
                      <div className="p-2 bg-white/80 dark:bg-charcoal/80">
                        <h3
                          className="text-xs md:text-sm font-semibold text-charcoal dark:text-papyrus transition-colors truncate"
                          style={{
                            ["--hover-color" as any]: branding.primaryColor,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color =
                              branding.primaryColor)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "")
                          }
                        >
                          {t(`categories.${category}`)}
                        </h3>
                      </div>

                      {/* Arrow indicator */}
                      <span className="absolute top-2 end-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/80 dark:bg-neutral-800/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight
                          className="w-3 h-3 md:w-3.5 md:h-3.5 rtl:rotate-180"
                          style={{ color: branding.secondaryColor }}
                        />
                      </span>
                    </TransitionLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 px-4 py-2 text-center border-t border-silver/50 dark:border-stone/20 bg-papyrus/50 dark:bg-neutral-900/50 backdrop-blur-sm">
          <p className="text-[10px] text-pewter dark:text-stone">
            © 2026 PW Assembly Guide • Interactive 3D Cabinet Assembly
            Instructions
          </p>
        </footer>
      </div>
    </>
  );
}
