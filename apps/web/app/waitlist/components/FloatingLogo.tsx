'use client';

import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

/**
 * The ONE "Meetra" on the page. Fixed position, z-50.
 *
 * Hero: sits at very top center (like a nav logo).
 * On scroll: descends to section 2 center, scales up, "ra" peels off,
 * "Meet" docks into "Meeting the right people".
 */
export default function FloatingLogo({ visible }: { visible: boolean }) {
  const { scrollYProgress } = useScroll();

  // Position: very top → vertically centered in viewport
  const top = useTransform(scrollYProgress, [0.05, 0.3], ['24px', '50%']);

  // Scale: nav size (22px) → headline size (~3.5rem ≈ 56px → 56/22 ≈ 2.55)
  const scale = useTransform(scrollYProgress, [0.05, 0.3], [1, 2.55]);

  // Horizontal: starts centered, shifts left to align "Meet" with sentence gap
  const xShift = useTransform(scrollYProgress, [0.05, 0.3], ['0px', '-4em']);

  // "ra" peels off
  const raOpacity = useTransform(scrollYProgress, [0.22, 0.38], [1, 0]);
  const raXOffset = useTransform(scrollYProgress, [0.22, 0.38], [0, 24]);
  const raBlurVal = useTransform(scrollYProgress, [0.22, 0.38], [0, 10]);
  const raFilter = useMotionTemplate`blur(${raBlurVal}px)`;

  if (!visible) return null;

  return (
    <motion.div
      className="fixed z-50 pointer-events-none left-1/2"
      style={{
        top,
        x: '-50%',
        marginLeft: xShift,
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
