/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // Configure native modules to be external - only used on the server
  serverExternalPackages: ['canvas', 'pdfkit'],
  // Add webpack configuration to handle native modules
  webpack: (config, { isServer }) => {
    // We shouldn't need to bundle canvas in client-side code
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        'canvas/build/Release/canvas.node': false
      };
    }

    // Exclude the canvas.node file from processing
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader'
    });

    return config;
  },
  // Ensure the fonts directory is copied to the output directory
  output: 'standalone',
  // This copies fonts to the public directory during build
  async rewrites() {
    return [
      {
        source: '/fonts/:path*',
        destination: '/fonts/:path*',
      },
    ];
  },
}

// Export the config
module.exports = nextConfig; 