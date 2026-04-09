'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

/**
 * Section 2 — sentence waits for "Meet" to dock into it.
 * Text starts blurry and clears when Meet snaps into place.
 */
export default function ProblemStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Text blur: starts blurry, clears as Meet arrives (~0.3 scroll)
  const blurVal = useTransform(scrollYProgress, [0.15, 0.32], [10, 0]);
  const textFilter = useMotionTemplate`blur(${blurVal}px)`;
  const textOpacity = useTransform(scrollYProgress, [0.15, 0.32], [0.4, 1]);

  return (
    <section
      ref={ref}
      id="problem"
      className="relative bg-[#0A0F1C] flex items-center justify-center"
      style={{ height: '100vh' }}
    >
      <div className="px-6 max-w-4xl text-center">
        <motion.h2
          className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.2vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.3]"
          style={{ filter: textFilter, opacity: textOpacity }}
        >
          <span className="text-white">
            <span className="invisible inline">Meet</span>
            <span>ing the right people</span>
          </span>
          <br />
          <span className="text-white/50">{`shouldn\u2019t be left to chance.`}</span>
        </motion.h2>
      </div>
    </section>
  );
}
