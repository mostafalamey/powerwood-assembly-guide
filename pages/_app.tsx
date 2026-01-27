import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/components/admin/ToastProvider";

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <ToastProvider>
            <Component {...pageProps} />
          </ToastProvider>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
