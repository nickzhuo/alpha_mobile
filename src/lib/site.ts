/**
 * 站点级常量。凡是会影响 canonical / sitemap / og 的一律从这里取，禁止各处硬编码。
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mobile.91xungou.com').replace(/\/$/, '');

export const SITE_NAME = '寻狗';

export const SITE_SLOGAN_MAIN = '让每一只走失的狗狗都能回家';

export const SITE_SLOGAN_SUB = '寻狗 · 寻主 · 领养 —— 真实、免费、同城互助';

export const IMG_BASE = (process.env.NEXT_PUBLIC_IMG_BASE || 'https://img.91xungou.com').replace(/\/$/, '');

/** 小程序 AppID，仅用于展示与文案，不参与任何鉴权 */
export const WXA_APPID = 'wxc93395d0a3c41c49';

/** 小程序原始 ID —— 微信开放标签的 username 只认这个，不认 AppID */
export const WXA_ORIGINAL_ID = process.env.WXA_ORIGINAL_ID || 'gh_0c80acc3f473';

export const WXA_NAME = '寻狗';

export const ICP_BEIAN = process.env.NEXT_PUBLIC_ICP_BEIAN || '';

export const OG_IMAGE = `${IMG_BASE}/xungou_plus.png`;

/** 留言与线索全部沉淀在小程序，H5 只做引导 —— 这句文案在多处复用 */
export const MP_ONLY_NOTICE = '为保护发布者隐私，联系方式、精确位置与全部线索仅在小程序内展示。';
