import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <Component {...pageProps} />
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
