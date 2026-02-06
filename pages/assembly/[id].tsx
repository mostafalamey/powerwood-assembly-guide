import { useTranslation } from "@/lib/i18n";
import Head from "next/head";
import Link from "next/link";
import TransitionLink from "@/components/TransitionLink";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
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

interface Cabinet {
  id: string;
  name: string | { en: string; ar: string };
  nameAr?: string;
  category: string;
  estimatedTime: number;
  image: string;
  model: string;
  description: string | { en: string; ar: string };
  descriptionAr?: string;
  steps: any[];
  requiredTools?: string[];
  requiredToolsAr?: string[];
}

export default function CabinetPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const [assembly, setCabinet] = useState<Assembly | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchAssembly = async () => {
      try {
        const response = await fetch(`/api/assemblies?id=${id}&_=${Date.now()}`, {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          setCabinet(data);
        }
      } catch (error) {
        console.error("Error fetching cabinet:", error);
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
          <title>{`${t("loading")} - ${t("appTitle")}`}</title>
        </Head>
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Header showBackButton />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
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
          <title>{`${t("errors.notFound")} - ${t("appTitle")}`}</title>
        </Head>
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Header showBackButton />
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4 mx-auto" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t("errors.notFound")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                {t("errors.notFoundDescription")}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors font-medium"
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
  const cabinetName =
    typeof assembly.name === "string"
      ? locale === "ar"
        ? (cabinet as any).nameAr || assembly.name
        : assembly.name
      : locale === "ar"
        ? (assembly.name as any)?.ar || ""
        : (assembly.name as any)?.en || "";

  const description =
    typeof assembly.description === "string"
      ? locale === "ar"
        ? (cabinet as any).descriptionAr || assembly.description
        : assembly.description
      : locale === "ar"
        ? (assembly.description as any)?.ar || ""
        : (assembly.description as any)?.en || "";

  const tools =
    typeof (cabinet as any).requiredTools !== "undefined"
      ? locale === "ar"
        ? (cabinet as any).requiredToolsAr || []
        : (cabinet as any).requiredTools || []
      : (cabinet as any).tools
        ? locale === "ar"
          ? (cabinet as any).tools?.ar || []
          : (cabinet as any).tools?.en || []
        : [];

  return (
    <>
      <Head>
        <title>{`${cabinetName} - ${t("appTitle")}`}</title>
        <meta name="description" content={description} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
        <Header showBackButton />

        <main className="flex-1 overflow-y-auto md:overflow-hidden">
          <div className="h-full flex flex-col lg:flex-row p-4 md:p-6 gap-4 md:gap-6 max-w-7xl mx-auto">
            {/* Left Panel - Cabinet Image & Quick Info */}
            <div className="lg:w-2/5 xl:w-1/3 flex-shrink-0">
              <div className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-white/50 dark:border-gray-700/50 overflow-hidden flex flex-col">
                {/* Cabinet Image */}
                <div className="relative h-48 lg:h-64 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-center overflow-hidden">
                  {assembly.image ? (
                    <Image
                      src={assembly.image}
                      alt={cabinetName}
                      fill
                      className="object-contain p-6"
                      priority
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-primary-300 dark:text-primary-700" />
                  )}
                </div>

                {/* Cabinet Info */}
                <div className="flex-1 p-4 md:p-5 flex flex-col">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {cabinetName}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 lg:line-clamp-none">
                    {description}
                  </p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                          {t("assembly.estimatedTime")}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {assembly.estimatedTime}{" "}
                        <span className="text-xs font-normal">
                          {t("assembly.minutes")}
                        </span>
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-100 dark:border-green-800/50">
                      <div className="flex items-center gap-2 mb-1">
                        <ListOrdered className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                          {t("assembly.totalSteps")}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
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
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                        <Wrench className="w-4 h-4 text-purple-500" />
                        {t("assembly.requiredTools")}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {tools
                          .slice(0, 4)
                          .map((tool: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-lg border border-purple-100 dark:border-purple-800/50"
                            >
                              {tool}
                            </span>
                          ))}
                        {tools.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-lg">
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
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 min-h-[48px]"
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-6 h-6 text-primary-500" />
                  {t("assembly.assemblySteps") || "Assembly Steps"}
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
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
                        className="group flex items-center gap-4 p-3 md:p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl border border-white/50 dark:border-gray-700/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all hover:-translate-y-0.5"
                      >
                        {/* Step Number */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center flex-shrink-0 group-hover:from-primary-500 group-hover:to-primary-600 transition-all">
                          <span className="text-sm font-bold text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors">
                            {index + 1}
                          </span>
                        </div>

                        {/* Step Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                            {stepTitle}
                          </h3>
                          {step.duration && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {step.duration}
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors rtl:rotate-180" />
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
