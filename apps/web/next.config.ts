import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    experimental: { globalNotFound: true },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
                port: '',
                pathname: '/9.x/**',
            },
        ],
    },
};

export default nextConfig;
