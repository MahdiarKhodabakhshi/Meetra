'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ChanceBridge() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  // ── Image: starts small centered, grows to fill viewport ──
  const imageScale = useTransform(scrollYProgress, [0.05, 0.55], [0.15, 1], { clamp: true });
  const imageRadius = useTransform(scrollYProgress, [0.05, 0.5], [20, 0], { clamp: true });
  const imageOpacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 1], { clamp: true });

  // ── "We" — drifts top-left ──
  const weX = useTransform(scrollYProgress, [0.15, 0.5], [0, -300], { clamp: true });
  const weY = useTransform(scrollYProgress, [0.15, 0.5], [0, -200], { clamp: true });
  const weOpacity = useTransform(scrollYProgress, [0.3, 0.5], [1, 0], { clamp: true });

  // ── "engineer" — drifts top-right ──
  const engX = useTransform(scrollYProgress, [0.15, 0.5], [0, 250], { clamp: true });
  const engY = useTransform(scrollYProgress, [0.15, 0.5], [0, -180], { clamp: true });
  const engOpacity = useTransform(scrollYProgress, [0.3, 0.5], [1, 0], { clamp: true });

  // ── "the" — drifts bottom-left ──
  const theX = useTransform(scrollYProgress, [0.15, 0.5], [0, -280], { clamp: true });
  const theY = useTransform(scrollYProgress, [0.15, 0.5], [0, 160], { clamp: true });
  const theOpacity = useTransform(scrollYProgress, [0.3, 0.5], [1, 0], { clamp: true });

  // ── "moment." — drifts bottom-right ──
  const momX = useTransform(scrollYProgress, [0.15, 0.5], [0, 220], { clamp: true });
  const momY = useTransform(scrollYProgress, [0.15, 0.5], [0, 200], { clamp: true });
  const momOpacity = useTransform(scrollYProgress, [0.3, 0.5], [1, 0], { clamp: true });

  // ── Overlay text on full-bleed image ──
  const overlayOpacity = useTransform(scrollYProgress, [0.58, 0.68], [0, 1], { clamp: true });
  const overlayY = useTransform(scrollYProgress, [0.58, 0.68], [16, 0], { clamp: true });

  const overlay2Opacity = useTransform(scrollYProgress, [0.64, 0.74], [0, 1], { clamp: true });
  const overlay2Y = useTransform(scrollYProgress, [0.64, 0.74], [12, 0], { clamp: true });

  // ── Fade out at end ──
  const sectionOpacity = useTransform(scrollYProgress, [0.85, 0.97], [1, 0], { clamp: true });

  return (
    <div ref={containerRef} className="relative bg-[#0A0F1C]" style={{ height: '300vh' }}>
      <motion.div
        className="sticky top-0 h-screen overflow-hidden flex items-center justify-center"
        style={{ opacity: sectionOpacity }}
      >
        {/* ── Image layer — grows from center ── */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: imageOpacity }}
        >
          <motion.div
            className="relative overflow-hidden"
            style={{
              width: '100%',
              height: '100%',
              scale: imageScale,
              borderRadius: imageRadius,
            }}
          >
            <img
              src="/connect.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#0A0F1C]/40" />
          </motion.div>
        </motion.div>

        {/* ── Splitting text layer ── */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="relative">
            <div className="flex items-baseline justify-center gap-[0.3em] font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,7vw,6.5rem)] font-medium tracking-[-0.03em] leading-none">
              <motion.span
                className="inline-block text-white"
                style={{ x: weX, y: weY, opacity: weOpacity }}
              >
                We
              </motion.span>
              <motion.span
                className="inline-block text-white"
                style={{ x: engX, y: engY, opacity: engOpacity }}
              >
                engineer
              </motion.span>
            </div>
            <div className="flex items-baseline justify-center gap-[0.3em] font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,7vw,6.5rem)] font-medium tracking-[-0.03em] leading-none mt-2">
              <motion.span
                className="inline-block text-white/60"
                style={{ x: theX, y: theY, opacity: theOpacity }}
              >
                the
              </motion.span>
              <motion.span
                className="inline-block text-[#60A5FA]"
                style={{ x: momX, y: momY, opacity: momOpacity }}
              >
                moment.
              </motion.span>
            </div>
          </div>
        </div>

        {/* ── Overlay text on full-bleed image ── */}
        <div className="absolute inset-0 z-20 flex items-end pointer-events-none">
          <div className="px-8 sm:px-14 pb-16 sm:pb-20 max-w-2xl">
            <motion.p
              className="text-[15px] text-white/70 leading-relaxed"
              style={{ opacity: overlayOpacity, y: overlayY }}
            >
              Before you walk in, Meetra has already found the people worth meeting — matched on your goals, your background, and what you&apos;re building.
            </motion.p>
            <motion.p
              className="mt-4 text-[13px] text-white/35"
              style={{ opacity: overlay2Opacity, y: overlay2Y }}
            >
              AI-powered matching · Curated events · Real conversations
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
