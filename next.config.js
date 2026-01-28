/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for production builds
  // In dev mode, API routes work normally
  ...(process.env.NODE_ENV === "production" && { output: "export" }),
  reactStrictMode: true,
  // Note: Using manual i18n for static export compatibility
  images: {
    unoptimized: true, // Required for static export
  },
  // Optimize for production
  swcMinify: true,
  // Support for GLB/GLTF files
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: "asset/resource",
    });
    return config;
  },
  // Trailing slash for proper routing in static export
  trailingSlash: true,
};

module.exports = nextConfig;
