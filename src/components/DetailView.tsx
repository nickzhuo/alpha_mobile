import { CATEGORY_LABELS } from '@/lib/constants';
import { ICP_BEIAN, MP_ONLY_NOTICE, SITE_NAME, SITE_URL } from '@/lib/site';
import type { DetailVM } from '@/lib/viewmodel';

import Gallery from './Gallery';
import { AlertIcon, ArrowRightIcon, ChatIcon, MapIcon, MapPinIcon, PawIcon } from './Icons';
import MiniProgramCta from './MiniProgramCta';
import OpenMiniProgramButton from './OpenMiniProgramButton';

function TopBar({ tag }: { tag: string }) {
  return (
    <header className="mp-topbar">
      <a className="mp-topbar__brand" href="/" aria-label={`${SITE_NAME} 首页`}>
        <PawIcon />
        {SITE_NAME}
      </a>
      <span className="mp-topbar__tag">{tag}</span>
    </header>
  );
}

function MapNote({ category }: { category: DetailVM['category'] }) {
  if (category === 'adopt') {
    return (
      <div className="mp-note">
        <span className="mp-note__icon">
          <MapPinIcon />
        </span>
        <div>
          <p className="mp-note__title">详细地址在小程序内查看</p>
          <p className="mp-note__text">
            为保护送养人隐私，H5 端只展示所在城市与区域，完整地址与联系方式请进入小程序查看。
          </p>
          <div className="mp-note__action">
            <OpenMiniProgramButton>
              进入小程序查看
              <ArrowRightIcon style={{ width: 14, height: 14 }} />
            </OpenMiniProgramButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mp-note">
      <span className="mp-note__icon">
        <MapIcon />
      </span>
      <div>
        <p className="mp-note__title">地图仅在小程序内提供</p>
        <p className="mp-note__text">
          地图需要实时底图与精确坐标，而 H5 端可用的第三方地图服务都要单独申请密钥、按调用量计费，
          我们暂时无法提供免费版本，还请谅解。上面的文字位置已足够辨认大致范围，精确坐标与一键导航请在小程序内查看。
        </p>
        <div className="mp-note__action">
          <OpenMiniProgramButton>
            在小程序里看地图
            <ArrowRightIcon style={{ width: 14, height: 14 }} />
          </OpenMiniProgramButton>
        </div>
      </div>
    </div>
  );
}

export default function DetailView({ vm }: { vm: DetailVM }) {
  const tag = CATEGORY_LABELS[vm.category];
  const showLocation = Boolean(vm.location.region || vm.location.name || vm.location.address);

  return (
    <div className="mp-shell">
      <TopBar tag={tag} />

      <main className="mp-main">
        {vm.inactive && (
          <div className="mp-alert">
            <AlertIcon />
            <span>这条启事已下架，信息可能已经失效。你仍可在小程序内查看发布者的其他启事。</span>
          </div>
        )}

        <section className="mp-card">
          <Gallery images={vm.images} alt={vm.imageAlt} />
        </section>

        <section className="mp-card">
          <div className="mp-head">
            <span className={`mp-pill mp-pill--${vm.tone}`}>
              <i className="mp-pill__dot" />
              {vm.statusText}
            </span>
            <h1 className="mp-head__title">{vm.headline}</h1>
            {vm.subline && <p className="mp-head__sub">{vm.subline}</p>}
            {vm.highlight && (
              <div className="mp-highlight">
                <span className="mp-highlight__label">{vm.highlight.label}</span>
                <span className="mp-highlight__value">{vm.highlight.value}</span>
              </div>
            )}
          </div>

          <dl className="mp-grid">
            {vm.specs.map((spec) => (
              <div className="mp-grid__cell" key={spec.label}>
                <dt className="mp-grid__label">{spec.label}</dt>
                <dd className="mp-grid__value">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mp-card">
          {vm.publisher && (
            <div className="mp-user">
              {vm.publisher.avatar ? (
                <img className="mp-user__avatar" src={vm.publisher.avatar} alt="" />
              ) : (
                <span className="mp-user__initial">{vm.publisher.name.slice(0, 1)}</span>
              )}
              <div>
                <div className="mp-user__name">{vm.publisher.name}</div>
                <div className="mp-user__note">{vm.publisher.note}</div>
              </div>
              <span className="mp-user__hint">联系方式在小程序内</span>
            </div>
          )}

          {vm.paragraphs.map((paragraph) => (
            <div className="mp-sec" key={paragraph.title}>
              <div className="mp-sec__hd">
                <h2 className="mp-sec__title">{paragraph.title}</h2>
              </div>
              <p className="mp-sec__body">{paragraph.body}</p>
            </div>
          ))}
        </section>

        {showLocation && (
          <section className="mp-card mp-sec">
            <div className="mp-sec__hd">
              <h2 className="mp-sec__title">位置</h2>
            </div>

            <div className="mp-loc">
              {vm.location.region && (
                <div className="mp-loc__row">
                  <span className="mp-loc__label">所在地</span>
                  <span className="mp-loc__value">{vm.location.region}</span>
                </div>
              )}
              {vm.location.name && (
                <div className="mp-loc__row">
                  <span className="mp-loc__label">地点</span>
                  <span className="mp-loc__value">{vm.location.name}</span>
                </div>
              )}
              {vm.location.address && (
                <div className="mp-loc__row">
                  <span className="mp-loc__label">地址</span>
                  <span className="mp-loc__value">{vm.location.address}</span>
                </div>
              )}
            </div>

            <MapNote category={vm.category} />
          </section>
        )}

        <section className="mp-card mp-sec">
          <div className="mp-sec__hd">
            <h2 className="mp-sec__title">留言与线索</h2>
          </div>
          <div className="mp-note">
            <span className="mp-note__icon">
              <ChatIcon />
            </span>
            <div>
              <p className="mp-note__title">线索在小程序内查看</p>
              <p className="mp-note__text">
                {MP_ONLY_NOTICE} 进入小程序可以查看全部留言线索、参与讨论，也能第一时间收到进展通知。
              </p>
              <div className="mp-note__action">
                <OpenMiniProgramButton>
                  进入小程序查看更多线索
                  <ArrowRightIcon style={{ width: 14, height: 14 }} />
                </OpenMiniProgramButton>
              </div>
            </div>
          </div>
        </section>

        <section className="mp-card mp-sec">
          <div className="mp-sec__hd">
            <h2 className="mp-sec__title">启事信息</h2>
          </div>
          <div className="mp-loc">
            {vm.meta.map((item) => (
              <div className="mp-loc__row" key={item.label}>
                <span className="mp-loc__label">{item.label}</span>
                <span className="mp-loc__value" style={{ wordBreak: 'break-all' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <noscript>
          <section className="mp-card mp-sec">
            <div className="mp-sec__hd">
              <h2 className="mp-sec__title">用微信扫码查看完整信息</h2>
            </div>
            <img
              src={vm.qr}
              alt="寻狗小程序码"
              width={180}
              height={180}
              style={{ width: 180, height: 180, margin: '0 auto' }}
            />
            <p className="mp-sec__body" style={{ textAlign: 'center', marginTop: 8 }}>
              长按识别小程序码，或在微信中搜索小程序「{SITE_NAME}」
            </p>
          </section>
        </noscript>

        <footer className="mp-foot">
          <p>本页信息由用户自行发布，真实性、准确性由发布者负责。</p>
          <p>
            <a href={SITE_URL}>{SITE_NAME}</a> · 让每一只走失的狗狗都能回家
          </p>
          {ICP_BEIAN && <p>{ICP_BEIAN}</p>}
        </footer>
      </main>

      <MiniProgramCta qr={vm.qr} type={vm.category} id={vm.id} />
    </div>
  );
}
