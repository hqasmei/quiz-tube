/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        hostname: 'i.ytimg.com',
      },
    ],
  },
};

export default nextConfig;
