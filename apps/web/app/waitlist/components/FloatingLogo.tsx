'use client';

import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

export default function FloatingLogo({ visible }: { visible: boolean }) {
  const { scrollYProgress } = useScroll();

  // Position: very top of page → vertically centered
  const top = useTransform(scrollYProgress, [0.05, 0.3], ['12px', '50%']);

  // Scale: nav size → headline size
  const scale = useTransform(scrollYProgress, [0.05, 0.3], [1, 2.55]);

  // Shift left more to align with "ing"
  const xShift = useTransform(scrollYProgress, [0.05, 0.3], ['0px', '-16em']);

  // "ra" peels off — starts late, takes a long time
  const raOpacity = useTransform(scrollYProgress, [0.55, 0.75], [1, 0]);
  const raXOffset = useTransform(scrollYProgress, [0.55, 0.75], [0, 30]);
  const raBlurVal = useTransform(scrollYProgress, [0.55, 0.75], [0, 12]);
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
