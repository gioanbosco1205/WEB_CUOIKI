import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cho phép load ảnh từ localhost (backend)
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001", // ⚠️ thay bằng port backend thật của bạn
        pathname: "/uploads/**",
      },
      // Cho phép domain AWS (nếu có)
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      // Ví dụ khác (nếu bạn còn dùng)
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
