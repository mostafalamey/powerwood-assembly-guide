import { useTranslation } from "@/lib/i18n";
import Head from "next/head";
import Link from "next/link";
import TransitionLink from "@/components/TransitionLink";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useBranding } from "@/contexts/BrandingContext";
import {
  Package,
  Home,
  Clock,
  ListOrdered,
  Wrench,
  Play,
  CheckSquare,
  ChevronRight,
} from "lucide-react";
import { Assembly } from "@/types/assembly";

export default function AssemblyPage() {
  const { t, locale } = useTranslation();
  const { branding } = useBranding();
  const router = useRouter();
  const { id } = router.query;
  const [assembly, setAssembly] = useState<Assembly | null>(null);
  const [loading, setLoading] = useState(true);

  const companyName =
    locale === "en" ? branding.companyName : branding.companyNameAr;

  useEffect(() => {
    if (!id) return;

    const fetchAssembly = async () => {
      try {
        const response = await fetch(
          `/api/assemblies?id=${id}&_=${Date.now()}`,
          {
            cache: "no-store",
          },
        );

        if (response.ok) {
          const data = await response.json();
          setAssembly(data);
        }
      } catch (error) {
        console.error("Error fetching assembly:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssembly();
  }, [id]);

  if (loading) {
    return (
      <>
        <Head>
          <title>{`${t("loading")} - ${companyName}`}</title>
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

  if (!assembly) {
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
              <Package className="w-16 h-16 text-silver dark:text-stone mb-4 mx-auto" />
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

  // Handle both old and new data formats
  const assemblyName =
    typeof assembly.name === "string"
      ? locale === "ar"
        ? (assembly as any).nameAr || assembly.name
        : assembly.name
      : locale === "ar"
        ? (assembly.name as any)?.ar || ""
        : (assembly.name as any)?.en || "";

  const description =
    typeof assembly.description === "string"
      ? locale === "ar"
        ? (assembly as any).descriptionAr || assembly.description
        : assembly.description
      : locale === "ar"
        ? (assembly.description as any)?.ar || ""
        : (assembly.description as any)?.en || "";

  const tools =
    typeof (assembly as any).requiredTools !== "undefined"
      ? locale === "ar"
        ? (assembly as any).requiredToolsAr || []
        : (assembly as any).requiredTools || []
      : (assembly as any).tools
        ? locale === "ar"
          ? (assembly as any).tools?.ar || []
          : (assembly as any).tools?.en || []
        : [];

  return (
    <>
      <Head>
        <title>{`${assemblyName} - ${companyName}`}</title>
        <meta name="description" content={description} />
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

        <main className="flex-1 overflow-y-auto md:overflow-hidden">
          <div className="h-full flex flex-col lg:flex-row p-4 md:p-6 gap-4 md:gap-6 max-w-7xl mx-auto">
            {/* Left Panel - Assembly Image & Quick Info */}
            <div className="lg:w-2/5 xl:w-1/3 flex-shrink-0">
              <div className="h-full bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-2xl shadow-xl border border-silver/50 dark:border-stone/20 overflow-hidden flex flex-col">
                {/* Assembly Image */}
                <div className="relative h-48 lg:h-64 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                  {assembly.image ? (
                    <Image
                      src={assembly.image}
                      alt={assemblyName}
                      fill
                      className="object-contain p-6"
                      priority
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-silver dark:text-stone" />
                  )}
                </div>

                {/* Assembly Info */}
                <div className="flex-1 p-4 md:p-5 flex flex-col">
                  <h1 className="text-xl md:text-2xl font-bold text-charcoal dark:text-papyrus mb-2">
                    {assemblyName}
                  </h1>
                  <p className="text-sm text-stone dark:text-silver mb-4 line-clamp-2 lg:line-clamp-none">
                    {description}
                  </p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-3 border border-silver/30 dark:border-stone/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock
                          className="w-4 h-4"
                          style={{ color: branding.primaryColor }}
                        />
                        <span
                          className="text-xs font-medium"
                          style={{ color: branding.primaryColor }}
                        >
                          {t("assembly.estimatedTime")}
                        </span>
                      </div>
                      <p
                        className="text-lg font-bold"
                        style={{ color: branding.primaryColor }}
                      >
                        {assembly.estimatedTime}{" "}
                        <span className="text-xs font-normal">
                          {t("assembly.minutes")}
                        </span>
                      </p>
                    </div>
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-3 border border-silver/30 dark:border-stone/20">
                      <div className="flex items-center gap-2 mb-1">
                        <ListOrdered
                          className="w-4 h-4"
                          style={{ color: branding.secondaryColor }}
                        />
                        <span
                          className="text-xs font-medium"
                          style={{ color: branding.secondaryColor }}
                        >
                          {t("assembly.totalSteps")}
                        </span>
                      </div>
                      <p
                        className="text-lg font-bold"
                        style={{ color: branding.secondaryColor }}
                      >
                        {assembly.steps?.length || 0}{" "}
                        <span className="text-xs font-normal">
                          {t("assembly.steps")}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Tools (if any) */}
                  {tools && tools.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-charcoal dark:text-silver mb-2 flex items-center gap-1">
                        <Wrench className="w-4 h-4 text-stone" />
                        {t("assembly.requiredTools")}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {tools
                          .slice(0, 4)
                          .map((tool: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-stone dark:text-silver text-xs rounded-lg border border-silver/50 dark:border-stone/30"
                            >
                              {tool}
                            </span>
                          ))}
                        {tools.length > 4 && (
                          <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 text-stone dark:text-silver text-xs rounded-lg">
                            +{tools.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Start Button */}
                  <div className="mt-auto">
                    <TransitionLink
                      href={`/assembly/${assembly.id}/step/${assembly.steps?.[0]?.id || "1"}`}
                      className="flex items-center justify-center gap-2 w-full text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl min-h-[48px]"
                      style={{
                        backgroundColor: branding.primaryColor,
                        boxShadow: `0 10px 15px -3px ${branding.primaryColor}40`,
                      }}
                    >
                      <Play className="w-5 h-5" />
                      {t("assembly.startAssembly")}
                    </TransitionLink>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Steps Overview */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-charcoal dark:text-papyrus flex items-center gap-2">
                  <CheckSquare className="w-6 h-6 text-stone" />
                  {t("assembly.assemblySteps") || "Assembly Steps"}
                </h2>
                <span className="text-xs text-stone dark:text-silver bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full">
                  {assembly.steps?.length || 0} {t("assembly.steps")}
                </span>
              </div>

              {/* Steps List */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid gap-2 pb-4">
                  {assembly.steps?.map((step: any, index: number) => {
                    const stepTitle =
                      typeof step.title === "string"
                        ? locale === "ar"
                          ? step.titleAr || step.title
                          : step.title
                        : locale === "ar"
                          ? step.title?.ar
                          : step.title?.en;

                    return (
                      <TransitionLink
                        key={step.id}
                        href={`/assembly/${assembly.id}/step/${step.id}`}
                        className="group flex items-center gap-4 p-3 md:p-4 bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl rounded-xl border border-silver/50 dark:border-stone/20 hover:shadow-lg transition-all hover:-translate-y-0.5"
                      >
                        {/* Step Number */}
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:bg-charcoal dark:group-hover:bg-papyrus transition-all">
                          <span className="text-sm font-bold text-charcoal dark:text-papyrus group-hover:text-papyrus dark:group-hover:text-charcoal transition-colors">
                            {index + 1}
                          </span>
                        </div>

                        {/* Step Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-charcoal dark:text-papyrus group-hover:text-stone dark:group-hover:text-silver transition-colors truncate">
                            {stepTitle}
                          </h3>
                          {step.duration && (
                            <p className="text-xs text-stone dark:text-silver flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {step.duration}
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-silver group-hover:text-stone transition-colors rtl:rotate-180" />
                      </TransitionLink>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
