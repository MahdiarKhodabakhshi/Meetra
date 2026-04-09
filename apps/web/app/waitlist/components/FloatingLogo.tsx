'use client';

import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

export default function FloatingLogo({ visible }: { visible: boolean }) {
  const { scrollYProgress } = useScroll();

  /*
   * The logo travels from nav (top center) to section 2 (center of viewport).
   * Section 2 is a sticky 100vh so the text stays centered in the viewport.
   * That means we just need to go from top:24px → top:50% and shift left.
   *
   * The transform-origin is 'left baseline' so scale grows rightward from Meet.
   * We use translateY(-50%) at the end so top:50% actually centers it.
   */

  // Vertical: nav → center of viewport
  const topPercent = useTransform(scrollYProgress, [0.05, 0.5], [0, 42]);
  const topVal = useMotionTemplate`calc(${topPercent}vh + 12px)`;

  // Scale
  const scale = useTransform(scrollYProgress, [0.05, 0.5], [1, 2.55]);

  // Shift left to align with invisible "Meet" gap in the sentence
  const xEm = useTransform(scrollYProgress, [0.05, 0.5], [0, -16.4]);
  const xVal = useMotionTemplate`calc(-50% + ${xEm}em)`;

  // "ra" peels off
  const raOpacity = useTransform(scrollYProgress, [0.6, 0.8], [1, 0]);
  const raXOffset = useTransform(scrollYProgress, [0.6, 0.8], [0, 30]);
  const raBlurVal = useTransform(scrollYProgress, [0.6, 0.8], [0, 12]);
  const raFilter = useMotionTemplate`blur(${raBlurVal}px)`;

  if (!visible) return null;

  return (
    <motion.div
      className="fixed z-50 pointer-events-none left-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        top: topVal,
        x: xVal,
      }}
    >
      <motion.div
        className="flex items-baseline select-none origin-left"
        style={{ scale }}
      >
        <span
          className="font-[family-name:var(--font-playfair)] font-semibold tracking-[-0.02em] leading-none text-white"
          style={{ fontSize: '22px' }}
        >
          Meet
        </span>
        <motion.span
          className="font-[family-name:var(--font-playfair)] font-semibold tracking-[-0.02em] leading-none text-[#60A5FA]"
          style={{
            fontSize: '22px',
            opacity: raOpacity,
            x: raXOffset,
            filter: raFilter,
          }}
        >
          ra
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
