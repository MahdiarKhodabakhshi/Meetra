import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@meetra/shared'],
  turbopack: {
    // repo root (because apps/web is nested)
    root: path.join(__dirname, '../..'),
  },
};

export default nextConfig;
