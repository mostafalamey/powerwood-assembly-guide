import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/router";
import en from "@/public/locales/en/common.json";
import ar from "@/public/locales/ar/common.json";

type Translations = typeof en;

interface I18nContextType {
  locale: string;
  t: (key: string) => string;
  changeLocale: (newLocale: string) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<string, Translations> = {
  en,
  ar,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    // Check localStorage for saved locale
    const savedLocale = localStorage.getItem("locale");
    if (savedLocale && (savedLocale === "en" || savedLocale === "ar")) {
      setLocale(savedLocale);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("ar")) {
        setLocale("ar");
      }
    }
  }, []);

  useEffect(() => {
    // Update document direction
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === "string" ? value : key;
  };

  const changeLocale = (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, t, changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return context;
}
