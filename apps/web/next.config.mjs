/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@0gfoundation/0g-storage-ts-sdk"]
  }
};

export default nextConfig;
