'use client';

import { useState, useCallback } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

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
    console.log(`[FloatingLogo] scroll: ${(v * 100).toFixed(1)}%`);

    // Clamp at 81.4% — nothing changes after this
    const clamped = Math.min(v, 0.814);

    // Position/scale: 0.05 → 0.814
    const t = Math.min(Math.max((clamped - 0.05) / (0.814 - 0.05), 0), 1);
    const topVh = lerp(0, 22.5, t);
    const scale = lerp(1, 2.55, t);
    const xEm = lerp(0, -16.4, t);

    // Ra: 0.7 → 0.85 (also clamped)
    const raT = Math.min(Math.max((clamped - 0.7) / (0.85 - 0.7), 0), 1);

    setStyles({
      topVh,
      scale,
      xEm,
      raOpacity: 1 - raT,
      raX: raT * 30,
      raBlur: raT * 12,
    });
  });

  if (!visible) return null;

  return (
    <motion.div
      className="fixed z-50 pointer-events-none left-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        top: `calc(${styles.topVh}vh + 12px)`,
        transform: `translateX(calc(-50% + ${styles.xEm}em))`,
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
