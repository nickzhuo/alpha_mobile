import type { AdoptRaw, ApiList, LostRaw, StrayRaw } from './types';

const API_BASE = (process.env.API_BASE || 'https://api.91xungou.com').replace(/\/$/, '');
const REVALIDATE = Number(process.env.API_REVALIDATE || 300);
const TIMEOUT_MS = 6000;

/**
 * 只读接口，全部走 Next 的 Data Cache（revalidate 秒）。
 * 不给 fetch 传 signal —— 带 signal 的 fetch 在部分 Next 版本会跳过缓存，
 * 超时改为在 Promise 层兜底（请求继续跑，但渲染不等它）。
 */
async function getJson<T>(path: string, revalidate = REVALIDATE): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { accept: 'application/json' },
      next: { revalidate },
    });
    if (!res.ok) {
      return null;
    }
    const body = (await res.json()) as { status?: string; data?: T };
    if (!body || body.status === 'failed' || body.data === undefined) {
      return null;
    }
    return body.data;
  } catch {
    return null;
  }
}

function withTimeout<T>(task: Promise<T>, ms = TIMEOUT_MS): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    task
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });
}

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0 && id < 100_000_000;
}

export async function getLost(id: number): Promise<LostRaw | null> {
  if (!validId(id)) return null;
  const data = await withTimeout(getJson<{ result: LostRaw }>(`/lost/detail2/${id}`));
  return data?.result ?? null;
}

export async function getStray(id: number): Promise<StrayRaw | null> {
  if (!validId(id)) return null;
  const data = await withTimeout(getJson<{ result: StrayRaw }>(`/stray/detail2/${id}`));
  return data?.result ?? null;
}

export async function getAdopt(id: number): Promise<AdoptRaw | null> {
  if (!validId(id)) return null;
  const data = await withTimeout(getJson<{ result: AdoptRaw }>(`/adopt/detail/${id}`));
  return data?.result ?? null;
}

/** 站点地图只取 id，够用就行，别把整条记录拉下来 */
export async function getRecentIds(type: 'lost' | 'stray' | 'adopt', limit = 300): Promise<number[]> {
  const path =
    type === 'adopt'
      ? `/adopt/list3?pageSize=${limit}`
      : `/${type}/latest3?pageSize=${limit}`;
  const data = await withTimeout(getJson<ApiList<{ id: number }>>(path, 3600), 15000);
  if (!data?.list) return [];
  return data.list.map((item) => item.id).filter((id) => Number.isInteger(id) && id > 0);
}

export function parseId(raw: string): number | null {
  if (!/^\d{1,9}$/.test(raw)) return null;
  const id = Number(raw);
  return validId(id) ? id : null;
}
