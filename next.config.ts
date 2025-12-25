import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/worker/:path*',
        destination: `${process.env.PDF_WORKER_URL}/:path*`,
      },
    ];
  },
};


export default nextConfig;
