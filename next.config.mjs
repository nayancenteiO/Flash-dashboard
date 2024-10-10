/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd3nlwxcs0dl0nc.cloudfront.net',
      },
    ],
  },
};

export default nextConfig;