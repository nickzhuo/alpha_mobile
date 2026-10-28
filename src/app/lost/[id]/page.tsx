import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import DetailView from '@/components/DetailView';
import JsonLd from '@/components/JsonLd';
import { getLost, parseId } from '@/lib/api';
import { detailJsonLd, detailMetadata } from '@/lib/seo';
import { buildLost } from '@/lib/viewmodel';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const numeric = parseId((await params).id);
  if (numeric === null) {
    return { title: '启事不存在', robots: { index: false, follow: false } };
  }
  const raw = await getLost(numeric);
  if (!raw) {
    return { title: '启事不存在或已删除', robots: { index: false, follow: false } };
  }
  return detailMetadata(buildLost(raw));
}

export default async function LostDetailPage({ params }: PageProps) {
  const numeric = parseId((await params).id);
  if (numeric === null) notFound();

  const raw = await getLost(numeric);
  if (!raw) notFound();

  const vm = buildLost(raw);

  return (
    <>
      <JsonLd data={detailJsonLd(vm)} />
      <DetailView vm={vm} />
    </>
  );
}
