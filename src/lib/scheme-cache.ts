import { readFileSync } from 'node:fs';
import path from 'node:path';

const CACHE_DIR = process.env.SCHEME_CACHE_DIR?.trim() || path.join(process.cwd(), '.cache', 'scheme');

/**
 * 读 /api/scheme 落盘的缓存。
 * 详情页是 ISR 页，渲染时顺手把缓存的 scheme 塞进 HTML，
 * 用户在手机上点按钮时就能同步跳转，不用等一次网络往返
 * （iOS Safari 对「等完再跳」的自定义协议是直接拦的）。
 */
export function readSchemeCache(type: string, id: number): string | null {
  try {
    const raw = readFileSync(path.join(CACHE_DIR, `${type}-${id}.json`), 'utf8');
    const record = JSON.parse(raw) as { scheme?: string; expireAt?: number };
    if (!record.scheme || (record.expireAt ?? 0) < Date.now()) return null;
    return record.scheme;
  } catch {
    return null;
  }
}
