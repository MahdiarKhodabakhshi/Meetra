'use client';

import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

/**
 * The ONE "Meetra" on the page. Fixed position, z-50.
 *
 * - Hero phase: sits at top center as the nav logo (always visible)
 * - As user scrolls past hero: physically moves down toward section 2
 *   and scales up to match the sentence font size
 * - "ra" peels off with blur as it approaches the docking position
 * - "Meet" lands perfectly aligned with "ing the right people"
 */
export default function FloatingLogo({ visible }: { visible: boolean }) {
  const { scrollYProgress } = useScroll();

  // Position: nav top → sentence center
  const top = useTransform(scrollYProgress, [0.05, 0.25], ['32px', '46vh']);

  // Scale: 1 (22px nav) → scaled to match ~3.5rem headline
  const scale = useTransform(scrollYProgress, [0.05, 0.25], [1, 2.55]);

  // Horizontal offset: centered → shift left to align with gap in sentence
  const x = useTransform(scrollYProgress, [0.05, 0.25], ['0%', '-3.2em']);

  // "ra" fades out — slower, more dramatic
  const raOpacity = useTransform(scrollYProgress, [0.2, 0.34], [1, 0]);
  const raXOffset = useTransform(scrollYProgress, [0.2, 0.34], [0, 24]);
  const raBlurVal = useTransform(scrollYProgress, [0.2, 0.34], [0, 10]);
  const raFilter = useMotionTemplate`blur(${raBlurVal}px)`;

  // All hooks above — safe to conditionally render below
  if (!visible) return null;

  return (
    <motion.div
      className="fixed z-50 pointer-events-none"
      style={{
        top,
        left: '50%',
        x: '-50%',
        translateX: x,
      }}
    >
      <motion.div
        className="flex items-baseline select-none"
        style={{ scale, transformOrigin: 'left baseline' }}
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
