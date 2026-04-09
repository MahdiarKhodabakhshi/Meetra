'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

export default function ProblemStatement() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  /*
   * The "Meetra" starts at the top center (where the nav logo was).
   * As user scrolls:
   *   0.0–0.15: Meetra visible at top, section fades in
   *   0.15–0.30: Meetra moves down toward center, scales up
   *   0.25–0.35: "ra" blurs out and fades
   *   0.30–0.40: "Meet" becomes white, sentence text fades in around it
   *   0.40+: holds
   */

  // Section fade in
  const sectionOpacity = useTransform(scrollYProgress, [0.0, 0.1], [0, 1]);

  // Logo position: top → center
  const logoY = useTransform(scrollYProgress, [0.08, 0.3], ['0vh', '38vh']);

  // Logo scale: nav size → headline size
  const logoScale = useTransform(scrollYProgress, [0.08, 0.3], [1, 2.8]);

  // "ra" disappears
  const raOpacity = useTransform(scrollYProgress, [0.22, 0.33], [1, 0]);
  const raX = useTransform(scrollYProgress, [0.22, 0.33], [0, 20]);
  const raBlurVal = useTransform(scrollYProgress, [0.22, 0.33], [0, 10]);
  const raFilter = useMotionTemplate`blur(${raBlurVal}px)`;

  // "Meet" color: black → white
  const meetR = useTransform(scrollYProgress, [0.25, 0.38], [15, 248]);
  const meetG = useTransform(scrollYProgress, [0.25, 0.38], [23, 250]);
  const meetB = useTransform(scrollYProgress, [0.25, 0.38], [42, 252]);
  const meetColor = useMotionTemplate`rgb(${meetR},${meetG},${meetB})`;

  // "ra" blue fading
  const raColor = useTransform(
    scrollYProgress,
    [0.22, 0.33],
    ['rgba(96,165,250,1)', 'rgba(96,165,250,0)']
  );

  // Sentence parts fade in
  const suffixOpacity = useTransform(scrollYProgress, [0.3, 0.42], [0, 1]);
  const suffixBlurVal = useTransform(scrollYProgress, [0.3, 0.42], [8, 0]);
  const suffixFilter = useMotionTemplate`blur(${suffixBlurVal}px)`;
  const suffixY = useTransform(scrollYProgress, [0.3, 0.42], [16, 0]);

  const line2Opacity = useTransform(scrollYProgress, [0.36, 0.48], [0, 1]);
  const line2BlurVal = useTransform(scrollYProgress, [0.36, 0.48], [8, 0]);
  const line2Filter = useMotionTemplate`blur(${line2BlurVal}px)`;
  const line2Y = useTransform(scrollYProgress, [0.36, 0.48], [20, 0]);

  return (
    <div ref={sectionRef} className="relative bg-[#0A0F1C]" style={{ height: '200vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-start justify-center">
        <motion.div
          className="w-full text-center"
          style={{ opacity: sectionOpacity }}
        >
          {/* ── The "Meetra" logo that descends and transforms ── */}
          <motion.div
            className="flex items-baseline justify-center select-none"
            style={{
              y: logoY,
              scale: logoScale,
              transformOrigin: 'center top',
            }}
          >
            <motion.span
              className="font-[family-name:var(--font-playfair)] font-semibold tracking-[-0.02em] leading-none"
              style={{ fontSize: '22px', color: meetColor }}
            >
              Meet
            </motion.span>
            <motion.span
              className="font-[family-name:var(--font-playfair)] font-semibold tracking-[-0.02em] leading-none"
              style={{
                fontSize: '22px',
                color: raColor,
                opacity: raOpacity,
                x: raX,
                filter: raFilter,
              }}
            >
              ra
            </motion.span>
          </motion.div>

          {/* ── The sentence that forms around "Meet" ── */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center px-6"
          >
            <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.2] max-w-3xl">
              {/* Line 1: "Meeting the right people" */}
              <span className="inline-flex items-baseline flex-wrap justify-center">
                {/* "Meet" — invisible placeholder, the animated logo covers this */}
                <span className="invisible">Meet</span>
                <motion.span
                  className="text-white"
                  style={{
                    opacity: suffixOpacity,
                    filter: suffixFilter,
                    y: suffixY,
                    display: 'inline-block',
                  }}
                >
                  ing the right people
                </motion.span>
              </span>
              <br />
              {/* Line 2: "shouldn't be left to chance." */}
              <motion.span
                className="text-white/60"
                style={{
                  opacity: line2Opacity,
                  filter: line2Filter,
                  y: line2Y,
                  display: 'inline-block',
                }}
              >
                {`shouldn\u2019t be left to chance.`}
              </motion.span>
            </h2>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
