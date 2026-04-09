'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const words = [
  'ra',
  'your mentor.',
  'a co-founder.',
  'investors.',
  'collaborators.',
  'the right people.',
  'ra',
];

export default function HeroIntro() {
  const [wordIndex, setWordIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);

  // Start the sequence after initial fade-in
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Cycle through words
  useEffect(() => {
    if (!started) return;
    if (wordIndex >= words.length - 1) {
      // Final "ra" — pause then reveal hero
      const t = setTimeout(() => setHeroRevealed(true), 1400);
      return () => clearTimeout(t);
    }
    const delay = wordIndex === 0 ? 600 : 900;
    const t = setTimeout(() => setWordIndex((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [started, wordIndex]);

  const currentWord = words[wordIndex];
  const isRa = currentWord === 'ra';
  const isRolling = started && !heroRevealed;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#FAFAF8]">

      {/* Subtle warm grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Hero background ── */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{
          opacity: heroRevealed ? 1 : 0,
          scale: heroRevealed ? 1 : 1.05,
        }}
        transition={{ duration: 2, ease }}
      >
        <img
          src="/rooftop.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/50 via-[#0F172A]/60 to-[#0F172A]/80" />
      </motion.div>

      {/* ── Floating images during roll ── */}
      <AnimatePresence>
        {isRolling && !isRa && wordIndex > 0 && (
          <>
            {[
              { src: '/connect.jpg', left: '6%', top: '15%', w: 160, h: 110, r: -4, d: 0 },
              { src: '/rsvp.jpg', right: '8%', top: '12%', w: 140, h: 95, r: 3, d: 0.15 },
              { src: '/discover.jpg', left: '10%', bottom: '18%', w: 130, h: 90, r: 6, d: 0.3 },
              { src: '/disconnected.png', right: '6%', bottom: '15%', w: 150, h: 100, r: -3, d: 0.2 },
            ].map((img) => (
              <motion.div
                key={img.src}
                className="absolute rounded-lg overflow-hidden"
                style={{
                  width: img.w,
                  height: img.h,
                  left: img.left,
                  right: img.right,
                  top: img.top,
                  bottom: img.bottom,
                }}
                initial={{ opacity: 0, scale: 0.85, rotate: 0, y: 20 }}
                animate={{ opacity: 0.5, scale: 1, rotate: img.r, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.6, ease } }}
                transition={{ duration: 1, delay: img.d, ease }}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* ── Center stage ── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">

        {/* The logo / word unit */}
        <motion.div
          className="select-none"
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: heroRevealed ? 0 : 1,
            y: heroRevealed ? -60 : 0,
            scale: heroRevealed ? 0.4 : 1,
          }}
          transition={{
            opacity: { duration: heroRevealed ? 0.8 : 1.2, delay: heroRevealed ? 0 : 0.4, ease },
            y: { duration: heroRevealed ? 1 : 1.2, delay: heroRevealed ? 0 : 0.4, ease },
            scale: { duration: 1, ease },
          }}
        >
          <div className="flex items-baseline justify-center">
            {/* "Meet" — always visible */}
            <span
              className="font-[family-name:var(--font-playfair)] font-medium tracking-[-0.03em] text-[#0F172A] leading-none"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
            >
              Meet
            </span>

            {/* The rolling suffix */}
            <div
              className="relative overflow-hidden inline-flex items-baseline"
              style={{ height: 'clamp(3.5rem, 9vw, 8rem)' }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={currentWord}
                  className={`font-[family-name:var(--font-playfair)] leading-none inline-block ${
                    isRa
                      ? 'font-medium tracking-[-0.03em] text-[#3B82F6]'
                      : 'font-normal tracking-[-0.02em] text-[#94A3B8] italic'
                  }`}
                  style={{
                    fontSize: isRa ? 'clamp(3.5rem, 9vw, 8rem)' : 'clamp(2rem, 5vw, 4.5rem)',
                    paddingLeft: isRa ? 0 : '0.3em',
                  }}
                  initial={{ y: '110%', opacity: 0, filter: 'blur(4px)' }}
                  animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: '-110%', opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.55, ease }}
                >
                  {currentWord}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Thin line under the logo */}
          <motion.div
            className="mx-auto mt-6 bg-[#E2E8F0] rounded-full"
            style={{ height: 1 }}
            initial={{ width: 0 }}
            animate={{ width: started ? 120 : 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease }}
          />

          {/* Subtle tagline below */}
          <motion.p
            className="text-center mt-5 text-[13px] text-[#94A3B8] tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: started && !heroRevealed ? 0.7 : 0 }}
            transition={{ duration: 0.8, ease }}
          >
            Networking, with intention.
          </motion.p>
        </motion.div>

        {/* ── Hero content ── */}
        <AnimatePresence>
          {heroRevealed && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.6, ease }}
            >
              {/* Nav logo */}
              <motion.p
                className="absolute top-8 left-1/2 -translate-x-1/2 font-[family-name:var(--font-playfair)] text-[22px] font-semibold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4, ease }}
              >
                <span className="text-white">Meet</span>
                <span className="text-[#60A5FA]">ra</span>
              </motion.p>

              <motion.p
                className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA]/80 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease }}
              >
                Join the waitlist
              </motion.p>

              <motion.h1
                className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,5vw,4.5rem)] font-medium text-white tracking-[-0.025em] leading-[1.08] max-w-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1, ease }}
              >
                Meet the right people<br />at every event.
              </motion.h1>

              <motion.p
                className="mt-6 text-[15px] text-white/35 max-w-md leading-relaxed"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3, ease }}
              >
                AI-powered networking that tells you who to talk to, why they matter, and what to say.
              </motion.p>

              {/* Scroll cue */}
              <motion.div
                className="absolute bottom-10 flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2.2, ease }}
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-[18px] h-7 rounded-full border border-white/15 flex items-start justify-center pt-1.5"
                >
                  <div className="w-[3px] h-[5px] rounded-full bg-white/30" />
                </motion.div>
                <span className="text-[10px] text-white/20 tracking-[0.2em] uppercase">
                  Scroll
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
