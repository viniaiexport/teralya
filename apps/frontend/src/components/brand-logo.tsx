import type { SVGProps } from 'react';

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

function Mark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" className="brand-mark" viewBox="0 0 48 48" {...props}>
      <defs>
        <linearGradient id="teralya-orange" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffb23f"/>
          <stop offset="1" stopColor="#ff6b45"/>
        </linearGradient>
        <linearGradient id="teralya-pink" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ff4b8b"/>
          <stop offset="1" stopColor="#d638f1"/>
        </linearGradient>
        <linearGradient id="teralya-purple" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#a737ff"/>
          <stop offset="1" stopColor="#6641ff"/>
        </linearGradient>
        <linearGradient id="teralya-blue" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#5666ff"/>
          <stop offset="1" stopColor="#2f96df"/>
        </linearGradient>
      </defs>
      <rect fill="url(#teralya-orange)" height="17" rx="4" transform="rotate(45 24 10.4)" width="17" x="15.5" y="1.9"/>
      <rect fill="url(#teralya-pink)" height="17" rx="4" transform="rotate(45 37.6 24)" width="17" x="29.1" y="15.5"/>
      <rect fill="url(#teralya-purple)" height="17" rx="4" transform="rotate(45 24 37.6)" width="17" x="15.5" y="29.1"/>
      <rect fill="url(#teralya-blue)" height="17" rx="4" transform="rotate(45 10.4 24)" width="17" x="1.9" y="15.5"/>
    </svg>
  );
}

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <span className={['brand-lockup', className].filter(Boolean).join(' ')}>
      <Mark/>
      {compact ? null : <span className="brand-word">TERALYA</span>}
    </span>
  );
}
