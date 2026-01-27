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
                <span className="material-symbols-rounded text-6xl text-primary-500">
                  qr_code_scanner
                </span>
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
                  <span className="material-symbols-rounded text-3xl text-primary-600">
                    view_in_ar
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("feature3D")}</h3>
                <p className="text-gray-600 text-sm">
                  {t("feature3DDescription")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-rounded text-3xl text-primary-600">
                    language
                  </span>
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
                  <span className="material-symbols-rounded text-3xl text-primary-600">
                    volume_up
                  </span>
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
