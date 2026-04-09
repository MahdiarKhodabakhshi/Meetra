'use client';

import { useState, type RefObject } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

interface Props {
  visible: boolean;
  sectionRef: RefObject<HTMLDivElement | null>;
  /** Called when Meet should dock (section 2 text takes over) */
  onDock: () => void;
  onUndock: () => void;
}

export default function FloatingLogo({ visible, sectionRef, onDock, onUndock }: Props) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const [docked, setDocked] = useState(false);
  const [progress, setProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setProgress(v);

    // Dock at 35% section scroll
    if (v >= 0.35 && !docked) {
      setDocked(true);
      onDock();
    }
    // Undock if scrolling back
    if (v < 0.25 && docked) {
      setDocked(false);
      onUndock();
    }
  });

  if (!visible || docked) return null;

  // Animation: 0 → 0.35 of section scroll
  const t = Math.min(Math.max(progress / 0.35, 0), 1);

  // Start: top center (nav position). End: lower and slightly left
  // Using viewport-relative positioning
  const top = 24 + t * (window.innerHeight * 0.38 - 24);
  const centerX = window.innerWidth / 2;
  // Shift left as it descends
  const left = centerX - 30 + t * (-centerX * 0.15);
  const scale = 1 + t * 1.55; // 1 → 2.55

  // Ra fades in the last third of the animation
  const raT = Math.min(Math.max((t - 0.6) / 0.4, 0), 1);

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'left top',
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
            opacity: 1 - raT,
            transform: `translateX(${raT * 20}px)`,
            filter: `blur(${raT * 10}px)`,
          }}
        >
          ra
        </span>
      </div>
    </div>
  );
}
