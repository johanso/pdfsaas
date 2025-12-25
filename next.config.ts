import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const workerUrl = process.env.PDF_WORKER_URL;

    if (!workerUrl) {
      throw new Error('PDF_WORKER_URL environment variable is not set');
    }

    return [
      {
        source: '/api/worker/:path*',
        destination: `${workerUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
