import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 独立产物：node .next/standalone/server.js 即可跑，镜像里不用带整套 node_modules
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // 图片走自有 CDN（img.91xungou.com 已带 imageView2 裁剪），不需要 Next 再转一道
  images: { unoptimized: true },
  async headers() {
    return [
      {
        // 首页是纯静态页，Next 默认给 s-maxage=31536000（一年），
        // 改一次文案就要去 CDN 刷新，容易变成"改了看不见"。压到 10 分钟。
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=86400' },
        ],
      },
      {
        // 详情页 HTML：CDN 可缓存 5 分钟，回源压力小；过期后先给旧页再后台刷新
        source: '/:type(lost|stray|adopt)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
