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
      <svg
        className="w-5 h-5 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <span className="text-sm font-medium text-gray-700">
        {locale === "en" ? "العربية" : "English"}
      </span>
    </button>
  );
}
