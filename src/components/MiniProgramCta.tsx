'use client';

import { useEffect, useState } from 'react';

import { CloseIcon, MiniProgramIcon } from './Icons';

const OPEN_EVENT = 'alpha:open-mp';

type Env = 'wechat' | 'mobile' | 'desktop';

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

export default function MiniProgramCta({ qr }: { qr: string }) {
  const [open, setOpen] = useState(false);
  const [env, setEnv] = useState<Env>('desktop');

  useEffect(() => {
    setEnv(detectEnv());
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

  return (
    <>
      <div className="mp-cta">
        <div className="mp-cta__inner">
          <button type="button" className="mp-cta__btn" onClick={() => setOpen(true)}>
            <span className="mp-cta__main">
              <MiniProgramIcon />
              打开小程序查看完整信息
            </span>
            <span className="mp-cta__sub">联系方式 · 精确位置 · 全部线索</span>
          </button>
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

            <p className="mp-sheet__foot">已在微信中？直接长按上图也能识别</p>
          </div>
        </div>
      )}
    </>
  );
}
