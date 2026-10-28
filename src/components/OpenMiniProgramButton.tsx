'use client';

import type { ReactNode } from 'react';

/** 任意位置的按钮都能唤起同一个小程序码浮层，避免每个卡片各挂一份状态 */
export default function OpenMiniProgramButton({
  children,
  className = 'mp-btn',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event('alpha:open-mp'))}
    >
      {children}
    </button>
  );
}
