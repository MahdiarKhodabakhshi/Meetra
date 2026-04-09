'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ChanceBridge — scroll-driven transition section.
 *
 * The word "chance" starts centered (echoing ProblemStatement's ending),
 * then moves into a new sentence: "We don't leave it to chance."
 * A second line reveals: "We engineer the moment."
 * An image fades in alongside.
 */
export default function ChanceBridge() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // ── Phase 1 (0.08–0.35): "chance" moves from center to its sentence position ──
  // Starts large + centered, shrinks and shifts left into "We don't leave it to"
  const chanceScale = useTransform(scrollYProgress, [0.08, 0.35], [2.2, 1], { clamp: true });
  const chanceX = useTransform(scrollYProgress, [0.08, 0.35], [0, 0], { clamp: true });
  const chanceY = useTransform(scrollYProgress, [0.08, 0.35], [0, 0], { clamp: true });
  const chanceColor = useTransform(
    scrollYProgress,
    [0.08, 0.3],
    ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.9)'],
    { clamp: true }
  );

  // The prefix "We don't leave it to" fades in as chance settles
  const prefixOpacity = useTransform(scrollYProgress, [0.2, 0.38], [0, 1], { clamp: true });
  const prefixY = useTransform(scrollYProgress, [0.2, 0.38], [12, 0], { clamp: true });

  // ── Phase 2 (0.4–0.6): second line reveals ──
  const line2Opacity = useTransform(scrollYProgress, [0.4, 0.55], [0, 1], { clamp: true });
  const line2Y = useTransform(scrollYProgress, [0.4, 0.55], [20, 0], { clamp: true });

  // ── Phase 3 (0.45–0.65): image fades in ──
  const imageOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1], { clamp: true });
  const imageY = useTransform(scrollYProgress, [0.45, 0.65], [30, 0], { clamp: true });

  // ── Whole section fades out at the end ──
  const sectionOpacity = useTransform(scrollYProgress, [0.75, 0.9], [1, 0], { clamp: true });

  return (
    <div ref={containerRef} className="relative bg-[#0A0F1C]" style={{ height: '200vh' }}>
      <motion.div
        className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
        style={{ opacity: sectionOpacity }}
      >
        <div className="px-6 w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — text */}
            <div>
              {/* Line 1: "We don't leave it to chance." */}
              <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4vw,3.2rem)] font-medium tracking-[-0.025em] leading-[1.25]">
                <motion.span
                  className="inline-block text-white/40"
                  style={{ opacity: prefixOpacity, y: prefixY }}
                >
                  We don&apos;t leave it to{' '}
                </motion.span>
                <motion.span
                  className="inline-block"
                  style={{
                    scale: chanceScale,
                    x: chanceX,
                    y: chanceY,
                    color: chanceColor,
                    transformOrigin: 'left baseline',
                  }}
                >
                  chance.
                </motion.span>
              </h2>

              {/* Line 2: "We engineer the moment." */}
              <motion.p
                className="mt-4 font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4vw,3.2rem)] font-medium tracking-[-0.025em] leading-[1.25] text-white"
                style={{ opacity: line2Opacity, y: line2Y }}
              >
                We engineer the{' '}
                <span className="text-[#60A5FA]">moment.</span>
              </motion.p>

              {/* Supporting text */}
              <motion.p
                className="mt-6 text-[15px] text-white/25 leading-relaxed max-w-md"
                style={{ opacity: line2Opacity, y: line2Y }}
              >
                Before you walk in, Meetra has already found the people worth meeting — matched on your goals, your background, and what you&apos;re building.
              </motion.p>
            </div>

            {/* Right — image */}
            <motion.div
              className="relative aspect-[4/3] rounded-2xl overflow-hidden"
              style={{ opacity: imageOpacity, y: imageY }}
            >
              <img
                src="/connect.jpg"
                alt="People connecting at an event"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C]/50 via-transparent to-[#0A0F1C]/20" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
