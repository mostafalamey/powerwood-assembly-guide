module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ar"],
    localeDetection: true,
  },
  react: {
    useSuspense: false,
  },
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
