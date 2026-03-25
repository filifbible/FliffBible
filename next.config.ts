import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  { key: 'X-Frame-Options',         value: 'DENY' },
  { key: 'X-XSS-Protection',        value: '1; mode=block' },
  { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  webpack(config) {
    // Permite importar arquivos de vídeo (.mp4, .webm, etc.)
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|ogv)$/i,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
