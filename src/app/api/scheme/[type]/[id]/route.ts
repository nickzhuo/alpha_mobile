import { promises as fs } from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_BASE = (process.env.API_BASE || 'https://api.91xungou.com').replace(/\/$/, '');
const CACHE_DIR = process.env.SCHEME_CACHE_DIR?.trim() || path.join(process.cwd(), '.cache', 'scheme');

// 微信 scheme 最长 30 天，缓存 25 天留 5 天余量
const TTL_MS = 25 * 24 * 60 * 60 * 1000;
const TYPES = new Set(['lost', 'stray', 'adopt']);

interface CacheRecord {
  scheme: string;
  expireAt: number;
}

const inflight = new Map<string, Promise<string | null>>();

async function readCache(file: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    const record = JSON.parse(raw) as CacheRecord;
    if (!record.scheme || record.expireAt < Date.now()) return null;
    return record.scheme;
  } catch {
    return null;
  }
}

async function generate(type: string, id: string, file: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/wxa/scheme?type=${type}&id=${id}`, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;

    const body = (await res.json()) as {
      status?: string;
      data?: { scheme?: string };
    };
    const scheme = body?.data?.scheme;
    if (body?.status !== 'SUCCESS' || !scheme) return null;

    try {
      await fs.mkdir(path.dirname(file), { recursive: true });
      const record: CacheRecord = { scheme, expireAt: Date.now() + TTL_MS };
      await fs.writeFile(file, JSON.stringify(record));
    } catch {
      // 磁盘不可写不影响本次返回
    }
    return scheme;
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await context.params;

  if (!TYPES.has(type) || !/^\d{1,9}$/.test(id)) {
    return Response.json({ error: 'bad request' }, { status: 400 });
  }

  const file = path.join(CACHE_DIR, `${type}-${id}.json`);
  const cached = await readCache(file);
  if (cached) {
    return Response.json({ scheme: cached });
  }

  const key = `${type}-${id}`;
  let task = inflight.get(key);
  if (!task) {
    task = generate(type, id, file).finally(() => inflight.delete(key));
    inflight.set(key, task);
  }

  const scheme = await task;
  if (!scheme) {
    return Response.json({ error: 'scheme unavailable' }, { status: 502 });
  }

  return Response.json({ scheme });
}
