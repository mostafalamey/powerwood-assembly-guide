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
    (cat) => cat.id === category,
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
                        <span className="material-symbols-rounded text-5xl text-primary-300">
                          inventory_2
                        </span>
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
                          <span className="material-symbols-rounded text-base">
                            schedule
                          </span>
                          <span>
                            {cabinet.estimatedTime} {t("cabinet.minutes")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-rounded text-base">
                            format_list_numbered
                          </span>
                          <span>
                            {(cabinet as any).stepCount || 0}{" "}
                            {t("cabinet.steps")}
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
              <span className="material-symbols-rounded text-5xl text-gray-300 mx-auto mb-4 block">
                inventory_2
              </span>
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
