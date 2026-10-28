import { promises as fs } from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_BASE = (process.env.API_BASE || 'https://api.91xungou.com').replace(/\/$/, '');
const CACHE_DIR = process.env.QR_CACHE_DIR?.trim() || path.join(process.cwd(), '.cache', 'qr');
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const TYPES = new Set(['lost', 'stray', 'adopt']);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

/**
 * lost / stray 的码本来就存在 COS 上，正常不会走到这里；
 * 只有老数据缺 wxaQrCode、以及 adopt（实体没有这个字段）才需要现生成。
 * 微信 cgi-bin/token 有 2000 次/天 的硬限额，delta 那边取 token 没做缓存，
 * 所以这里必须把图片落盘，30 天内同一个 id 只打一次上游。
 */
const inflight = new Map<string, Promise<Buffer | null>>();

async function readCache(file: string): Promise<Buffer | null> {
  try {
    const stat = await fs.stat(file);
    if (Date.now() - stat.mtimeMs > TTL_MS) return null;
    return await fs.readFile(file);
  } catch {
    return null;
  }
}

async function generate(type: string, id: string, file: string): Promise<Buffer | null> {
  try {
    const res = await fetch(`${API_BASE}/${type}/qr?id=${id}`, {
      cache: 'no-store',
      headers: { accept: 'image/png,image/*' },
    });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    // 微信出错时返回的是 JSON（errcode），魔数不对就别当图片存下来
    if (buffer.length < 512 || !buffer.subarray(0, 4).equals(PNG_MAGIC)) return null;

    try {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, buffer);
    } catch {
      // 磁盘不可写也不影响本次返回
    }
    return buffer;
  } catch {
    return null;
  }
}

function imageResponse(buffer: Buffer, cacheControl: string): Response {
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': String(buffer.length),
      'Cache-Control': cacheControl,
    },
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await context.params;

  if (!TYPES.has(type) || !/^\d{1,9}$/.test(id)) {
    return new Response('Bad Request', { status: 400 });
  }

  const file = path.join(CACHE_DIR, `${type}-${id}.png`);
  const cached = await readCache(file);
  if (cached) {
    return imageResponse(cached, 'public, max-age=2592000, s-maxage=2592000, immutable');
  }

  const key = `${type}-${id}`;
  let task = inflight.get(key);
  if (!task) {
    task = generate(type, id, file).finally(() => inflight.delete(key));
    inflight.set(key, task);
  }

  const buffer = await task;
  if (!buffer) {
    return new Response('QR unavailable', {
      status: 502,
      headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' },
    });
  }

  return imageResponse(buffer, 'public, max-age=3600, s-maxage=86400');
}
