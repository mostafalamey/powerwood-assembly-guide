import Head from "next/head";
import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import { useTranslation } from "@/lib/i18n";
import { Home } from "lucide-react";

export default function Custom404() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{`404 - ${t("errors.notFound")} | ${t("appTitle")}`}</title>
        <meta name="description" content="Page not found" />
      </Head>

      <div className="min-h-screen w-full relative bg-white">
        {/* Full-screen background image */}
        <Image
          src="/images/404-robot.png"
          alt="404 - Page not found"
          fill
          className="object-cover object-left"
          priority
          unoptimized
        />

        {/* Content on the right side */}
        <div className="absolute inset-y-0 right-0 w-full sm:w-2/5 lg:w-1/3 flex flex-col items-center justify-center px-6 sm:px-4">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
            {t("errors.notFound") || "Page Not Found"}
          </h1>

          {/* Message */}
          <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-sm text-center">
            {t("errors.notFoundDescription") ||
              "The cabinet you're looking for doesn't exist or has been removed."}
          </p>

          {/* Go Home button */}
          <TransitionLink
            href="/"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
          >
            <Home className="w-[18px] h-[18px]" />
            {t("errors.goHome") || "Go Back Home"}
          </TransitionLink>
        </div>
      </div>
    </>
  );
}
