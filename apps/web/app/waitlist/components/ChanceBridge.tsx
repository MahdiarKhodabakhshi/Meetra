'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ChanceBridge() {
  const outerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start end', 'end start'],
  });

  // Visible range is ~0.22 to ~0.75
  // 0.22 = text centered on screen
  // 0.75 = section scrolling out

  // ── Text: visible from 0.22, fades out 0.35–0.45 ──
  const textOp = useTransform(scrollYProgress, [0.18, 0.22, 0.35, 0.45], [0, 1, 1, 0]);

  // ── Image: clip-path reveal from 0.28 to 0.52 ──
  const imgOp = useTransform(scrollYProgress, [0.28, 0.34], [0, 1]);
  const clipInset = useTransform(scrollYProgress, [0.28, 0.52], [30, 0]);

  // Slow zoom once image is full
  const imgZoom = useTransform(scrollYProgress, [0.52, 0.75], [1, 1.06]);

  // ── Overlay text: 0.54–0.66 ──
  const olOp = useTransform(scrollYProgress, [0.54, 0.62], [0, 1]);
  const olY = useTransform(scrollYProgress, [0.54, 0.62], [16, 0]);
  const ol2Op = useTransform(scrollYProgress, [0.60, 0.68], [0, 1]);
  const ol2Y = useTransform(scrollYProgress, [0.60, 0.68], [12, 0]);

  // ── Fade out: 0.70–0.78 ──
  const fadeOut = useTransform(scrollYProgress, [0.70, 0.78], [1, 0]);

  return (
    <div
      ref={outerRef}
      className="relative bg-[#0A0F1C]"
      style={{ height: '300vh' }}
    >
      <motion.div
        className="sticky top-0 h-screen overflow-hidden bg-[#0A0F1C]"
        style={{ opacity: fadeOut }}
      >
        {/* ── Image — clipPath inset reveal ── */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            opacity: imgOp,
            scale: imgZoom,
            clipPath: useTransform(clipInset, (v) => `inset(${v}%)`),
          }}
        >
          <img
            src="/connect.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0A0F1C]/30" />
        </motion.div>

        {/* ── Big text ── */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ opacity: textOp }}
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

        {/* ── Overlay text ── */}
        <div className="absolute inset-0 z-20 flex items-end pointer-events-none">
          <div className="px-8 sm:px-14 pb-14 sm:pb-20 max-w-xl">
            <motion.p
              className="text-[15px] text-white/75 leading-relaxed"
              style={{ opacity: olOp, y: olY }}
            >
              Before you walk in, Meetra has already found the people worth
              meeting — matched on your goals, your background, and what
              you&apos;re building.
            </motion.p>
            <motion.p
              className="mt-3 text-[13px] text-white/40"
              style={{ opacity: ol2Op, y: ol2Y }}
            >
              AI-powered matching · Curated events · Real conversations
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
