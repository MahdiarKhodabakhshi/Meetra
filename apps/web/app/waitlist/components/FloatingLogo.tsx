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

  // Hidden until hero intro is done
  if (!visible) return null;

  /*
   * Page scroll timeline:
   * 0.0–0.05  : logo at nav position (top center), hero visible
   * 0.05–0.25 : logo descends to center, scales up to sentence size
   * 0.18–0.28 : "ra" peels off
   * 0.25+     : "Meet" is docked, white, part of the sentence
   */

  // Position: nav top → sentence center
  // At nav: top 32px. At sentence: roughly center of viewport
  const top = useTransform(scrollYProgress, [0.05, 0.25], ['32px', '46vh']);

  // Scale: 1 (22px nav) → scaled to match ~3.5rem headline
  // 3.5rem / 22px ≈ 2.55
  const scale = useTransform(scrollYProgress, [0.05, 0.25], [1, 2.55]);

  // Horizontal offset: centered → shift left to align with gap in sentence
  // The sentence has "Meet" gap on the left, so logo needs to move left
  const x = useTransform(scrollYProgress, [0.05, 0.25], ['0%', '-3.2em']);

  // "ra" fades out — slower, more dramatic
  const raOpacity = useTransform(scrollYProgress, [0.2, 0.34], [1, 0]);
  const raXOffset = useTransform(scrollYProgress, [0.2, 0.34], [0, 24]);
  const raBlurVal = useTransform(scrollYProgress, [0.2, 0.34], [0, 10]);
  const raFilter = useMotionTemplate`blur(${raBlurVal}px)`;

  // "Meet" color: white throughout (it's on dark bg from hero onward)
  // But "ra" is blue until it fades
  // After docking, "Meet" should match the sentence text color (white)

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
