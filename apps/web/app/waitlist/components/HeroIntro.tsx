'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

/* Scattered floating images — positions, sizes, rotations */
const floatingImages = [
  { src: '/connect.jpg', x: '-38vw', y: '-25vh', size: 140, rotate: -6, delay: 3.2 },
  { src: '/rsvp.jpg', x: '32vw', y: '-20vh', size: 120, rotate: 4, delay: 3.4 },
  { src: '/discover.jpg', x: '-30vw', y: '22vh', size: 110, rotate: 8, delay: 3.6 },
  { src: '/disconnected.png', x: '36vw', y: '18vh', size: 130, rotate: -5, delay: 3.5 },
  { src: '/cta-bg.jpg', x: '-12vw', y: '-32vh', size: 100, rotate: 3, delay: 3.8 },
  { src: '/hero-bg.jpg', x: '14vw', y: '30vh', size: 105, rotate: -4, delay: 3.7 },
];

export default function HeroIntro() {
  const [phase, setPhase] = useState(0);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-white">

      {/* ── Phase 4: Full-bleed image background ── */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 4 ? 1 : 0 }}
        transition={{ duration: 1.5, ease }}
      >
        <img
          src="/rooftop.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0F172A]/65" />
      </motion.div>

      {/* ── Center stage ── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">

        {/* ── Phase 1: "Meetra" fades in as one word ── */}
        <motion.div
          className="flex items-baseline select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease }}
          onAnimationComplete={() => {
            if (phase === 0) setTimeout(() => setPhase(1), 800);
          }}
        >
          {/* "Meet" — slides left in phase 2 */}
          <motion.span
            className="font-[family-name:var(--font-playfair)] font-semibold text-[#0F172A] leading-none"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
            animate={{
              x: phase >= 2 ? '-12vw' : 0,
              opacity: phase >= 4 ? 0 : 1,
            }}
            transition={{ duration: 1.2, ease }}
          >
            Meet
          </motion.span>

          {/* "ra" — slides right in phase 2 */}
          <motion.span
            className="font-[family-name:var(--font-playfair)] font-semibold text-[#3B82F6] leading-none"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
            animate={{
              x: phase >= 2 ? '12vw' : 0,
              opacity: phase >= 4 ? 0 : 1,
            }}
            transition={{ duration: 1.2, ease }}
          >
            ra
          </motion.span>
        </motion.div>

        {/* ── Phase 2: Center image grows between the split ── */}
        <AnimatePresence>
          {phase >= 2 && phase < 4 && (
            <motion.div
              className="absolute rounded-2xl overflow-hidden shadow-2xl shadow-black/20"
              initial={{ opacity: 0, scale: 0.3, width: 180, height: 120 }}
              animate={{
                opacity: 1,
                scale: phase >= 3 ? 1.1 : 0.8,
                width: phase >= 3 ? 320 : 220,
                height: phase >= 3 ? 220 : 150,
              }}
              exit={{ opacity: 0, scale: 2.5, width: '100vw', height: '100vh', borderRadius: 0 }}
              transition={{ duration: 1.2, ease }}
              onAnimationComplete={() => {
                if (phase === 2) setTimeout(() => setPhase(3), 600);
              }}
            >
              <img
                src="/rooftop.png"
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase 3: Floating scattered images ── */}
        <AnimatePresence>
          {phase >= 3 && phase < 4 && (
            <>
              {floatingImages.map((img) => (
                <motion.div
                  key={img.src}
                  className="absolute rounded-xl overflow-hidden shadow-lg shadow-black/10"
                  style={{
                    width: img.size,
                    height: img.size * 0.7,
                  }}
                  initial={{ opacity: 0, scale: 0.4, x: 0, y: 0, rotate: 0 }}
                  animate={{
                    opacity: 0.85,
                    scale: 1,
                    x: img.x,
                    y: img.y,
                    rotate: img.rotate,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.6,
                    x: `calc(${img.x} * 1.8)`,
                    y: `calc(${img.y} * 1.8)`,
                  }}
                  transition={{
                    duration: 1.4,
                    delay: img.delay - 3.2,
                    ease,
                  }}
                >
                  <img
                    src={img.src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* ── Phase 1 trigger → Phase 2 ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 1 ? 1 : 0 }}
          transition={{ duration: 0.01 }}
          onAnimationComplete={() => {
            if (phase === 1) setTimeout(() => setPhase(2), 100);
          }}
        />

        {/* ── Phase 3 → Phase 4 timer ── */}
        {phase === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.01 }}
            transition={{ duration: 0.01, delay: 2.5 }}
            onAnimationComplete={() => {
              if (phase === 3) setPhase(4);
            }}
          />
        )}

        {/* ── Phase 4: Final text over full-bleed image ── */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease }}
            >
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA] mb-6">
                Join the waitlist
              </p>
              <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,5vw,4.5rem)] font-medium text-white tracking-[-0.025em] leading-[1.08] max-w-3xl">
                Meet the right people<br />at every event.
              </h1>
              <p className="mt-6 text-base text-white/40 max-w-md leading-relaxed">
                AI-powered networking that tells you who to talk to, why they matter, and what to say.
              </p>

              <motion.div
                className="mt-16 flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5, ease }}
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5"
                >
                  <div className="w-1 h-1.5 rounded-full bg-white/40" />
                </motion.div>
                <span className="text-[11px] text-white/25 tracking-wider uppercase">
                  Scroll down
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
