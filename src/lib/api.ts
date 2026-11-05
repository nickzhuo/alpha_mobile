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

/**
 * 手机号脱敏：H5 端不留明文号码。
 *
 * 起因：详情页本来就不渲染 contactsMobile（只写「联系方式在小程序内」），
 * 但**用户会把号码手打进描述里**（"如有线索请联系139xxxxxxxx"），
 * 那段文字是原样渲染的，爬虫直接正则就能扫出来。
 *
 * 所以在数据进 React 之前就替换掉，这样 RSC payload、HTML、页面文本里
 * 全都只有 139****7852。想拿完整号码只能进小程序（小程序需要微信客户端渲染，
 * 第三方爬虫进不去）。
 */
function maskPhones(text: string): string {
  return text.replace(/1[3-9]\d{9}/g, (m) => `${m.slice(0, 3)}****${m.slice(7)}`);
}

/** 对一条记录的手机号字段与描述文本同时脱敏（保持其余字段不变） */
function maskContact<T extends { contactsMobile?: string | null; remark?: string | null }>(row: T | null): T | null {
  if (!row) {
    return row;
  }

  return {
    ...row,
    ...(typeof row.contactsMobile === 'string' && row.contactsMobile
      ? { contactsMobile: maskPhones(row.contactsMobile) }
      : {}),
    ...(typeof row.remark === 'string' && row.remark
      ? { remark: maskPhones(row.remark) }
      : {}),
  };
}

export async function getLost(id: number): Promise<LostRaw | null> {
  if (!validId(id)) return null;
  const data = await withTimeout(getJson<{ result: LostRaw }>(`/lost/detail2/${id}`));
  return maskContact(data?.result ?? null);
}

export async function getStray(id: number): Promise<StrayRaw | null> {
  if (!validId(id)) return null;
  const data = await withTimeout(getJson<{ result: StrayRaw }>(`/stray/detail2/${id}`));
  return maskContact(data?.result ?? null);
}

export async function getAdopt(id: number): Promise<AdoptRaw | null> {
  if (!validId(id)) return null;
  const data = await withTimeout(getJson<{ result: AdoptRaw }>(`/adopt/detail/${id}`));
  return maskContact(data?.result ?? null);
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
