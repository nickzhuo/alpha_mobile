import type { Metadata, Viewport } from 'next';

import './globals.css';

import { SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · 让每一只走失的狗狗都能回家`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    '寻狗、寻主、领养 —— 同城真实启事。每一条启事都有独立页面，可分享到微信外查看；发布、留言、地图与联系方式在小程序内完成。',
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'zh_CN',
    url: SITE_URL,
    title: `${SITE_NAME} · 让每一只走失的狗狗都能回家`,
    description: '寻狗、寻主、领养 —— 同城真实启事，让每一只走失的狗狗都能回家。',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
