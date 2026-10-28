import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function PawIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <ellipse cx="6.8" cy="8.4" rx="1.9" ry="2.4" />
      <ellipse cx="11.9" cy="6.7" rx="1.9" ry="2.6" />
      <ellipse cx="17" cy="8.4" rx="1.9" ry="2.4" />
      <path d="M11.9 11.4c2.9 0 5.3 2.1 5.3 4.5 0 1.9-1.5 3.3-3.4 3.3-.9 0-1.3-.4-1.9-.4s-1 .4-1.9.4c-1.9 0-3.4-1.4-3.4-3.3 0-2.4 2.4-4.5 5.3-4.5Z" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true" {...props}>
      <path d="M12 21s6.5-5.4 6.5-10a6.5 6.5 0 1 0-13 0C5.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.8" r="2.4" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true" {...props}>
      <path d="M20 12.4c0 3.7-3.6 6.7-8 6.7-1 0-2-.2-2.9-.5L5 20l1.2-3.2A6.3 6.3 0 0 1 4 12.4C4 8.7 7.6 5.7 12 5.7s8 3 8 6.7Z" />
      <path d="M9 12.3h.01M12 12.3h.01M15 12.3h.01" />
    </svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.8v5.4M12 16.4h.01" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true" {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true" {...props}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function MiniProgramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true" {...props}>
      <rect x="3.5" y="3.5" width="12" height="12" rx="3" />
      <path d="M9 20.5h8a3.5 3.5 0 0 0 3.5-3.5v-8" />
      <circle cx="9.5" cy="9.5" r="1.6" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true" {...props}>
      <path d="M12 20s-7-4.4-7-9.3A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7 3.1C19 15.6 12 20 12 20Z" />
    </svg>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true" {...props}>
      <path d="M9 4.5 3.5 6.8v12.7L9 17.2l6 2.3 5.5-2.3V4.5L15 6.8 9 4.5Z" />
      <path d="M9 4.5v12.7M15 6.8v12.7" />
    </svg>
  );
}
