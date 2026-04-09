'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const rollingWords = [
  'your co-founder',
  'investors',
  'mentors',
  'collaborators',
  'the right people',
];

export default function HeroIntro() {
  // 0 = Meetra fades in
  // 1 = gap opens, rolling words start
  // 2 = rolling done, snaps back to "ra"
  // 3 = logo shrinks up, hero reveals
  const [phase, setPhase] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [rolling, setRolling] = useState(false);

  // Phase 0 → 1: after Meetra appears, start the split
  useEffect(() => {
    if (phase === 0) {
      const t = setTimeout(() => setPhase(1), 1600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Phase 1: start rolling words
  useEffect(() => {
    if (phase === 1 && !rolling) {
      const t = setTimeout(() => setRolling(true), 800);
      return () => clearTimeout(t);
    }
  }, [phase, rolling]);

  // Roll through words
  useEffect(() => {
    if (!rolling) return;
    if (wordIndex < rollingWords.length - 1) {
      const t = setTimeout(() => setWordIndex((i) => i + 1), 700);
      return () => clearTimeout(t);
    } else {
      // Last word shown, pause then snap back
      const t = setTimeout(() => {
        setRolling(false);
        setPhase(2);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [rolling, wordIndex]);

  // Phase 2 → 3: after snapping back to "Meetra", shrink to nav
  useEffect(() => {
    if (phase === 2) {
      const t = setTimeout(() => setPhase(3), 1000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const isExpanded = phase === 1 && rolling;
  const showRoller = phase === 1 && rolling;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-white">

      {/* ── Hero background — revealed in phase 3 ── */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 3 ? 1 : 0 }}
        transition={{ duration: 1.5, ease }}
      >
        <img
          src="/rooftop.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0F172A]/60" />
      </motion.div>

      {/* ── Floating images — appear during rolling, fade in phase 3 ── */}
      <AnimatePresence>
        {(phase === 1 && rolling) && (
          <>
            {[
              { src: '/connect.jpg', x: '-36vw', y: '-22vh', size: 130, rotate: -5, delay: 0 },
              { src: '/rsvp.jpg', x: '30vw', y: '-18vh', size: 115, rotate: 4, delay: 0.2 },
              { src: '/discover.jpg', x: '-28vw', y: '20vh', size: 105, rotate: 7, delay: 0.4 },
              { src: '/disconnected.png', x: '34vw', y: '16vh', size: 120, rotate: -4, delay: 0.3 },
              { src: '/cta-bg.jpg', x: '-10vw', y: '-30vh', size: 95, rotate: 3, delay: 0.5 },
              { src: '/hero-bg.jpg', x: '12vw', y: '28vh', size: 100, rotate: -3, delay: 0.6 },
            ].map((img) => (
              <motion.div
                key={img.src}
                className="absolute top-1/2 left-1/2 rounded-xl overflow-hidden shadow-lg shadow-black/8 z-5"
                style={{ width: img.size, height: img.size * 0.68 }}
                initial={{ opacity: 0, scale: 0.3, x: '-50%', y: '-50%', rotate: 0 }}
                animate={{
                  opacity: 0.75,
                  scale: 1,
                  x: img.x,
                  y: img.y,
                  rotate: img.rotate,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  transition: { duration: 0.8, ease },
                }}
                transition={{ duration: 1.2, delay: img.delay, ease }}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* ── Center: the logo + roller ── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">

        {/* Logo container — shrinks and moves to top in phase 3 */}
        <motion.div
          className="flex items-baseline select-none"
          animate={{
            scale: phase >= 3 ? 0.3 : 1,
            y: phase >= 3 ? '-42vh' : 0,
            opacity: phase >= 3 ? 0 : 1,
          }}
          transition={{ duration: 1.2, ease }}
        >
          {/* "Meet" */}
          <motion.span
            className="font-[family-name:var(--font-playfair)] font-semibold text-[#0F172A] leading-none"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
          >
            Meet
          </motion.span>

          {/* Rolling word slot — between Meet and ra */}
          <div className="relative overflow-hidden" style={{ height: 'clamp(3rem, 8vw, 7rem)' }}>
            <motion.div
              animate={{
                width: showRoller ? 'auto' : 0,
                marginLeft: showRoller ? '0.25em' : 0,
                marginRight: showRoller ? '0.15em' : 0,
              }}
              transition={{ duration: 0.6, ease }}
              className="overflow-hidden flex items-baseline"
              style={{ height: '100%' }}
            >
              <AnimatePresence mode="popLayout">
                {showRoller && (
                  <motion.span
                    key={rollingWords[wordIndex]}
                    className="font-[family-name:var(--font-playfair)] font-medium text-[#94A3B8] leading-none whitespace-nowrap block"
                    style={{ fontSize: 'clamp(1.8rem, 4.5vw, 4rem)' }}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    {rollingWords[wordIndex]}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* "ra" */}
          <motion.span
            className="font-[family-name:var(--font-playfair)] font-semibold text-[#3B82F6] leading-none"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
            animate={{
              opacity: showRoller ? 0.3 : 1,
            }}
            transition={{ duration: 0.5, ease }}
          >
            ra
          </motion.span>
        </motion.div>

        {/* ── Phase 0: initial fade in ── */}
        <motion.div
          className="absolute inset-0 bg-white pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.2, ease }}
        />

        {/* ── Phase 3: Hero content over full-bleed image ── */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.8, ease }}
            >
              {/* Small Meetra logo at top */}
              <motion.p
                className="absolute top-8 font-[family-name:var(--font-playfair)] text-[22px] font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2, ease }}
              >
                <span className="text-white">Meet</span>
                <span className="text-[#60A5FA]">ra</span>
              </motion.p>

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
                transition={{ duration: 1, delay: 2, ease }}
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
