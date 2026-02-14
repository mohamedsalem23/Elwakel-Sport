/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    turbo: {
      disabled: true,
    },
  },
  logging: {
    fetches: {
      suppressWarningMessages: true,
    },
  },
};

export default nextConfig;
