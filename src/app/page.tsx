import type { Metadata } from 'next';

import { HeartIcon, MapPinIcon, PawIcon, SearchIcon } from '@/components/Icons';
import { ICP_BEIAN, SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: `${SITE_NAME} · 让每一只走失的狗狗都能回家`,
  description:
    '寻狗、寻主、领养 —— 同城真实启事。每一条启事都有独立页面，可分享到微信外查看；发布启事、留言、地图与联系方式在「寻狗」小程序内完成。',
  alternates: { canonical: '/' },
};

const CATEGORIES = [
  {
    key: 'lost',
    icon: <SearchIcon />,
    title: '人找狗',
    text: '狗狗走失后，主人发布寻狗启事，同城的人一起帮忙留意、提供线索。',
  },
  {
    key: 'stray',
    icon: <MapPinIcon />,
    title: '狗找人',
    text: '捡到走失的狗狗，发布寻主启事，让它尽快回到主人身边。',
  },
  {
    key: 'adopt',
    icon: <HeartIcon />,
    title: '领养一条',
    text: '送养人发布领养信息，给暂时没有家的它找一个新家。',
  },
];

export default function HomePage() {
  return (
    <div className="home">
      <section className="home__hero">
        <div className="home__logo">
          <PawIcon />
        </div>
        <h1 className="home__title">
          让每一只走失的狗狗
          <br />
          都能回家
        </h1>
        <p className="home__sub">寻狗 · 寻主 · 领养 —— 真实、免费、同城互助</p>
      </section>

      <section className="home__cards">
        {CATEGORIES.map((category) => (
          <article className="home__card" key={category.key}>
            <span className="home__card-icon">{category.icon}</span>
            <div>
              <h2 className="home__card-title">{category.title}</h2>
              <p className="home__card-text">{category.text}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="home__tip">
        <strong>这里只展示启事详情</strong>
        每一条启事都有独立页面，方便分享到微信外打开、也方便被搜索引擎收录。发布启事、留言线索、查看地图、联系发布者，都在小程序里完成。
      </div>

      <div className="home__tip">
        <strong>怎么进入小程序</strong>
        打开微信 →「发现」→「小程序」→ 搜索「{SITE_NAME}」；或直接打开朋友分享的小程序卡片、以及启事页里的小程序码。
      </div>

      <footer className="home__foot">
        <p>本页信息由用户自行发布，真实性、准确性由发布者负责。</p>
        <p>
          <a href={SITE_URL}>{SITE_NAME}</a> · 让每一只走失的狗狗都能回家
        </p>
        {ICP_BEIAN && <p>{ICP_BEIAN}</p>}
      </footer>
    </div>
  );
}
