import { useTranslation } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, changeLocale } = useTranslation();

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    changeLocale(newLocale);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200/50 dark:border-gray-700/50 min-h-[44px]"
      aria-label="Switch language"
    >
      <span className="material-symbols-rounded text-lg text-gray-600 dark:text-gray-400">
        translate
      </span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {locale === "en" ? "العربية" : "EN"}
      </span>
    </button>
  );
}
