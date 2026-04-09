'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

/**
 * Self-contained scroll section.
 * 
 * Uses a tall scrollable div with a sticky viewport.
 * The scroll target is an INNER sentinel div that sits
 * inside the sticky area, so we get clean 0→1 progress
 * from when the section pins to when it unpins.
 */
export default function ChanceBridge() {
  const outerRef = useRef<HTMLDivElement>(null);

  // Track scroll of the outer container
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  });

  // Debug: log progress to verify range
  // useMotionValueEvent(scrollYProgress, 'change', (v) => console.log('CB:', v.toFixed(3)));

  // ── PHASE 1: Text visible (progress 0.0 → 0.25) ──
  // Text is fully visible, centered. No image yet.
  const textOp = useTransform(scrollYProgress, [0.0, 0.05, 0.25, 0.4], [0, 1, 1, 0]);

  // ── PHASE 2: Image appears and grows (progress 0.2 → 0.6) ──
  // Starts as a small rectangle behind text, grows to fill viewport
  const imgOp = useTransform(scrollYProgress, [0.2, 0.35], [0, 1]);
  // clipPath: inset shrinks from 35% on each side to 0
  const clipInset = useTransform(scrollYProgress, [0.2, 0.6], [35, 0]);

  // ── PHASE 3: Overlay text (progress 0.6 → 0.8) ──
  const olOp = useTransform(scrollYProgress, [0.6, 0.72], [0, 1]);
  const olY = useTransform(scrollYProgress, [0.6, 0.72], [20, 0]);
  const ol2Op = useTransform(scrollYProgress, [0.68, 0.78], [0, 1]);
  const ol2Y = useTransform(scrollYProgress, [0.68, 0.78], [14, 0]);

  // ── PHASE 4: Fade out (progress 0.85 → 1.0) ──
  const fadeOut = useTransform(scrollYProgress, [0.85, 1.0], [1, 0]);

  // Slight zoom on image once full-bleed
  const imgZoom = useTransform(scrollYProgress, [0.6, 1.0], [1, 1.08]);

  return (
    <div
      ref={outerRef}
      className="relative"
      style={{ height: '350vh' }}
    >
      <motion.div
        className="sticky top-0 h-screen overflow-hidden bg-[#0A0F1C]"
        style={{ opacity: fadeOut }}
      >
        {/* ── Image layer — revealed via clipPath ── */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            opacity: imgOp,
            scale: imgZoom,
            clipPath: useTransform(clipInset, (v) => `inset(${v}% ${v}% ${v}% ${v}%)`),
          }}
        >
          <img
            src="/connect.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0A0F1C]/30" />
        </motion.div>

        {/* ── Big text — centered ── */}
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

        {/* ── Overlay text on full image ── */}
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
