/**
 * Multi-tenant configuration loader
 * Provides access to tenant-specific configuration throughout the app
 */

import { TenantConfig } from "@/types/config";
import { useEffect, useState } from "react";

// Default configuration (fallback)
const DEFAULT_CONFIG: TenantConfig = {
  branding: {
    appName: { en: "Assembly Guide", ar: "دليل التجميع" },
    companyName: "Your Company",
    tagline: {
      en: "3D Assembly Instructions",
      ar: "تعليمات التجميع ثلاثية الأبعاد",
    },
    primaryColor: "#0ea5e9",
    logoUrl: "/images/logo.png",
  },
  terminology: {
    itemSingular: { en: "Assembly", ar: "تجميع" },
    itemPlural: { en: "Assemblies", ar: "تجميعات" },
    urlSlug: "assembly",
  },
  features: {
    enableQRCodes: true,
    enableAudio: true,
    enableAnnotations: true,
    enableDarkMode: true,
  },
  contact: {
    email: "support@example.com",
    website: "https://example.com",
  },
};

let cachedConfig: TenantConfig | null = null;

/**
 * Load tenant configuration from JSON file
 * Server-side or build-time usage
 */
export async function loadTenantConfig(): Promise<TenantConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    // In browser, fetch from public API
    if (typeof window !== "undefined") {
      const response = await fetch("/config/tenant.json");
      if (!response.ok) {
        console.warn("Failed to load tenant config, using defaults");
        return DEFAULT_CONFIG;
      }
      const data = await response.json();
      cachedConfig = data;
      return data as TenantConfig;
    }

    // Server-side: read from file system
    const fs = await import("fs/promises");
    const path = await import("path");
    const configPath = path.join(process.cwd(), "config", "tenant.json");
    const configData = await fs.readFile(configPath, "utf-8");
    const data = JSON.parse(configData);
    cachedConfig = data;
    return data as TenantConfig;
  } catch (error) {
    console.error("Error loading tenant config:", error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Get tenant configuration synchronously (cached)
 * Use after initial load
 */
export function getTenantConfig(): TenantConfig {
  return cachedConfig || DEFAULT_CONFIG;
}

/**
 * React hook for accessing tenant configuration
 * Loads config on mount and provides it to components
 */
export function useTenantConfig() {
  const [config, setConfig] = useState<TenantConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTenantConfig()
      .then((loadedConfig) => {
        setConfig(loadedConfig);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load tenant config:", error);
        setConfig(DEFAULT_CONFIG);
        setIsLoading(false);
      });
  }, []);

  return { config, isLoading };
}

/**
 * Helper to get terminology for current language
 */
export function getTerminology(config: TenantConfig, language: "en" | "ar") {
  return {
    itemSingular: config.terminology.itemSingular[language],
    itemPlural: config.terminology.itemPlural[language],
    urlSlug: config.terminology.urlSlug,
  };
}
