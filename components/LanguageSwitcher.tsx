import { useTranslation } from "@/lib/i18n";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, changeLocale } = useTranslation();

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    changeLocale(newLocale);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-charcoal/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all border border-silver/50 dark:border-stone/20 min-h-[44px]"
      aria-label="Switch language"
    >
      <Languages className="w-5 h-5 text-stone dark:text-silver" />
      <span className="text-sm font-medium text-charcoal dark:text-silver">
        {locale === "en" ? "العربية" : "EN"}
      </span>
    </button>
  );
}
