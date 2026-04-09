'use client';

import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

const LOCK_AT = 0.814;

export default function FloatingLogo({ visible }: { visible: boolean }) {
  const { scrollYProgress } = useScroll();

  const [styles, setStyles] = useState({
    topVh: 0,
    scale: 1,
    xEm: 0,
    raOpacity: 1,
    raX: 0,
    raBlur: 0,
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    // Hard clamp — nothing ever changes past LOCK_AT
    const clamped = Math.min(v, LOCK_AT);

    const t = (clamped - 0.05) / (LOCK_AT - 0.05);
    const topVh = lerp(0, 22.4, t);
    const scale = lerp(1, 2.55, t);
    const xEm = lerp(0, -16.4, t);

    const raT = (clamped - 0.7) / (0.85 - 0.7);
    const raOpacity = 1 - raT;
    const raX = raT * 30;
    const raBlur = raT * 12;

    setStyles({ topVh, scale, xEm, raOpacity, raX, raBlur });
  });

  if (!visible) return null;

  return (
    <motion.div
      className="fixed z-50 pointer-events-none left-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        top: `calc(${styles.topVh}vh + 12px)`,
        transform: `translateX(calc(-50% + ${styles.xEm}em))`,
        willChange: 'transform',
      }}
    >
      <div
        className="flex items-baseline select-none origin-left"
        style={{ transform: `scale(${styles.scale})` }}
      >
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
            opacity: styles.raOpacity,
            transform: `translateX(${styles.raX}px)`,
            filter: `blur(${styles.raBlur}px)`,
          }}
        >
          ra
        </span>
      </div>
    </motion.div>
  );
}
