import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
        remotePatterns: [
            {
                protocol:"https",
                hostname: "pub-64a1f52f8ce34898ad37705d90a1d23b.r2.dev",
            }
        ],
    },
};

export default nextConfig;
