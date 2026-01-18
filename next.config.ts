import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

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
      // No marcar pdfjs-dist como external en el cliente para que Webpack lo empaquete
      config.externals = {
        ...config.externals,
      };

      // Corregir problemas de empaquetado de pdfjs-dist v4/v5
      // Aliaseamos a la versión .js para evitar problemas con .mjs en Next.js
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist': 'pdfjs-dist/build/pdf.js',
        'canvas': false,
      };

      // No procesar archivos .node binarios
      config.module.rules.push({
        test: /\.node$/,
        loader: 'null-loader',
      });

      // Manejar archivos .mjs de node_modules correctamente
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
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

// Configurar Bundle Analyzer (se activa con ANALYZE=true npm run build)
const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzerConfig(nextConfig);