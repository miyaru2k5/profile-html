import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.zadn.vn" },
      { protocol: "https", hostname: "s240-ava-talk.zadn.vn" },
      { protocol: "https", hostname: "cover-talk.zadn.vn" },
      { protocol: "https", hostname: "img.icons8.com" },
      { protocol: "https", hostname: "i.postimg.cc" },
    ],
  },
};

export default nextConfig;
