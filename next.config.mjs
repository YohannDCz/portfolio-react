/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    typedRoutes: true,
  },
  images: {
    // Configuration pour autoriser les images externes de Supabase
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ayrnxrqoheicolnsvtqf.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Autoriser tous les domaines en développement (à retirer en production si nécessaire)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
