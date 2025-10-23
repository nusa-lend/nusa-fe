import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        port: '',
        pathname: '**',
      },
    ],
  },
  allowedDevOrigins: ['https://localhost:3000', 'https://*.ngrok-free.app'],
};

export default nextConfig;
