import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // Configurar imágenes de Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  // Headers de seguridad + cache
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Existentes
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // ✅ FIX 7: NUEVOS - Security Headers
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: res.cloudinary.com; connect-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://*.clerk.accounts.dev; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
      // ✅ FIX 9: Cache para endpoints públicos (productos)
      {
        source: "/api/products",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=7200",
          },
        ],
      },
      // ✅ Cache para estáticos
      {
        source: "/(_next/static|public)/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ✅ No cachear endpoints privados/admin
      {
        source: "/api/(mis-solicitudes|perfil|solicitudes|admin)(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, must-revalidate, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;