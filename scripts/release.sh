#!/usr/bin/env bash
#
# 手工构建并推送 alpha_mobile 镜像（不走 GitHub Actions —— Actions 推 TCR 太慢）
#
#   ./scripts/release.sh
#
# 产物：ccr.ccs.tencentyun.com/zhouzhou/alpha_mobile:alpha_mobile-master-<完整 sha>
#      （同时更新 :latest 方便临时排查，生产 compose 请锁 sha tag）
#
set -euo pipefail

IMAGE="ccr.ccs.tencentyun.com/zhouzhou/alpha_mobile"
cd "$(dirname "$0")/.."

# Windows Git Bash 下 docker 默认不在 PATH 里
if ! command -v docker >/dev/null 2>&1; then
  for candidate in "/c/Program Files/Docker/Docker/resources/bin" "/c/ProgramData/DockerDesktop/version-bin"; do
    if [ -x "$candidate/docker.exe" ]; then
      PATH="$candidate:$PATH"
      break
    fi
  done
fi
command -v docker >/dev/null 2>&1 || { echo "❌ 找不到 docker，先启动 Docker Desktop"; exit 1; }

# 镜像要能对上某次提交，脏工作区构建出来的版本无法追溯
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 工作区有未提交改动，先 commit 再发版："
  git status --short
  exit 1
fi

SHA="$(git rev-parse HEAD)"
TAG="alpha_mobile-master-${SHA}"

# 关掉 MSYS 的路径转换，否则 docker 的容器内路径参数会被改写
export MSYS2_ARG_CONV_EXCL='*'

echo "▶ 构建 ${IMAGE}:${TAG}"
docker build --platform linux/amd64 -t "${IMAGE}:${TAG}" .

echo "▶ 推送 ${IMAGE}:${TAG}"
docker push "${IMAGE}:${TAG}"

echo "▶ 更新 :latest"
docker tag "${IMAGE}:${TAG}" "${IMAGE}:latest"
docker push "${IMAGE}:latest"

cat <<EOF

✅ 已发布 ${TAG}
   digest 用 docker manifest inspect ${IMAGE}:${TAG} 查

把 dashboard-api 的 docker-compose.yml 里 alpha_mobile 的 image 换成：

    image: ${IMAGE}:${TAG}

服务器上执行：

    cd /data/api && docker-compose pull alpha_mobile && docker-compose up -d alpha_mobile

回滚就把上面那行换回上一版 tag，重新 pull + up。
EOF
