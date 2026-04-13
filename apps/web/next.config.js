/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aws-exam-prep/types"],
  typedRoutes: true,
};

module.exports = nextConfig;
