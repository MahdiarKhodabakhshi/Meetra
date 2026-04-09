'use client';

import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

export default function FloatingLogo({ visible }: { visible: boolean }) {
  const { scrollYProgress } = useScroll();

  // Position: very top → vertically centered — clamps at target
  const top = useTransform(scrollYProgress, [0.05, 0.28, 1], ['12px', '50%', '50%']);

  // Scale: nav size → headline size — clamps at target
  const scale = useTransform(scrollYProgress, [0.05, 0.28, 1], [1, 2.55, 2.55]);

  // Shift left — clamps at target
  const xShift = useTransform(scrollYProgress, [0.05, 0.28, 1], ['0px', '-16.4em', '-16.4em']);

  // "ra" peels off — starts late, takes a long time
  const raOpacity = useTransform(scrollYProgress, [0.6, 0.8], [1, 0]);
  const raXOffset = useTransform(scrollYProgress, [0.6, 0.8], [0, 30]);
  const raBlurVal = useTransform(scrollYProgress, [0.6, 0.8], [0, 12]);
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
