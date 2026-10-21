/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next-local',
  experimental: { cpus: 1 }
};

export default nextConfig;
