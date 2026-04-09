'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

export default function ProblemStatement() {
  const { scrollYProgress } = useScroll();
  const textRef = useRef<HTMLSpanElement>(null);

  // Log the position of "ing" text so we can align Meet to it
  useEffect(() => {
    const log = () => {
      if (textRef.current) {
        const rect = textRef.current.getBoundingClientRect();
        console.log(`[ProblemText] top: ${rect.top.toFixed(1)}px, left: ${rect.left.toFixed(1)}px`);
      }
    };
    window.addEventListener('scroll', log, { passive: true });
    log();
    return () => window.removeEventListener('scroll', log);
  }, []);

  // Text blur: blurry → sharp at 91.7%
  const blurVal = useTransform(scrollYProgress, [0.7, 0.917], [8, 0]);
  const textFilter = useMotionTemplate`blur(${blurVal}px)`;
  const textOpacity = useTransform(scrollYProgress, [0.7, 0.917], [0.3, 1]);

  return (
    <section
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
            <span ref={textRef}>ing the right people</span>
          </span>
          <br />
          <span className="text-white/50">{`shouldn\u2019t be left to chance.`}</span>
        </motion.h2>
      </div>
    </section>
  );
}
