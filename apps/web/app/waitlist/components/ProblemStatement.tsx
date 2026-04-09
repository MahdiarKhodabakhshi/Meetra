'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

export default function ProblemStatement() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  /*
   * Timeline (as section scrolls into view):
   * 0.0 - 0.15  : "Meetra" logo visible at top, starts descending
   * 0.15 - 0.30 : "ra" fades out + peels off, "Meet" reaches sentence position
   * 0.25 - 0.40 : "Meet" color transitions from brand to white
   * 0.30 - 0.50 : rest of sentence fades in around "Meet"
   * 0.50+       : everything holds
   */

  // "Meetra" logo — starts at nav position, moves down to sentence center
  const logoY = useTransform(scrollYProgress, [0.05, 0.28], [0, 0]);
  const logoTop = useTransform(scrollYProgress, [0.05, 0.28], ['8%', '46%']);
  const logoScale = useTransform(scrollYProgress, [0.05, 0.28], [1, 2.2]);

  // "ra" fades and slides right
  const raOpacity = useTransform(scrollYProgress, [0.12, 0.25], [1, 0]);
  const raX = useTransform(scrollYProgress, [0.12, 0.25], [0, 30]);
  const raBlur = useTransform(scrollYProgress, [0.12, 0.25], [0, 8]);
  const raFilter = useMotionTemplate`blur(${raBlur}px)`;

  // "Meet" color: from brand black → white
  const meetColorR = useTransform(scrollYProgress, [0.2, 0.38], [15, 255]);
  const meetColorG = useTransform(scrollYProgress, [0.2, 0.38], [23, 255]);
  const meetColorB = useTransform(scrollYProgress, [0.2, 0.38], [42, 255]);
  const meetColor = useMotionTemplate`rgb(${meetColorR}, ${meetColorG}, ${meetColorB})`;

  // "ra" blue color for initial state
  const raColorOpacity = useTransform(scrollYProgress, [0.12, 0.25], [1, 0]);

  // Rest of sentence fades in
  const sentenceOpacity = useTransform(scrollYProgress, [0.28, 0.42], [0, 1]);
  const sentenceY = useTransform(scrollYProgress, [0.28, 0.42], [20, 0]);
  const sentenceBlur = useTransform(scrollYProgress, [0.28, 0.42], [6, 0]);
  const sentenceFilter = useMotionTemplate`blur(${sentenceBlur}px)`;

  // "ing the right people" prefix — fades in slightly before the rest
  const prefixOpacity = useTransform(scrollYProgress, [0.25, 0.36], [0, 1]);
  const prefixBlur = useTransform(scrollYProgress, [0.25, 0.36], [6, 0]);
  const prefixFilter = useMotionTemplate`blur(${prefixBlur}px)`;

  // Whole section fade in
  const sectionOpacity = useTransform(scrollYProgress, [0.0, 0.08], [0, 1]);

  return (
    <div
      ref={sectionRef}
      className="relative bg-[#0A0F1C]"
      style={{ minHeight: '160vh' }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          className="relative w-full max-w-5xl mx-auto px-6 text-center"
          style={{ opacity: sectionOpacity }}
        >
          {/* The animated "Meetra" / "Meet" logo that descends */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 flex items-baseline z-10 pointer-events-none select-none"
            style={{
              top: logoTop,
              scale: logoScale,
              y: logoY,
            }}
          >
            {/* "Meet" */}
            <motion.span
              className="font-[family-name:var(--font-playfair)] font-medium tracking-[-0.03em] leading-none"
              style={{
                fontSize: '22px',
                color: meetColor,
              }}
            >
              Meet
            </motion.span>

            {/* "ra" — fades out and slides right */}
            <motion.span
              className="font-[family-name:var(--font-playfair)] font-medium tracking-[-0.03em] text-[#60A5FA] leading-none"
              style={{
                fontSize: '22px',
                opacity: raOpacity,
                x: raX,
                filter: raFilter,
              }}
            >
              ra
            </motion.span>
          </motion.div>

          {/* The sentence — "Meet" is invisible here (the animated one covers it) */}
          <div className="relative">
            <h2
              className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,4.5vw,3.8rem)] font-medium text-white tracking-[-0.025em] leading-[1.15]"
            >
              {/* Invisible "Meet" placeholder to hold space */}
              <span className="invisible">Meet</span>

              {/* "ing the right people" — fades in first */}
              <motion.span
                style={{
                  opacity: prefixOpacity,
                  filter: prefixFilter,
                }}
              >
                ing the right people
              </motion.span>

              {/* line break */}
              <br />

              {/* "shouldn't be left to chance." — fades in after */}
              <motion.span
                style={{
                  opacity: sentenceOpacity,
                  y: sentenceY,
                  filter: sentenceFilter,
                  display: 'inline-block',
                }}
              >
                {`shouldn\u2019t be left to chance.`}
              </motion.span>
            </h2>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
