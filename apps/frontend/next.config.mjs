/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'lh3.googleusercontent.com',
      },
      {
        hostname: "**",
      }
    ]
  },
  output: 'standalone',
};

export default nextConfig;
