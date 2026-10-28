import Link from 'next/link';

import { PawIcon } from '@/components/Icons';
import { SITE_NAME } from '@/lib/site';

export default function NotFound() {
  return (
    <div className="mp-shell">
      <div className="mp-empty">
        <div>
          <span className="mp-empty__emoji">
            <PawIcon style={{ width: 64, height: 64 }} />
          </span>
          <h1 className="mp-empty__title">这条启事找不到了</h1>
          <p className="mp-empty__text">
            可能已经被发布者删除，或者链接不完整。
            <br />
            你可以在微信中搜索小程序「{SITE_NAME}」查看最新启事。
          </p>
          <div className="mp-empty__actions">
            <Link className="mp-btn" href="/">
              回到首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
