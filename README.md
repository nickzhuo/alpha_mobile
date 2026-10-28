# alpha_mobile · 寻狗 H5

`mobile.91xungou.com` 的落地站。只做一件事：**把每一条启事变成一个可被分享、可被搜索引擎收录的独立页面，然后把访客引导进微信小程序**。

- 服务端渲染（Next.js App Router + RSC），HTML 里就是完整内容，不依赖客户端渲染
- 数据来自 `delta`（Symfony，`api.91xungou.com`），只读、匿名、无鉴权改造
- H5 不存任何用户数据：不留手机号、不展示留言正文、不渲染地图，全部引导进小程序

## 目录

```
src/
  app/
    page.tsx                 首页（品类说明 + 进入方式）
    lost/[id]/page.tsx       人找狗详情
    stray/[id]/page.tsx      狗找人（寻主）详情
    adopt/[id]/page.tsx      领养详情
    api/qr/[type]/[id]/      小程序码代理（磁盘缓存 30 天）
    sitemap.ts robots.ts     站点地图 / 爬虫规则
    globals.css              设计基线（WeUI 令牌，自建子集）
  components/
    DetailView.tsx           详情页骨架，三个品类共用
    Gallery.tsx              图片画廊 + 全屏查看（客户端）
    MiniProgramCta.tsx       吸底 CTA + 小程序码浮层（客户端）
    JsonLd.tsx               结构化数据
  lib/
    api.ts                   delta 接口封装（Data Cache + 超时兜底）
    viewmodel.ts             原始 JSON → 展示模型（文案字典与小程序 vm.js 对齐）
    seo.ts                   metadata / JSON-LD 组装
deploy 配置不在这里：容器定义和 Traefik 路由写在 `docker_api` 仓库的 `api/docker-compose.yml`（与 delta 同一个 compose 项目）。
```

## 本地开发

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

生产产物（standalone）：

```bash
npm run build          # 自动执行 postbuild，把 static/public 搬进 .next/standalone
npm start              # node .next/standalone/server.js
```

> `next start` 与 `output: standalone` 不兼容，`npm start` 已改成直接跑 standalone server。
> 本地访问用 `localhost`，用 `127.0.0.1` 会被 Next 拦掉 dev 资源导致不 hydrate。

## 环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://mobile.91xungou.com` | canonical / sitemap / og:url |
| `API_BASE` | `https://api.91xungou.com` | PHP 接口地址，只在服务端用 |
| `API_REVALIDATE` | `300` | 详情数据缓存秒数，同时是页面 ISR 周期 |
| `NEXT_PUBLIC_IMG_BASE` | `https://img.91xungou.com` | 图片 CDN |
| `QR_CACHE_DIR` | `<cwd>/.cache/qr` | 小程序码落盘目录 |
| `NEXT_PUBLIC_ICP_BEIAN` | 空 | 备案号，空则不渲染 |

## 部署

**手工构建发版，不走 GitHub Actions**（Actions 从 GitHub 推 TCR 太慢）。

容器定义在 `docker_api` 仓库的 `api/docker-compose.yml`（服务名 `alpha_mobile`，与 delta 同一个 compose 项目、同一个 `traefik` 网络）。

```bash
# 1. 本地构建 + 推送，脚本会打印新版本号（工作区必须干净）
./scripts/release.sh          # → alpha_mobile-master-<完整 sha>

# 2. 把 docker_api/api/docker-compose.yml 里 alpha_mobile 的 image tag 换成上一步的版本号

# 3. 服务器上（docker-compose 是 v1.28.6，pull 不会隐式拉，必须显式 pull）
cd /data/api
docker-compose pull alpha_mobile
docker-compose up -d alpha_mobile
```

镜像 tag 用 `<完整 sha>` 而不是 `latest`：线上跑的到底是哪次提交一眼能看出来，回滚也只需要改回上一版 tag。

> 脚本会顺带更新 `:latest`，那是给临时排查用的，生产 compose 不要锁 `latest`。

Traefik 只挂 `web`（80）入口，**不要加 http→https 跳转**：线上是 EdgeOne 终止 TLS 后 HTTP 回源，源站跳转会导致回源死循环，对外常表现为 404。

首次上线需要：DNSPod 把 `mobile.91xungou.com` 指到回源地址 → EdgeOne 新建站点（证书在 CDN 侧）→ 服务器 `docker-compose up -d alpha_mobile`。

## 关键决策

**小程序码而不是 URL Scheme。** 每条 `lost` / `stray` 记录在库里都存了一张小程序码（`wxaQrCode` → COS），零成本直接引用；`adopt` 实体没有这个字段，走 `/api/qr/adopt/{id}` 由 Node 端代理生成并落盘缓存 30 天——`delta` 的 `getAccessToken()` 没有缓存，每次调用都会打微信 `cgi-bin/token`（限额 2000 次/天），不缓存会把配额烧穿。

**不做 H5 里的地图。** 库里坐标是 `wx.chooseLocation` 返回的 GCJ-02；OSM/Leaflet 免费免 Key 但底图是 WGS84，画出来会偏 300~600 米，且 tile 使用政策不允许商用站点大量拉取。高德/腾讯/天地图坐标对得上，但都要实名申请 Key 并按量计费。所以 H5 只渲染文字位置，地图位置放一张说明卡，明确告知「地图不是免费能力」，按钮引导进小程序。

**隐私边界。** 手机号只脱不显（连脱敏都不展示，直接提示进小程序）；留言只给入口不给正文；已下架启事（`activate=false`）保留页面但打 `noindex`。

**SEO。** 每页独立 `title` / `description` / canonical / OG / Twitter Card；`Article` + `BreadcrumbList` 结构化数据；`sitemap.xml` 动态拉三个品类最近 300 条；`robots.txt` 屏蔽 `/api/`。

## 待办

- 首页暂不提供通用小程序码（delta 没有「入口页」码的接口），现在靠微信搜索小程序名兜底；要加的话在 delta 增一个固定页二维码接口即可
- 如需「一点直达小程序」，可在 delta 增 `GET /wxa/scheme`（`wxa/generatescheme`），前端已有统一的唤起入口，替换成跳 Scheme 即可
- 列表页 / 品类聚合页（当前刻意不做，按需求只保留详情页）
