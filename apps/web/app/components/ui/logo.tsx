'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  /** Pixel height of the icon — width auto-scales to 3:2 ratio */
  iconHeight?: number;
  linkTo?: string;
  showText?: boolean;
  textClass?: string;
  className?: string;
  /** Extra classes on the icon image (e.g. drop-shadow) */
  iconClassName?: string;
  /** Use white "Meet" text (for dark backgrounds) */
  lightText?: boolean;
}

export function Logo({
  iconHeight = 28,
  linkTo,
  showText = true,
  textClass = 'text-lg',
  className = '',
  iconClassName = '',
  lightText = false,
}: LogoProps) {
  // SVG native ratio is 1536×1024 → 3:2
  const iconWidth = Math.round(iconHeight * 1.5);

  const content = (
    <span className={`inline-flex items-center ${className || 'gap-2'}`}>
      <Image
        src="/meetra_logo.svg"
        alt="Meetra"
        width={iconWidth}
        height={iconHeight}
        className={`object-contain ${iconClassName}`}
        priority
        unoptimized
      />
      {showText && (
        <span className={`font-semibold tracking-tight ${textClass}`}>
          <span className={lightText ? 'text-white' : 'text-[var(--foreground)]'}>Meet</span>
          <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
            ra
          </span>
        </span>
      )}
    </span>
  );

  if (linkTo) {
    return (
      <Link href={linkTo} className="no-underline hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
