/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Reduce file watching sensitivity to prevent frequent reloads
      config.watchOptions = {
        poll: 5000, // Check for changes every 5 seconds
        aggregateTimeout: 2000, // Wait 2 seconds before rebuilding
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

export default nextConfig;
