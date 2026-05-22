import path from 'path';
import type { NextConfig } from 'next';

const CORE_API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:9000';
const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL?.replace(/\/$/, '') || 'http://localhost:8002';

const nextConfig: NextConfig = {
  transpilePackages: ['@meetra/shared'],
  // standalone is for Docker/Cloud Run — Vercel manages its own output format
  output: process.env.VERCEL ? undefined : 'standalone',
  turbopack: {
    // repo root (because apps/web is nested)
    root: path.join(__dirname, '../..'),
  },
  async rewrites() {
    return [
      { source: '/proxy/auth/:path*', destination: `${AUTH_API}/v1/auth/:path*` },
      { source: '/proxy/api/:path*', destination: `${CORE_API}/v1/:path*` },
    ];
  },
};

export default nextConfig;
