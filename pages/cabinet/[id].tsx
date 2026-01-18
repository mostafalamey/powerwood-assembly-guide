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
        ? (cabinet as any).nameAr
        : cabinet.name
      : locale === "ar"
      ? (cabinet.name as any).ar
      : (cabinet.name as any).en;

  const description =
    typeof cabinet.description === "string"
      ? locale === "ar"
        ? (cabinet as any).descriptionAr
        : cabinet.description
      : locale === "ar"
      ? (cabinet.description as any)?.ar
      : (cabinet.description as any)?.en;

  const tools =
    typeof (cabinet as any).requiredTools !== "undefined"
      ? locale === "ar"
        ? (cabinet as any).requiredToolsAr
        : (cabinet as any).requiredTools
      : (cabinet as any).tools
      ? locale === "ar"
        ? (cabinet as any).tools.ar
        : (cabinet as any).tools.en
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
                  <svg
                    className="w-24 h-24 mx-auto text-primary-300 mb-4"
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
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                    <svg
                      className="w-5 h-5 text-green-600"
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
                    <span className="text-sm font-medium text-green-900">
                      {t("cabinet.totalSteps")}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {cabinet.steps.length}{" "}
                    <span className="text-sm font-normal">
                      {t("cabinet.steps")}
                    </span>
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
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
                  cabinet.steps[0]?.id || "1"
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
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {t("cabinet.requiredTools")}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tools.map((tool: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
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
