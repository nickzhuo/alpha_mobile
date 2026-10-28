import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import DetailView from '@/components/DetailView';
import JsonLd from '@/components/JsonLd';
import { getStray, parseId } from '@/lib/api';
import { detailJsonLd, detailMetadata } from '@/lib/seo';
import { buildStray } from '@/lib/viewmodel';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const numeric = parseId((await params).id);
  if (numeric === null) {
    return { title: '启事不存在', robots: { index: false, follow: false } };
  }
  const raw = await getStray(numeric);
  if (!raw) {
    return { title: '启事不存在或已删除', robots: { index: false, follow: false } };
  }
  return detailMetadata(buildStray(raw));
}

export default async function StrayDetailPage({ params }: PageProps) {
  const numeric = parseId((await params).id);
  if (numeric === null) notFound();

  const raw = await getStray(numeric);
  if (!raw) notFound();

  const vm = buildStray(raw);

  return (
    <>
      <JsonLd data={detailJsonLd(vm)} />
      <DetailView vm={vm} />
    </>
  );
}
