import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone only for Docker image builds so `npm start` keeps working locally/CI.
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
