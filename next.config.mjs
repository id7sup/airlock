/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration Turbopack (Next.js 16+)
  turbopack: {},
  // Configuration webpack (fallback si --webpack est utilisé)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclure canvas du bundling côté serveur (optionnel)
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'commonjs canvas',
      });
    }
    return config;
  },
};

export default nextConfig;

