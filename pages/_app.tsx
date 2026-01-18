import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { I18nProvider } from "@/lib/i18n";

function App({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider>
      <Component {...pageProps} />
    </I18nProvider>
  );
}

export default App;
