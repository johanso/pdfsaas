import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const workerUrl = process.env.PDF_WORKER_URL || 'http://145.223.126.240:3001';

    return [
      {
        source: '/api/worker/:path*',
        destination: `${workerUrl}/:path*`,
      },
    ];
  },
};



export default nextConfig;
