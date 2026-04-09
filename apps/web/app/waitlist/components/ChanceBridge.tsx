'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ChanceBridge() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Progress 0.0 = section top hits viewport top (sticky pins)
  // Progress 1.0 = section bottom hits viewport bottom

  // ── Phase 1 (0.0–0.15): text is static, readable ──
  // Nothing moves. You just read "We engineer the moment."

  // ── Phase 2 (0.15–0.5): image grows, words split ──
  const imageScale = useTransform(scrollYProgress, [0.0, 0.5], [0.12, 1], { clamp: true });
  const imageRadius = useTransform(scrollYProgress, [0.0, 0.45], [16, 0], { clamp: true });
  const imageOpacity = useTransform(scrollYProgress, [0.0, 0.1], [0, 1], { clamp: true });

  // Words start splitting at 0.15, fully gone by 0.5
  const weX = useTransform(scrollYProgress, [0.15, 0.5], [0, -320], { clamp: true });
  const weY = useTransform(scrollYProgress, [0.15, 0.5], [0, -220], { clamp: true });
  const weOp = useTransform(scrollYProgress, [0.35, 0.5], [1, 0], { clamp: true });

  const engX = useTransform(scrollYProgress, [0.15, 0.5], [0, 280], { clamp: true });
  const engY = useTransform(scrollYProgress, [0.15, 0.5], [0, -200], { clamp: true });
  const engOp = useTransform(scrollYProgress, [0.35, 0.5], [1, 0], { clamp: true });

  const theX = useTransform(scrollYProgress, [0.15, 0.5], [0, -300], { clamp: true });
  const theY = useTransform(scrollYProgress, [0.15, 0.5], [0, 180], { clamp: true });
  const theOp = useTransform(scrollYProgress, [0.35, 0.5], [1, 0], { clamp: true });

  const momX = useTransform(scrollYProgress, [0.15, 0.5], [0, 260], { clamp: true });
  const momY = useTransform(scrollYProgress, [0.15, 0.5], [0, 220], { clamp: true });
  const momOp = useTransform(scrollYProgress, [0.35, 0.5], [1, 0], { clamp: true });

  // ── Phase 3 (0.55–0.7): overlay text on full image ──
  const olOpacity = useTransform(scrollYProgress, [0.55, 0.65], [0, 1], { clamp: true });
  const olY = useTransform(scrollYProgress, [0.55, 0.65], [14, 0], { clamp: true });
  const ol2Opacity = useTransform(scrollYProgress, [0.62, 0.72], [0, 1], { clamp: true });
  const ol2Y = useTransform(scrollYProgress, [0.62, 0.72], [10, 0], { clamp: true });

  // ── Phase 4 (0.85–1.0): fade out ──
  const fadeOut = useTransform(scrollYProgress, [0.85, 0.98], [1, 0], { clamp: true });

  return (
    <div ref={containerRef} className="relative bg-[#0A0F1C]" style={{ height: '350vh' }}>
      <motion.div
        className="sticky top-0 h-screen overflow-hidden flex items-center justify-center"
        style={{ opacity: fadeOut }}
      >
        {/* ── Image — grows from small center to full bleed ── */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative overflow-hidden origin-center"
            style={{
              width: '100vw',
              height: '100vh',
              scale: imageScale,
              borderRadius: imageRadius,
              opacity: imageOpacity,
            }}
          >
            <img
              src="/connect.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#0A0F1C]/35" />
          </motion.div>
        </div>

        {/* ── Text — splits apart ── */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="relative">
            <div className="flex items-baseline justify-center gap-[0.3em] font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,7vw,6.5rem)] font-medium tracking-[-0.03em] leading-none">
              <motion.span className="inline-block text-white" style={{ x: weX, y: weY, opacity: weOp }}>
                We
              </motion.span>
              <motion.span className="inline-block text-white" style={{ x: engX, y: engY, opacity: engOp }}>
                engineer
              </motion.span>
            </div>
            <div className="flex items-baseline justify-center gap-[0.3em] font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,7vw,6.5rem)] font-medium tracking-[-0.03em] leading-none mt-2">
              <motion.span className="inline-block text-white/60" style={{ x: theX, y: theY, opacity: theOp }}>
                the
              </motion.span>
              <motion.span className="inline-block text-[#60A5FA]" style={{ x: momX, y: momY, opacity: momOp }}>
                moment.
              </motion.span>
            </div>
          </div>
        </div>

        {/* ── Overlay text on full-bleed image ── */}
        <div className="absolute inset-0 z-20 flex items-end pointer-events-none">
          <div className="px-8 sm:px-14 pb-16 sm:pb-20 max-w-2xl">
            <motion.p className="text-[15px] text-white/70 leading-relaxed" style={{ opacity: olOpacity, y: olY }}>
              Before you walk in, Meetra has already found the people worth meeting — matched on your goals, your background, and what you&apos;re building.
            </motion.p>
            <motion.p className="mt-4 text-[13px] text-white/35" style={{ opacity: ol2Opacity, y: ol2Y }}>
              AI-powered matching · Curated events · Real conversations
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
