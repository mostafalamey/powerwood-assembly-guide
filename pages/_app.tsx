import "@/styles/globals.css";
import { useEffect } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { ToastProvider } from "@/components/admin/ToastProvider";

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Enable View Transitions API for client-side navigation
  useEffect(() => {
    // Check if View Transitions API is supported
    if (!("startViewTransition" in document)) {
      return;
    }

    const handleRouteChangeStart = () => {
      // Store a flag that we're transitioning
      (window as any).__isViewTransitioning = true;
    };

    const handleRouteChangeComplete = () => {
      (window as any).__isViewTransitioning = false;
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeComplete);
    };
  }, [router]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrandingProvider>
          <I18nProvider>
            <ToastProvider>
              <Component {...pageProps} />
            </ToastProvider>
          </I18nProvider>
        </BrandingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
