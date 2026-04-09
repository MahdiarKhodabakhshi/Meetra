'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ChanceBridge() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // "chance" starts large, shrinks into the sentence
  const chanceScale = useTransform(scrollYProgress, [0.05, 0.25], [2.4, 1], { clamp: true });
  const chanceColor = useTransform(
    scrollYProgress,
    [0.05, 0.25],
    ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.9)'],
    { clamp: true }
  );

  // "We don't leave it to" fades in
  const prefixOpacity = useTransform(scrollYProgress, [0.15, 0.28], [0, 1], { clamp: true });
  const prefixY = useTransform(scrollYProgress, [0.15, 0.28], [10, 0], { clamp: true });

  // Line 2: "We engineer the moment."
  const line2Opacity = useTransform(scrollYProgress, [0.28, 0.4], [0, 1], { clamp: true });
  const line2Y = useTransform(scrollYProgress, [0.28, 0.4], [16, 0], { clamp: true });

  // Supporting text
  const descOpacity = useTransform(scrollYProgress, [0.32, 0.44], [0, 1], { clamp: true });
  const descY = useTransform(scrollYProgress, [0.32, 0.44], [12, 0], { clamp: true });

  // Image — appears right after line 2 starts
  const imageOpacity = useTransform(scrollYProgress, [0.25, 0.42], [0, 1], { clamp: true });
  const imageY = useTransform(scrollYProgress, [0.25, 0.42], [40, 0], { clamp: true });
  const imageScale = useTransform(scrollYProgress, [0.25, 0.42], [0.95, 1], { clamp: true });

  // Fade out at end
  const sectionOpacity = useTransform(scrollYProgress, [0.7, 0.85], [1, 0], { clamp: true });

  return (
    <div ref={containerRef} className="relative bg-[#0A0F1C]" style={{ height: '250vh' }}>
      <motion.div
        className="sticky top-0 h-screen flex items-center overflow-hidden"
        style={{ opacity: sectionOpacity }}
      >
        <div className="px-6 sm:px-10 w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — text */}
            <div>
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
                    color: chanceColor,
                    transformOrigin: 'left baseline',
                  }}
                >
                  chance.
                </motion.span>
              </h2>

              <motion.p
                className="mt-4 font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4vw,3.2rem)] font-medium tracking-[-0.025em] leading-[1.25] text-white"
                style={{ opacity: line2Opacity, y: line2Y }}
              >
                We engineer the{' '}
                <span className="text-[#60A5FA]">moment.</span>
              </motion.p>

              <motion.p
                className="mt-6 text-[15px] text-white/25 leading-relaxed max-w-md"
                style={{ opacity: descOpacity, y: descY }}
              >
                Before you walk in, Meetra has already found the people worth meeting — matched on your goals, your background, and what you&apos;re building.
              </motion.p>
            </div>

            {/* Right — image */}
            <motion.div
              className="relative aspect-[4/3] rounded-2xl overflow-hidden"
              style={{ opacity: imageOpacity, y: imageY, scale: imageScale }}
            >
              <img
                src="/connect.jpg"
                alt="People connecting at an event"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C]/40 via-transparent to-[#0A0F1C]/10 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
