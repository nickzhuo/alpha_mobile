# ---- 构建 ----
FROM node:22-alpine AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# alpine(musl) 下 next 的原生依赖需要 glibc 兼容层
RUN apk add --no-cache libc6-compat

# 依赖层单独一层，改业务代码不会让它失效
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# postbuild 会把 .next/static 和 public 搬进 .next/standalone，产物自带静态资源
RUN npm run build

# ---- 运行 ----
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    QR_CACHE_DIR=/app/.cache/qr

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
RUN mkdir -p /app/.cache/qr && chown -R nextjs:nodejs /app/.cache

USER nextjs
EXPOSE 3000

# 首页是静态产物，不依赖 PHP API，适合做存活探针
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1

CMD ["node", "server.js"]
