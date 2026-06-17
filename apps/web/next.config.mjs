import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(appDir, "../..");

for (const dir of [repoRoot, appDir]) {
  dotenv.config({ path: path.join(dir, ".env.local") });
  dotenv.config({ path: path.join(dir, ".env") });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@0gfoundation/0g-storage-ts-sdk"]
  },
  webpack: (config, { isServer }) => {
    // Ignore React Native async-storage (not needed in browser)
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false
    };
    return config;
  }
};

export default nextConfig;
