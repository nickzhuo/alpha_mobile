import { createHash, randomBytes } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MP_APPID = (process.env.MP_APPID || '').trim();
const MP_SECRET = (process.env.MP_SECRET || '').trim();

/** 只给自家域名签名，避免被拿去给别人的站点生成合法签名 */
const ALLOWED_HOSTS = new Set([
  'mobile.91xungou.com',
  'localhost:3000',
  'localhost:3100',
  '127.0.0.1:3000',
  '127.0.0.1:3100',
]);

// 微信 access_token 有效期 7200s，提前 200s 刷新
const TOKEN_TTL = 7000;
const TICKET_TTL = 7000;

let tokenCache: { value: string; expireAt: number } | null = null;
let ticketCache: { value: string; expireAt: number } | null = null;

/**
 * 用 stable_token 而不是 cgi-bin/token：
 * 后者每调一次都会让旧 token 进入淘汰流程，如果公众号后台/客服系统也在用同一个 AppID，
 * 就会互相顶号。stable_token 带普通模式和 force_refresh=false，多系统共存不打架。
 */
async function getAccessToken(): Promise<string | null> {
  if (tokenCache && tokenCache.expireAt > Date.now()) return tokenCache.value;

  try {
    const res = await fetch('https://api.weixin.qq.com/cgi-bin/stable_token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credential',
        appid: MP_APPID,
        secret: MP_SECRET,
        force_refresh: false,
      }),
      cache: 'no-store',
    });
    const body = (await res.json()) as { access_token?: string; errcode?: number; errmsg?: string };
    if (!body.access_token) {
      console.error('[jssdk] stable_token 失败', body.errcode, body.errmsg);
      return null;
    }
    tokenCache = { value: body.access_token, expireAt: Date.now() + TOKEN_TTL * 1000 };
    return body.access_token;
  } catch (error) {
    console.error('[jssdk] stable_token 异常', error);
    return null;
  }
}

async function getJsapiTicket(): Promise<string | null> {
  if (ticketCache && ticketCache.expireAt > Date.now()) return ticketCache.value;

  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch(
      `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`,
      { cache: 'no-store' },
    );
    const body = (await res.json()) as { ticket?: string; errcode?: number; errmsg?: string };
    if (!body.ticket) {
      console.error('[jssdk] jsapi_ticket 失败', body.errcode, body.errmsg);
      return null;
    }
    ticketCache = { value: body.ticket, expireAt: Date.now() + TICKET_TTL * 1000 };
    return body.ticket;
  } catch (error) {
    console.error('[jssdk] jsapi_ticket 异常', error);
    return null;
  }
}

/**
 * GET /api/jssdk?url=https%3A%2F%2Fmobile.91xungou.com%2Flost%2F3333
 * 返回 wx.config 需要的四个参数
 */
export async function GET(request: Request) {
  if (!MP_APPID || !MP_SECRET) {
    return Response.json({ error: 'MP_APPID / MP_SECRET 未配置' }, { status: 500 });
  }

  const target = new URL(request.url).searchParams.get('url') || '';
  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return Response.json({ error: 'url 参数不合法' }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(parsed.host)) {
    return Response.json({ error: 'url 不在允许的域名内' }, { status: 400 });
  }

  const ticket = await getJsapiTicket();
  if (!ticket) {
    return Response.json({ error: 'jsapi_ticket 获取失败' }, { status: 502 });
  }

  const nonceStr = randomBytes(8).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000);
  const plain = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${target}`;
  const signature = createHash('sha1').update(plain).digest('hex');

  return Response.json(
    { appId: MP_APPID, timestamp, nonceStr, signature },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
