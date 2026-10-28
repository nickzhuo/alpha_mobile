import type { MetadataRoute } from 'next';

import { getRecentIds } from '@/lib/api';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [lostIds, strayIds, adoptIds] = await Promise.all([
    getRecentIds('lost'),
    getRecentIds('stray'),
    getRecentIds('adopt'),
  ]);

  const now = new Date();

  const detailEntries = [
    ...lostIds.map((id) => ({ path: 'lost', id })),
    ...strayIds.map((id) => ({ path: 'stray', id })),
    ...adoptIds.map((id) => ({ path: 'adopt', id })),
  ].map<SitemapEntry>(({ path, id }) => ({
    url: `${SITE_URL}/${path}/${id}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...detailEntries,
  ];
}
