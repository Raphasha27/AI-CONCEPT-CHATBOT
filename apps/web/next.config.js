/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["res.cloudinary.com", "supabase.co"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"],
    },
  },
};

module.exports = nextConfig;
