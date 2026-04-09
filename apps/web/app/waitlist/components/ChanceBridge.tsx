'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ChanceBridge() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // ── Text: visible at start, fades out as image takes over ──
  const textOpacity = useTransform(scrollYProgress, [0, 0.15, 0.35], [1, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.9]);

  // ── Image: starts invisible, fades in small, then zooms to fill + beyond ──
  const imgOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);
  const imgScale = useTransform(scrollYProgress, [0.1, 0.5, 1.0], [0.3, 1, 1.15]);

  // ── Overlay text: appears once image is full-bleed ──
  const ol1Opacity = useTransform(scrollYProgress, [0.55, 0.65], [0, 1]);
  const ol1Y = useTransform(scrollYProgress, [0.55, 0.65], [20, 0]);
  const ol2Opacity = useTransform(scrollYProgress, [0.63, 0.73], [0, 1]);
  const ol2Y = useTransform(scrollYProgress, [0.63, 0.73], [14, 0]);

  // ── Everything fades out at the end ──
  const fadeOut = useTransform(scrollYProgress, [0.88, 1], [1, 0]);

  return (
    <div ref={ref} className="relative bg-[#0A0F1C]" style={{ height: '300vh' }}>
      <motion.div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ opacity: fadeOut }}
      >
        {/* ── Image layer ── */}
        <motion.div
          className="absolute inset-0 z-0 origin-center"
          style={{ opacity: imgOpacity, scale: imgScale }}
        >
          <img
            src="/connect.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0A0F1C]/30" />
        </motion.div>

        {/* ── Big text — centered, fades out ── */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ opacity: textOpacity, scale: textScale }}
        >
          <div className="text-center px-6">
            <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,7vw,6.5rem)] font-medium tracking-[-0.03em] leading-[1.1] text-white">
              We engineer the
            </h2>
            <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,7vw,6.5rem)] font-medium tracking-[-0.03em] leading-[1.1] text-[#60A5FA]">
              moment.
            </h2>
          </div>
        </motion.div>

        {/* ── Overlay text on full image ── */}
        <div className="absolute inset-0 z-20 flex items-end pointer-events-none">
          <div className="px-8 sm:px-14 pb-14 sm:pb-20 max-w-xl">
            <motion.p
              className="text-[15px] text-white/75 leading-relaxed"
              style={{ opacity: ol1Opacity, y: ol1Y }}
            >
              Before you walk in, Meetra has already found the people worth
              meeting — matched on your goals, your background, and what
              you&apos;re building.
            </motion.p>
            <motion.p
              className="mt-3 text-[13px] text-white/40"
              style={{ opacity: ol2Opacity, y: ol2Y }}
            >
              AI-powered matching · Curated events · Real conversations
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
