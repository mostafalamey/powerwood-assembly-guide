import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface BrandingData {
  companyName: string;
  companyNameAr: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  favicon?: string;
}

interface BrandingContextType {
  branding: BrandingData;
  loading: boolean;
}

const defaultBranding: BrandingData = {
  companyName: "PW Assembly Guide",
  companyNameAr: "دليل التجميع",
  logo: "",
  primaryColor: "#3b82f6",
  secondaryColor: "#6366f1",
  favicon: "",
};

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  loading: true,
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingData>(defaultBranding);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch("/api/tenant/branding");
        if (response.ok) {
          const data = await response.json();
          setBranding(data);
          
          // Update CSS variables for colors
          if (typeof document !== "undefined") {
            document.documentElement.style.setProperty("--color-primary", data.primaryColor);
            document.documentElement.style.setProperty("--color-secondary", data.secondaryColor);
          }
        }
      } catch (error) {
        console.error("Error fetching branding:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}
