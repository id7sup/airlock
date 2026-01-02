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
  // Optimisations SEO
  compress: true,
  poweredByHeader: false,
  // Headers de sécurité et SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
