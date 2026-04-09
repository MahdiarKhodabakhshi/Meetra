'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

/**
 * The ONE "Meetra" logo that exists on the entire page.
 * - Starts as the nav logo in the hero (top center, small)
 * - As user scrolls past the hero into section 2, it physically moves
 *   down to the center of the viewport and scales up
 * - "ra" peels off with blur
 * - "Meet" becomes white and the sentence forms around it
 *
 * This component is rendered at the PAGE level with fixed positioning
 * so it can travel across sections.
 */
export default function FloatingLogo() {
  const ref = useRef<HTMLDivElement>(null);

  // Track scroll across the entire page
  const { scrollYProgress } = useScroll();

  /*
   * Scroll timeline (based on page scroll):
   * 0.0        : hero is fully visible, logo at top center (nav position)
   * 0.0–0.08   : hero scrolls, logo stays at top (fixed)
   * 0.08–0.22  : logo moves from top to center of viewport, scales up
   * 0.18–0.28  : "ra" blurs out, slides right, fades
   * 0.22–0.32  : "Meet" color goes from dark/blue to white
   * 0.28–0.38  : "ing the right people" fades in
   * 0.34–0.44  : "shouldn't be left to chance." fades in
   * 0.44+      : holds
   */

  // Vertical position: top → center
  const y = useTransform(scrollYProgress, [0.06, 0.22], ['8vh', '42vh']);

  // Scale: nav size → large headline
  const scale = useTransform(scrollYProgress, [0.06, 0.22], [1, 3]);

  // "ra" fade out
  const raOpacity = useTransform(scrollYProgress, [0.16, 0.26], [1, 0]);
  const raX = useTransform(scrollYProgress, [0.16, 0.26], [0, 24]);
  const raBlurVal = useTransform(scrollYProgress, [0.16, 0.26], [0, 10]);
  const raFilter = useMotionTemplate`blur(${raBlurVal}px)`;

  // "Meet" color transition: #0F172A (dark) → white
  // During hero phase it shows as white on dark bg, then stays white
  const meetR = useTransform(scrollYProgress, [0.0, 0.01], [255, 255]);
  const meetG = useTransform(scrollYProgress, [0.0, 0.01], [255, 255]);
  const meetB = useTransform(scrollYProgress, [0.0, 0.01], [255, 255]);
  const meetColor = useMotionTemplate`rgb(${meetR},${meetG},${meetB})`;

  // "ra" starts as blue, stays blue until it fades
  // (handled by raOpacity above)

  // Suffix: "ing the right people"
  const suffixOpacity = useTransform(scrollYProgress, [0.26, 0.36], [0, 1]);
  const suffixBlurVal = useTransform(scrollYProgress, [0.26, 0.36], [8, 0]);
  const suffixFilter = useMotionTemplate`blur(${suffixBlurVal}px)`;

  // Line 2: "shouldn't be left to chance."
  const line2Opacity = useTransform(scrollYProgress, [0.32, 0.42], [0, 1]);
  const line2BlurVal = useTransform(scrollYProgress, [0.32, 0.42], [8, 0]);
  const line2Filter = useMotionTemplate`blur(${line2BlurVal}px)`;
  const line2Y = useTransform(scrollYProgress, [0.32, 0.42], [14, 0]);

  // Overall visibility: visible once hero intro animation is done
  // The hero sets phase to 'hero' which shows the nav logo — we take over from there
  const logoOpacity = useTransform(scrollYProgress, [0.0, 0.02], [0, 1]);

  return (
    <motion.div
      ref={ref}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex justify-center"
      style={{ opacity: logoOpacity }}
    >
      <motion.div
        className="flex flex-col items-center"
        style={{ y, scale, transformOrigin: 'center top' }}
      >
        {/* Logo row: Meet + ra */}
        <div className="flex items-baseline select-none">
          <motion.span
            className="font-[family-name:var(--font-playfair)] font-semibold tracking-[-0.02em] leading-none"
            style={{ fontSize: '22px', color: meetColor }}
          >
            Meet
          </motion.span>
          <motion.span
            className="font-[family-name:var(--font-playfair)] font-semibold tracking-[-0.02em] text-[#60A5FA] leading-none"
            style={{
              fontSize: '22px',
              opacity: raOpacity,
              x: raX,
              filter: raFilter,
            }}
          >
            ra
          </motion.span>
        </div>

        {/* Sentence parts that fade in around "Meet" */}
        <motion.div
          className="flex flex-col items-center mt-1"
          style={{ opacity: suffixOpacity }}
        >
          {/* "ing the right people" — same line as Meet visually */}
          <motion.span
            className="font-[family-name:var(--font-playfair)] font-medium text-white tracking-[-0.02em] leading-none"
            style={{
              fontSize: '22px',
              filter: suffixFilter,
            }}
          >
            ing the right people
          </motion.span>

          {/* "shouldn't be left to chance." */}
          <motion.span
            className="font-[family-name:var(--font-playfair)] font-medium text-white/50 tracking-[-0.02em] leading-none mt-2"
            style={{
              fontSize: '22px',
              opacity: line2Opacity,
              filter: line2Filter,
              y: line2Y,
            }}
          >
            {`shouldn\u2019t be left to chance.`}
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
