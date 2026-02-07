/**
 * Multi-tenant configuration types
 * Defines the structure for tenant-specific configuration
 */

export interface BilingualText {
  en: string;
  ar: string;
}

export interface BrandingConfig {
  appName: BilingualText;
  companyName: string;
  tagline: BilingualText;
  primaryColor: string;
  logoUrl: string;
}

export interface TerminologyConfig {
  itemSingular: BilingualText;
  itemPlural: BilingualText;
  urlSlug: string;
}

export interface FeaturesConfig {
  enableQRCodes: boolean;
  enableAudio: boolean;
  enableAnnotations: boolean;
  enableDarkMode: boolean;
}

export interface ContactConfig {
  email: string;
  website: string;
}

export interface TenantConfig {
  branding: BrandingConfig;
  terminology: TerminologyConfig;
  features: FeaturesConfig;
  contact: ContactConfig;
}
