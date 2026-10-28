import type { Metadata } from 'next';

import { OG_IMAGE, SITE_NAME, SITE_URL } from './site';
import type { DetailVM } from './viewmodel';

export function detailUrl(vm: DetailVM): string {
  return `${SITE_URL}/${vm.category}/${vm.id}`;
}

export function detailMetadata(vm: DetailVM): Metadata {
  const url = detailUrl(vm);
  const images = vm.images.length > 0 ? vm.images.slice(0, 3) : [OG_IMAGE];

  return {
    title: vm.seo.title,
    description: vm.seo.description,
    keywords: vm.seo.keywords,
    alternates: { canonical: url },
    // 已下架的启事保留页面但别进索引，避免搜索结果里全是失效信息
    robots: vm.inactive ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: 'article',
      url,
      siteName: SITE_NAME,
      locale: 'zh_CN',
      title: vm.seo.title,
      description: vm.seo.description,
      images: images.map((image) => ({ url: image, alt: vm.imageAlt })),
      publishedTime: vm.published || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: vm.seo.title,
      description: vm.seo.description,
      images: images.slice(0, 1),
    },
  };
}

export function detailJsonLd(vm: DetailVM) {
  const url = detailUrl(vm);
  const images = vm.images.length > 0 ? vm.images.slice(0, 3) : [OG_IMAGE];

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: vm.headline,
      description: vm.seo.description,
      image: images,
      datePublished: vm.published || undefined,
      dateModified: vm.published || undefined,
      inLanguage: 'zh-CN',
      author: { '@type': 'Person', name: vm.publisher?.name || '爱心网友' },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      about: { '@type': 'Thing', name: vm.imageAlt },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: vm.headline, item: url },
      ],
    },
  ];
}
