/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aws-exam-prep/types"],
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;
