import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Excluir canvas del bundle del cliente (es un módulo solo para servidor)
  serverExternalPackages: ['canvas', 'pdfjs-dist'],
  
  // Aumentar límite de body para archivos grandes
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },

  // Configurar webpack para excluir canvas y pdfjs-dist del bundle del cliente
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Marcar pdfjs-dist como external para que se cargue desde node_modules en runtime
      config.externals = {
        ...config.externals,
        'pdfjs-dist': 'pdfjs-dist',
      };
      
      // Ignorar archivos .node
      config.resolve.alias = {
        ...config.resolve.alias,
        'canvas': false,
      };
      
      // No procesar archivos .node binarios
      config.module.rules.push({
        test: /\.node$/,
        loader: 'null-loader',
      });
    }
    return config;
  },

  async rewrites() {
    const workerUrl = process.env.PDF_WORKER_URL || process.env.NEXT_PUBLIC_PDF_WORKER_URL;

    if (!workerUrl) {
      console.warn('Warning: PDF_WORKER_URL or NEXT_PUBLIC_PDF_WORKER_URL not set. Rewrites to /api/worker will not work.');
      return [];
    }

    // Si workerUrl termina en /api, quitarlo para que el rewrite sea correcto
    const baseWorkerUrl = workerUrl.endsWith('/api')
      ? workerUrl.replace(/\/api$/, '')
      : workerUrl;

    return [
      {
        source: '/api/worker/:path*',
        destination: `${baseWorkerUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;