import { useTranslation } from "@/lib/i18n";
import Head from "next/head";
import Link from "next/link";
import TransitionLink from "@/components/TransitionLink";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import categoriesData from "@/data/categories.json";
import { Assembly } from "@/types/assembly";
import { useBranding } from "@/contexts/BrandingContext";
import { FolderOpen, Home, Package, Clock, ListOrdered } from "lucide-react";

export default function CategoryPage() {
  const { t, locale } = useTranslation();
  const { branding } = useBranding();
  const router = useRouter();
  const { category } = router.query;
  const [assemblies, setCabinets] = useState<Assembly[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch assemblys from API
  useEffect(() => {
    if (!category) return;

    const fetchAssemblys = async () => {
      try {
        const response = await fetch(`/api/assemblies?_=${Date.now()}`, {
          cache: "no-store",
        });

        if (response.ok) {
          const allCabinets = await response.json();
          // Filter by category and sort by ID
          const filtered = allCabinets
            .filter((cab: Assembly) => cab.category === category)
            .sort((a: Assembly, b: Assembly) => a.id.localeCompare(b.id));
          setCabinets(filtered);
        }
      } catch (error) {
        console.error("Error fetching cabinets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssemblys();
  }, [category]);

  // Find category info
  const categoryInfo = categoriesData.categories.find(
    (cat) => cat.id === category,
  );

  const companyName =
    locale === "en" ? branding.companyName : branding.companyNameAr;

  if (!categoryInfo) {
    return (
      <>
        <Head>
          <title>{`${t("errors.notFound")} - ${companyName}`}</title>
          <link rel="icon" href={branding.favicon || "/favicon.svg"} />
          {branding.primaryColor && (
            <meta name="theme-color" content={branding.primaryColor} />
          )}
        </Head>
        <div className="h-screen flex flex-col bg-papyrus dark:bg-neutral-900">
          <Header showBackButton />
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 text-silver dark:text-stone mb-4 mx-auto" />
              <h1 className="text-xl font-bold text-charcoal dark:text-papyrus mb-2">
                {t("errors.notFound")}
              </h1>
              <p className="text-stone dark:text-silver text-sm mb-6">
                {t("errors.notFoundDescription")}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-charcoal dark:bg-papyrus text-papyrus dark:text-charcoal px-5 py-2.5 rounded-xl hover:bg-neutral-800 dark:hover:bg-white transition-colors font-medium"
              >
                <Home className="w-5 h-5" />
                {t("errors.goHome")}
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const categoryName =
    locale === "ar" ? categoryInfo.nameAr : categoryInfo.name;
  const categoryDescription =
    locale === "ar" ? categoryInfo.descriptionAr : categoryInfo.description;

  if (loading) {
    return (
      <>
        <Head>
          <title>{`${categoryName} - ${companyName}`}</title>
          <link rel="icon" href={branding.favicon || "/favicon.svg"} />
          {branding.primaryColor && (
            <meta name="theme-color" content={branding.primaryColor} />
          )}
        </Head>
        <div className="h-screen flex flex-col bg-papyrus dark:bg-neutral-900">
          <Header showBackButton />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-charcoal dark:border-papyrus border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-stone dark:text-silver text-sm">
                {t("loading")}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${categoryName} - ${companyName}`}</title>
        <meta name="description" content={categoryDescription} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="icon" href={branding.favicon || "/favicon.svg"} />
        {branding.primaryColor && (
          <meta name="theme-color" content={branding.primaryColor} />
        )}
      </Head>

      <div className="h-screen flex flex-col overflow-hidden bg-papyrus dark:bg-neutral-900">
        <Header showBackButton />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            {/* Category Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-charcoal dark:text-papyrus mb-2">
                {categoryName}
              </h1>
              <p className="text-stone dark:text-silver">
                {categoryDescription}
              </p>
            </div>

            {/* Cabinets Grid */}
            {assemblies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {assemblies.map((assembly) => {
                  const cabinetName =
                    typeof assembly.name === "string"
                      ? locale === "ar"
                        ? (assembly as any).nameAr
                        : assembly.name
                      : locale === "ar"
                        ? assembly.name.ar
                        : assembly.name.en;
                  const cabinetDesc =
                    typeof assembly.description === "string"
                      ? locale === "ar"
                        ? (assembly as any).descriptionAr
                        : assembly.description
                      : locale === "ar"
                        ? assembly.description?.ar
                        : assembly.description?.en;

                  return (
                    <TransitionLink
                      key={assembly.id}
                      href={`/assembly/${assembly.id}`}
                      className="group bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl shadow-lg border border-silver/50 dark:border-stone/20 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                      {/* Cabinet Image */}
                      <div className="bg-neutral-100 dark:bg-neutral-800 h-40 flex items-center justify-center relative overflow-hidden group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                        {assembly.image ? (
                          <Image
                            src={assembly.image}
                            alt={cabinetName}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-silver dark:text-stone" />
                        )}
                      </div>

                      {/* Cabinet Info */}
                      <div className="p-4">
                        <h3
                          className="text-base font-semibold text-charcoal dark:text-papyrus mb-1 transition-colors truncate"
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
                          {cabinetName}
                        </h3>
                        <p className="text-stone dark:text-silver text-xs mb-3 line-clamp-2">
                          {cabinetDesc}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-stone dark:text-silver">
                          <div className="flex items-center gap-1">
                            <Clock
                              className="w-4 h-4"
                              style={{ color: branding.primaryColor }}
                            />
                            <span>
                              {assembly.estimatedTime} {t("assembly.minutes")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ListOrdered
                              className="w-4 h-4"
                              style={{ color: branding.secondaryColor }}
                            />
                            <span style={{ color: branding.secondaryColor }}>
                              {(assembly as any).stepCount || 0}{" "}
                              {t("assembly.steps")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TransitionLink>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-silver dark:text-stone mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-charcoal dark:text-papyrus mb-2">
                  No cabinets in this category yet
                </h3>
                <p className="text-stone dark:text-silver mb-6">
                  Cabinets for this category are coming soon.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-charcoal dark:bg-papyrus text-papyrus dark:text-charcoal px-5 py-2.5 rounded-xl hover:bg-neutral-800 dark:hover:bg-white transition-colors font-medium"
                >
                  <Home className="w-5 h-5" />
                  {t("errors.goHome")}
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
