import { useTranslation } from "@/lib/i18n";
import Head from "next/head";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Image from "next/image";

export default function Home() {
  const { t } = useTranslation();

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

  return (
    <>
      <Head>
        <title>{`${t("appTitle")} - Assembly Guide`}</title>
        <meta name="description" content={t("appDescription")} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Language Switcher */}
          <div className="flex justify-end mb-8">
            <LanguageSwitcher />
          </div>

          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("welcome")}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("homeDescription")}
            </p>
          </header>

          {/* Quick Start Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-center mb-6">
                <svg
                  className="w-16 h-16 text-primary-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-center mb-4">
                {t("scanQRCode")}
              </h2>
              <p className="text-gray-600 text-center mb-6">
                {t("scanInstructions")}
              </p>
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-700">{t("qrCodeLocation")}</p>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              {t("browseCategories")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "base",
                "wall",
                "high",
                "tall",
                "cornerBase",
                "cornerWall",
                "fillers",
              ].map((category) => (
                <Link
                  key={category}
                  href={`/categories/${category}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 border border-gray-200 hover:border-primary-400 group overflow-hidden flex items-center gap-4"
                >
                  {/* Category Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                      src={categoryImages[category]}
                      alt={t(`categories.${category}`)}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>

                  {/* Category Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-1 text-gray-900 group-hover:text-primary-600 transition-colors">
                      {t(`categories.${category}`)}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {t(`categories.${category}Description`)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="max-w-6xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">
              {t("features")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("feature3D")}</h3>
                <p className="text-gray-600 text-sm">
                  {t("feature3DDescription")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t("featureMultilingual")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("featureMultilingualDescription")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t("featureAudio")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("featureAudioDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
