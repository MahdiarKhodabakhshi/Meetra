'use client';

import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

export default function ProblemStatement() {
  const { scrollYProgress } = useScroll();

  // Text: blurry/dim → sharp/white when Meet locks at 81.4%
  const blurVal = useTransform(scrollYProgress, [0.75, 0.814], [8, 0]);
  const textFilter = useMotionTemplate`blur(${blurVal}px)`;
  const textOpacity = useTransform(scrollYProgress, [0.75, 0.814], [0.25, 1]);

  return (
    <div className="relative bg-[#0A0F1C]" style={{ height: '120vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center">
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
      </div>
    </div>
  );
}
