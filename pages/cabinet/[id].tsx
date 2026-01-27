import { useTranslation } from "@/lib/i18n";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { getCabinet } from "@/data/cabinets-loader";

interface Cabinet {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  estimatedTime: number;
  image: string;
  model: string;
  description: string;
  descriptionAr: string;
  steps: any[];
  requiredTools: string[];
  requiredToolsAr: string[];
}

export default function CabinetPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const cabinet = id ? getCabinet(id as string) : null;

  if (!cabinet) {
    return (
      <>
        <Head>
          <title>{`${t("errors.notFound")} - ${t("appTitle")}`}</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          \n{" "}
          <div className="text-center">
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

  // Handle both old and new data formats
  const cabinetName =
    typeof cabinet.name === "string"
      ? locale === "ar"
        ? (cabinet as any).nameAr || cabinet.name
        : cabinet.name
      : locale === "ar"
        ? (cabinet.name as any)?.ar || ""
        : (cabinet.name as any)?.en || "";

  const description =
    typeof cabinet.description === "string"
      ? locale === "ar"
        ? (cabinet as any).descriptionAr || cabinet.description
        : cabinet.description
      : locale === "ar"
        ? (cabinet.description as any)?.ar || ""
        : (cabinet.description as any)?.en || "";

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

      <div className="min-h-screen bg-gray-50">
        <Header showBackButton />

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Cabinet Overview Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            {/* Cabinet Image */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 h-64 flex items-center justify-center relative overflow-hidden">
              {cabinet.image ? (
                <Image
                  src={cabinet.image}
                  alt={cabinetName}
                  fill
                  className="object-contain p-6"
                  priority
                  sizes="(max-width: 768px) 100vw, 896px"
                />
              ) : (
                <div className="text-center">
                  <span className="material-symbols-rounded text-6xl text-primary-300 mb-4 block">
                    inventory_2
                  </span>
                  <p className="text-sm text-primary-600">
                    {t("cabinet.overview")}
                  </p>
                </div>
              )}
            </div>

            {/* Cabinet Info */}
            <div className="p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {cabinetName}
              </h1>
              <p className="text-gray-600 mb-6">{description}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-rounded text-lg text-blue-600">
                      schedule
                    </span>
                    <span className="text-sm font-medium text-blue-900">
                      {t("cabinet.estimatedTime")}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {cabinet.estimatedTime}{" "}
                    <span className="text-sm font-normal">
                      {t("cabinet.minutes")}
                    </span>
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-rounded text-lg text-green-600">
                      format_list_numbered
                    </span>
                    <span className="text-sm font-medium text-green-900">
                      {t("cabinet.totalSteps")}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {cabinet.steps?.length || 0}{" "}
                    <span className="text-sm font-normal">
                      {t("cabinet.steps")}
                    </span>
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-rounded text-lg text-purple-600">
                      handyman
                    </span>
                    <span className="text-sm font-medium text-purple-900">
                      {t("cabinet.requiredTools")}
                    </span>
                  </div>
                  <ul className="text-sm text-purple-700 space-y-1">
                    {tools &&
                      tools
                        .slice(0, 2)
                        .map((tool: string, index: number) => (
                          <li key={index}>• {tool}</li>
                        ))}
                    {tools && tools.length > 2 && (
                      <li>• +{tools.length - 2} more</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Start Assembly Button */}
              <Link
                href={`/cabinet/${cabinet.id}/step/${
                  cabinet.steps?.[0]?.id || "1"
                }`}
                className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors text-center text-lg shadow-lg hover:shadow-xl"
              >
                {t("cabinet.startAssembly")}
              </Link>
            </div>
          </div>

          {/* Tools List (Full) */}
          {tools && tools.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-rounded text-xl text-purple-600">
                  handyman
                </span>
                {t("cabinet.requiredTools")}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tools.map((tool: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <span className="material-symbols-rounded text-lg text-green-500">
                      check_circle
                    </span>
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
