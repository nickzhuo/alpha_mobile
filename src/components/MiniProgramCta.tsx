'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { CloseIcon, MiniProgramIcon } from './Icons';

const OPEN_EVENT = 'alpha:open-mp';
const SDK_SRC = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';

type Env = 'wechat' | 'mobile' | 'desktop';
/** openTag = 微信内开放标签；fallback = 普通按钮（外部浏览器先试 scheme，微信内直接出二维码） */
type Mode = 'checking' | 'openTag' | 'fallback';

interface Props {
  qr: string;
  type: 'lost' | 'stray' | 'adopt';
  id: number;
  /** 小程序原始 ID，开放标签的 username 必须用它（AppID 不行） */
  wxaUsername: string;
}

const STEPS: Record<Env, string[]> = {
  wechat: ['长按下方小程序码', '在弹出的菜单里选「识别图中小程序码」', '进入启事详情页查看联系方式'],
  mobile: ['长按小程序码，保存到相册', '打开微信「扫一扫」，点右上角相册', '选中刚保存的图片即可打开'],
  desktop: ['打开手机微信「扫一扫」', '扫描下方小程序码', '进入启事详情页查看联系方式'],
};

function detectEnv(): Env {
  const ua = navigator.userAgent;
  if (/MicroMessenger/i.test(ua)) return 'wechat';
  if (/Android|iPhone|iPad|iPod|HarmonyOS|Mobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

/** 动态加载微信 JS-SDK，一页只加载一次 */
function loadSdk(): Promise<void> {
  const existing = document.getElementById('wx-jssdk') as HTMLScriptElement | null;
  if (existing) {
    return existing.dataset.ready === '1'
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => reject(new Error('sdk load failed')));
        });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'wx-jssdk';
    script.src = SDK_SRC;
    script.async = true;
    script.addEventListener('load', () => {
      script.dataset.ready = '1';
      resolve();
    });
    script.addEventListener('error', () => reject(new Error('sdk load failed')));
    document.head.appendChild(script);
  });
}

export default function MiniProgramCta({ qr, type, id, wxaUsername }: Props) {
  const [env, setEnv] = useState<Env>('desktop');
  const [mode, setMode] = useState<Mode>('checking');
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const timerRef = useRef<number | null>(null);
  const wxaHostRef = useRef<HTMLDivElement | null>(null);

  // 开放标签自身报错（小程序未发布、主体不匹配等）也退回二维码，别让用户点了没反应
  useEffect(() => {
    if (mode !== 'openTag') return;
    const host = wxaHostRef.current;
    const tag = host?.querySelector('wx-open-launch-weapp');
    if (!tag) return;

    const onError = () => setMode('fallback');
    tag.addEventListener('error', onError);
    return () => tag.removeEventListener('error', onError);
  }, [mode]);

  // 环境判断；微信内尝试接开放标签，失败一律退回二维码
  useEffect(() => {
    const current = detectEnv();
    setEnv(current);

    if (current !== 'wechat') {
      setMode('fallback');
      return;
    }

    let cancelled = false;
    const pageUrl = window.location.href.split('#')[0];

    (async () => {
      try {
        await loadSdk();
        if (cancelled) return;

        const params = new URLSearchParams({ url: pageUrl });
        const res = await fetch(`/api/jssdk?${params.toString()}`);
        if (!res.ok) throw new Error(`jssdk ${res.status}`);
        const cfg = (await res.json()) as {
          appId: string;
          timestamp: number;
          nonceStr: string;
          signature: string;
        };
        if (cancelled) return;

        const wx = (window as unknown as { wx?: WechatSdk }).wx;
        if (!wx) throw new Error('wx missing');

        wx.config({
          debug: false,
          appId: cfg.appId,
          timestamp: cfg.timestamp,
          nonceStr: cfg.nonceStr,
          signature: cfg.signature,
          jsApiList: [],
          openTagList: ['wx-open-launch-weapp'],
        });

        wx.ready(() => {
          if (!cancelled) setMode('openTag');
        });
        wx.error(() => {
          if (!cancelled) setMode('fallback');
        });

        // 兜底：6 秒还没 ready 就当不可用，别让按钮一直空着
        window.setTimeout(() => {
          if (!cancelled) setMode((prev) => (prev === 'checking' ? 'fallback' : prev));
        }, 6000);
      } catch {
        if (!cancelled) setMode('fallback');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 页面里其他位置（地图卡、留言卡）的按钮，在微信内也要能唤起二维码浮层
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  /** 外部浏览器：先试 scheme 拉起微信；2.5 秒还没跳走说明被拦或没装微信，退二维码 */
  const launchByScheme = useCallback(async () => {
    if (opening) return;
    setOpening(true);
    try {
      const res = await fetch(`/api/scheme/${type}/${id}`);
      if (!res.ok) throw new Error(`scheme ${res.status}`);
      const { scheme } = (await res.json()) as { scheme?: string };
      if (!scheme) throw new Error('empty scheme');

      timerRef.current = window.setTimeout(() => {
        setOpening(false);
        setOpen(true);
      }, 2500);

      window.location.href = scheme;
    } catch {
      setOpening(false);
      setOpen(true);
    }
  }, [id, opening, type]);

  const onCtaClick = () => {
    if (env === 'wechat') {
      setOpen(true);
      return;
    }
    void launchByScheme();
  };

  // 开放标签的内容只能写在 shadow DOM 的模板里，外部 CSS 进不去
  const openTagHtml = `
    <style>
      .wxa-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
        width:100%;height:54px;border-radius:14px;
        background:linear-gradient(135deg,#23c023,#1aad19 55%,#149a13);color:#fff;
        font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;}
      .wxa-main{font-size:15.5px;font-weight:700;letter-spacing:.01em;}
      .wxa-sub{font-size:11px;opacity:.86;}
    </style>
    <div class="wxa-btn">
      <span class="wxa-main">打开小程序查看完整信息</span>
      <span class="wxa-sub">联系方式 · 精确位置 · 全部线索</span>
    </div>
  `;

  return (
    <>
      <div className="mp-cta">
        <div className="mp-cta__inner">
          {mode === 'openTag' ? (
            <div
              className="mp-wxa-host"
              dangerouslySetInnerHTML={{
                __html: `<wx-open-launch-weapp username="${wxaUsername}" path="pages/${type}/detail?id=${id}">${openTagHtml}</wx-open-launch-weapp>`,
              }}
            />
          ) : (
            <button type="button" className="mp-cta__btn" onClick={onCtaClick} disabled={opening}>
              <span className="mp-cta__main">
                <MiniProgramIcon />
                {opening ? '正在打开微信…' : '打开小程序查看完整信息'}
              </span>
              <span className="mp-cta__sub">联系方式 · 精确位置 · 全部线索</span>
            </button>
          )}
        </div>
      </div>

      {open && (
        <div
          className="mp-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mp-sheet-title"
          onClick={() => setOpen(false)}
        >
          <div className="mp-sheet__card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="mp-sheet__close"
              aria-label="关闭"
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </button>

            <h2 className="mp-sheet__title" id="mp-sheet-title">
              在小程序中查看
            </h2>
            <p className="mp-sheet__text">联系方式、精确位置与全部线索仅在小程序内展示</p>

            {qr ? (
              <div className="mp-sheet__qr">
                {/* 微信内长按可「识别图中小程序码」，所以这里必须是原生 img */}
                <img src={qr} alt="寻狗小程序码" width={196} height={196} />
              </div>
            ) : (
              <p className="mp-sheet__text" style={{ margin: '20px 0' }}>
                暂时无法加载小程序码，请在微信中搜索小程序「寻狗」。
              </p>
            )}

            <div className="mp-sheet__steps">
              {STEPS[env].map((step, i) => (
                <span className="mp-sheet__step" key={step}>
                  <i>{i + 1}</i>
                  <span>{step}</span>
                </span>
              ))}
            </div>

            <p className="mp-sheet__foot">
              {env === 'wechat' ? '已在微信中？直接长按上图也能识别' : '小程序码可长按保存到本地'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
