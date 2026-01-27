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
      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
      aria-label="Switch language"
    >
      <span className="material-symbols-rounded text-xl text-gray-600">
        language
      </span>
      <span className="text-sm font-medium text-gray-700">
        {locale === "en" ? "العربية" : "English"}
      </span>
    </button>
  );
}
