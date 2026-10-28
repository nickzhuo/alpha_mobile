import { IMG_BASE } from './site';

interface ImageOptions {
  /** 目标宽度（等比缩放，不裁剪） */
  w?: number;
  /** 目标高度，配合 mode=2 才会裁剪 */
  h?: number;
  /** 1 = 等比缩放不裁剪（默认），2 = 裁剪 */
  mode?: 1 | 2;
  q?: number;
}

/**
 * 拼 COS 图片处理参数。
 * pic[].key 里存在 `lost//uuid//file` 这样的双斜杠，原样保留——CDN 上就是这个 key。
 * 已经是完整外链的（微信头像、海报背景）直接返回，不能给它套 imageView2。
 */
export function imageUrl(key: string, options: ImageOptions = {}): string {
  if (!key) return '';
  if (/^https?:\/\//i.test(key)) return key;

  const { w, h, mode = 1, q = 85 } = options;
  const parts = [String(mode)];
  if (w) parts.push(`w/${w}`);
  if (h) parts.push(`h/${h}`);
  parts.push(`q/${q}`);

  return `${IMG_BASE}/${key}?imageView2/${parts.join('/')}`;
}

export function qrUrl(key: string): string {
  return imageUrl(key, { w: 660, h: 660, q: 100 });
}
