'use client';

import { useState } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValueEvent } from 'framer-motion';

export default function FloatingLogo({ visible }: { visible: boolean }) {
  const { scrollYProgress } = useScroll();
  const [locked, setLocked] = useState(false);

  // Log scroll progress
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    console.log(`[FloatingLogo] scroll: ${(v * 100).toFixed(1)}%`);
    if (v >= 0.917 && !locked) {
      setLocked(true);
    }
  });

  // Scroll-driven values (only used before lock)
  const topAnimated = useTransform(scrollYProgress, [0.05, 0.917], ['12px', '254px']);
  const scaleAnimated = useTransform(scrollYProgress, [0.05, 0.917], [1, 2.55]);
  const xShiftAnimated = useTransform(scrollYProgress, [0.05, 0.917], ['0px', '-16.4em']);

  // "ra" peels off
  const raOpacity = useTransform(scrollYProgress, [0.6, 0.8], [1, 0]);
  const raXOffset = useTransform(scrollYProgress, [0.6, 0.8], [0, 30]);
  const raBlurVal = useTransform(scrollYProgress, [0.6, 0.8], [0, 12]);
  const raFilter = useMotionTemplate`blur(${raBlurVal}px)`;

  if (!visible) return null;

  return (
    <motion.div
      className="fixed z-50 pointer-events-none left-1/2"
      style={
        locked
          ? { top: '254px', x: '-50%', marginLeft: '-16.4em' }
          : { top: topAnimated, x: '-50%', marginLeft: xShiftAnimated }
      }
    >
      <motion.div
        className="flex items-baseline select-none origin-left"
        style={locked ? { scale: 2.55 } : { scale: scaleAnimated }}
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
            opacity: locked ? 0 : raOpacity,
            x: locked ? 30 : raXOffset,
            filter: locked ? 'blur(12px)' : raFilter,
          }}
        >
          ra
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
