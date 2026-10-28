/**
 * Next 的 standalone 产物不含静态资源，必须自己搬。
 * Dockerfile 里也走同一份逻辑，本地 npm run build && npm start 才能跑出和线上一样的站点。
 */
import { cp, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const standalone = path.join(root, '.next', 'standalone');

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function copy(from, to) {
  if (!(await exists(from))) return;
  await cp(from, to, { recursive: true });
  console.log(`[standalone] ${path.relative(root, from)} -> ${path.relative(root, to)}`);
}

if (!(await exists(standalone))) {
  console.error('[standalone] 未找到 .next/standalone，检查 next.config.ts 的 output 配置');
  process.exit(1);
}

await copy(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'));
await copy(path.join(root, 'public'), path.join(standalone, 'public'));
