import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
  primaryColor: "#323841",
  secondaryColor: "#77726E",
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
        // Add cache-busting to prevent stale cached responses
        const response = await fetch(`/api/tenant/branding/?_=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBranding(data);

          // Update CSS variables for colors
          if (typeof document !== "undefined") {
            document.documentElement.style.setProperty(
              "--color-primary",
              data.primaryColor,
            );
            document.documentElement.style.setProperty(
              "--color-secondary",
              data.secondaryColor,
            );
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
