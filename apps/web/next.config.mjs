/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@0glabs/0g-ts-sdk"]
  }
};

export default nextConfig;
