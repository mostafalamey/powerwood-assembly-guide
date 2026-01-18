import { useTranslation } from "@/lib/i18n";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { getCabinetsByCategory } from "@/data/cabinets-loader";
import categoriesData from "@/data/categories.json";

export default function CategoryPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { category } = router.query;

  // Find category info
  const categoryInfo = categoriesData.categories.find(
    (cat) => cat.id === category
  );

  if (!categoryInfo) {
    return (
      <>
        <Head>
          <title>{`${t("errors.notFound")} - ${t("appTitle")}`}</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header showBackButton />
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t("errors.notFound")}
            </h1>
            <p className="text-gray-600 mb-6">
              {t("errors.notFoundDescription")}
            </p>
            <Link
              href="/"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              {t("errors.goHome")}
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Filter cabinets by category
  const cabinets = getCabinetsByCategory(category as string);

  const categoryName =
    locale === "ar" ? categoryInfo.nameAr : categoryInfo.name;
  const categoryDescription =
    locale === "ar" ? categoryInfo.descriptionAr : categoryInfo.description;

  return (
    <>
      <Head>
        <title>{`${categoryName} - ${t("appTitle")}`}</title>
        <meta name="description" content={categoryDescription} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header showBackButton />

        <main className="container mx-auto px-4 py-8">
          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {categoryName}
            </h1>
            <p className="text-xl text-gray-600">{categoryDescription}</p>
          </div>

          {/* Cabinets Grid */}
          {cabinets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cabinets.map((cabinet) => {
                const cabinetName =
                  typeof cabinet.name === "string"
                    ? locale === "ar"
                      ? (cabinet as any).nameAr
                      : cabinet.name
                    : locale === "ar"
                    ? cabinet.name.ar
                    : cabinet.name.en;
                const cabinetDesc =
                  typeof cabinet.description === "string"
                    ? locale === "ar"
                      ? (cabinet as any).descriptionAr
                      : cabinet.description
                    : locale === "ar"
                    ? cabinet.description?.ar
                    : cabinet.description?.en;

                return (
                  <Link
                    key={cabinet.id}
                    href={`/cabinet/${cabinet.id}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 hover:border-primary-400 group"
                  >
                    {/* Cabinet Image */}
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg h-48 flex items-center justify-center mb-4 group-hover:from-primary-100 group-hover:to-primary-200 transition-colors overflow-hidden relative">
                      {cabinet.image ? (
                        <Image
                          src={cabinet.image}
                          alt={cabinetName}
                          fill
                          className="object-contain p-4"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <svg
                          className="w-20 h-20 text-primary-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Cabinet Info */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {cabinetName}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {cabinetDesc}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            {cabinet.estimatedTime} {t("cabinet.minutes")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span>
                            {cabinet.stepCount || 0} {t("cabinet.steps")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg
                className="w-20 h-20 text-gray-300 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No cabinets in this category yet
              </h3>
              <p className="text-gray-600 mb-6">
                Cabinets for this category are coming soon.
              </p>
              <Link
                href="/"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
              >
                {t("errors.goHome")}
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
