'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;
const smooth = { duration: 1.2, ease };

const words = ['mentors.', 'founders.', 'partners.', 'investors.', 'advisors.'];

/* Background steps */
const bgSteps = [
  '#FAFAFA', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#64748B',
  '#334155', '#1E293B', '#0F172A', '#0A0F1C',
];
const meetColorSteps = [
  '#0F172A', '#0F172A', '#0F172A', '#0F172A', '#F1F5F9',
  '#F8FAFC', '#FFFFFF', '#FFFFFF', '#FFFFFF',
];
const wordColorSteps = ['#94A3B8', '#94A3B8', '#CBD5E1', '#E2E8F0', '#F1F5F9', '#F8FAFC'];

type Phase = 'intro' | 'split' | 'rolling' | 'rejoin' | 'hero';

export default function HeroIntro({ onHeroReady }: { onHeroReady?: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [wordIndex, setWordIndex] = useState(0);

  // Lock scroll during animation
  useEffect(() => {
    if (phase === 'hero') {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  const step = useMemo(() => {
    if (phase === 'intro') return 0;
    if (phase === 'split') return 1;
    if (phase === 'rolling') return 2 + wordIndex;
    if (phase === 'rejoin') return 7;
    return 8;
  }, [phase, wordIndex]);

  const bgColor = bgSteps[Math.min(step, bgSteps.length - 1)];
  const meetColor = meetColorSteps[Math.min(step, meetColorSteps.length - 1)];
  const rollingWordColor = wordColorSteps[Math.min(wordIndex, wordColorSteps.length - 1)];

  /* ── Sequencer (tighter timing) ── */
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => setPhase('split'), 1600);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'split') return;
    const t = setTimeout(() => setPhase('rolling'), 900);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'rolling') return;
    if (wordIndex < words.length - 1) {
      const t = setTimeout(() => setWordIndex((i) => i + 1), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('rejoin'), 1200);
    return () => clearTimeout(t);
  }, [phase, wordIndex]);

  useEffect(() => {
    if (phase !== 'rejoin') return;
    const t = setTimeout(() => {
      setPhase('hero');
      onHeroReady?.();
    }, 1600);
    return () => clearTimeout(t);
  }, [phase, onHeroReady]);

  const isSplit = phase === 'split' || phase === 'rolling';
  const isRolling = phase === 'rolling';
  const isRejoined = phase === 'rejoin' || phase === 'hero';
  const isHero = phase === 'hero';

  return (
    <section className="relative h-screen w-full overflow-hidden">

      {/* Background color — single div, opacity+transform only */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ backgroundColor: bgColor }}
        transition={{ duration: 1.4, ease }}
      />

      {/* Hero background image — no scale animation, just opacity */}
      <motion.div
        className="absolute inset-0 z-[2]"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHero ? 1 : 0 }}
        transition={{ duration: 2.5, ease }}
      >
        <img src="/rooftop.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/30 via-[#0F172A]/50 to-[#0F172A]/75" />
      </motion.div>

      {/* Center stage */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">

        {/* Logo unit — fades out when hero arrives */}
        <motion.div
          className="select-none"
          animate={{
            opacity: isHero ? 0 : 1,
            y: isHero ? -60 : 0,
          }}
          transition={{ duration: 1.4, ease }}
        >
          <div className="flex items-baseline">

            {/* "Meet" */}
            <motion.span
              className="font-[family-name:var(--font-playfair)] font-medium tracking-[-0.03em] leading-none"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                x: isSplit ? '-0.15em' : 0,
                color: meetColor,
              }}
              transition={smooth}
            >
              Meet
            </motion.span>

            {/* Ticker slot */}
            <motion.div
              className="relative overflow-hidden"
              style={{ height: 'clamp(3.5rem, 9vw, 8rem)' }}
              animate={{ width: isSplit ? 'clamp(10rem, 26vw, 22rem)' : 'auto' }}
              transition={smooth}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {isRolling ? (
                  <motion.span
                    key={words[wordIndex]}
                    className="absolute left-[0.2em] font-[family-name:var(--font-playfair)] font-normal italic tracking-[-0.01em] leading-none whitespace-nowrap"
                    style={{ fontSize: 'clamp(2.2rem, 5.5vw, 5rem)', color: rollingWordColor }}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.6, ease }}
                  >
                    {words[wordIndex]}
                  </motion.span>
                ) : (
                  <motion.span
                    key="ra"
                    className="font-[family-name:var(--font-playfair)] font-medium tracking-[-0.03em] text-[#3B82F6] leading-none"
                    style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
                    initial={phase === 'rejoin' ? { y: '100%', opacity: 0 } : false}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.6, ease }}
                  >
                    ra
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Thin line */}
          <motion.div
            className="mx-auto mt-8 rounded-full bg-current"
            style={{ height: 1 }}
            animate={{
              width: isSplit || isRolling ? 80 : 0,
              opacity: isRejoined ? 0 : 0.3,
            }}
            transition={smooth}
          />

          {/* Tagline */}
          <motion.p
            className="text-center mt-5 text-[13px] tracking-[0.08em] text-[#94A3B8]"
            animate={{
              opacity: isSplit || isRolling ? 0.5 : 0,
              y: isSplit || isRolling ? 0 : 4,
            }}
            transition={smooth}
          >
            Networking, with intention.
          </motion.p>
        </motion.div>

        {/* ── Hero content ── */}
        <AnimatePresence>
          {isHero && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.6, delay: 0.3, ease }}
            >
              {/* Nav logo */}
              <motion.p
                className="absolute top-8 left-1/2 -translate-x-1/2 font-[family-name:var(--font-playfair)] text-[22px] font-semibold"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8, ease }}
              >
                <span className="text-white">Meet</span>
                <span className="text-[#60A5FA]">ra</span>
              </motion.p>

              <motion.p
                className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA]/60 mb-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease }}
              >
                Join the waitlist
              </motion.p>

              <motion.h1
                className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,5vw,4.5rem)] font-medium text-white tracking-[-0.025em] leading-[1.08] max-w-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.7, ease }}
              >
                Meet the right people<br />at every event.
              </motion.h1>

              <motion.p
                className="mt-6 text-[15px] text-white/30 max-w-md leading-relaxed"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.1, ease }}
              >
                Every event has the right person for you. Meetra finds them.
              </motion.p>

              {/* CTA */}
              <motion.a
                href="#waitlist-cta"
                className="mt-10 inline-flex items-center gap-2 bg-white text-[#0F172A] px-8 py-4 rounded-full text-[14px] font-medium hover:bg-white/90 active:bg-white/80 transition-colors duration-200"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.4, ease }}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('waitlist-cta')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Join the waitlist
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </motion.a>

              {/* Scroll indicator */}
              <motion.div
                className="absolute bottom-10 flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2, ease }}
              >
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-[18px] h-7 rounded-full border border-white/10 flex items-start justify-center pt-1.5"
                >
                  <div className="w-[3px] h-[5px] rounded-full bg-white/20" />
                </motion.div>
                <span className="text-[10px] text-white/15 tracking-[0.2em] uppercase">Scroll</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
