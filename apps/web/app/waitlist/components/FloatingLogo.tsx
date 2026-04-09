'use client';

import { useState, useRef, useEffect, type RefObject } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

interface Props {
  visible: boolean;
  /** Ref to the invisible "Meet" span in section 2 — we snap to its position */
  meetGapRef: RefObject<HTMLSpanElement | null>;
  /** Ref to the section 2 container — we scope scroll tracking to it */
  sectionRef: RefObject<HTMLDivElement | null>;
}

export default function FloatingLogo({ visible, meetGapRef, sectionRef }: Props) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const [locked, setLocked] = useState(false);
  const [lockPos, setLockPos] = useState<{ top: number; left: number } | null>(null);

  // Animated (non-locked) styles
  const [styles, setStyles] = useState({
    top: 24,
    left: 0,
    scale: 1,
    raOpacity: 1,
    raX: 0,
    raBlur: 0,
  });

  // Read the gap position on scroll to know where to lock
  const readGapPosition = () => {
    if (!meetGapRef.current) return null;
    const rect = meetGapRef.current.getBoundingClientRect();
    return { top: rect.top, left: rect.left };
  };

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    console.log(`[FloatingLogo] section scroll: ${(v * 100).toFixed(1)}%`);

    // Lock when section is ~40% scrolled in
    if (v >= 0.4 && !locked) {
      const pos = readGapPosition();
      if (pos) {
        setLockPos(pos);
        setLocked(true);
      }
    }

    // Unlock if scrolling back
    if (v < 0.3 && locked) {
      setLocked(false);
      setLockPos(null);
    }

    if (!locked) {
      // Animate from nav position toward center
      // v goes 0→1 as section scrolls through viewport
      // We want the animation to happen roughly 0.1 → 0.4
      const t = Math.min(Math.max((v - 0.1) / 0.3, 0), 1);

      // Read where the gap currently is for the target
      const gapPos = readGapPosition();
      const targetTop = gapPos ? gapPos.top : window.innerHeight * 0.4;
      const targetLeft = gapPos ? gapPos.left : window.innerWidth * 0.3;

      setStyles({
        top: lerp(24, targetTop, t),
        left: lerp(window.innerWidth / 2 - 30, targetLeft, t),
        scale: lerp(1, 2.55, t),
        raOpacity: 1 - Math.min(Math.max((v - 0.25) / 0.15, 0), 1),
        raX: lerp(0, 30, Math.min(Math.max((v - 0.25) / 0.15, 0), 1)),
        raBlur: lerp(0, 12, Math.min(Math.max((v - 0.25) / 0.15, 0), 1)),
      });
    }
  });

  // Update lock position on resize
  useEffect(() => {
    if (!locked) return;
    const update = () => {
      const pos = readGapPosition();
      if (pos) setLockPos(pos);
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [locked]);

  if (!visible) return null;

  const pos = locked && lockPos ? lockPos : { top: styles.top, left: styles.left };
  const scale = locked ? 2.55 : styles.scale;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'left top',
        transition: locked ? 'none' : undefined,
      }}
    >
      <div className="flex items-baseline select-none">
        <span
          className="font-[family-name:var(--font-playfair)] font-semibold tracking-[-0.02em] leading-none text-white"
          style={{ fontSize: '22px' }}
        >
          Meet
        </span>
        <span
          className="font-[family-name:var(--font-playfair)] font-semibold tracking-[-0.02em] leading-none text-[#60A5FA]"
          style={{
            fontSize: '22px',
            opacity: locked ? 0 : styles.raOpacity,
            transform: `translateX(${locked ? 30 : styles.raX}px)`,
            filter: `blur(${locked ? 12 : styles.raBlur}px)`,
          }}
        >
          ra
        </span>
      </div>
    </div>
  );
}
