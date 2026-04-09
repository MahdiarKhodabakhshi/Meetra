'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Smoother easing curves */
const smooth = { duration: 1.4, ease: [0.22, 1, 0.36, 1] as const };
const ease = [0.22, 1, 0.36, 1] as const;
const softSpring = { type: 'spring' as const, stiffness: 60, damping: 20, mass: 1 };

const words = ['mentors.', 'founders.', 'partners.', 'investors.', 'advisors.'];

/* Background darkens progressively: white → cool slate → dark navy */
const bgSteps = [
  '#FAFAFA',   // intro
  '#F1F5F9',   // split
  '#E2E8F0',   // word 0
  '#CBD5E1',   // word 1
  '#64748B',   // word 2
  '#334155',   // word 3
  '#1E293B',   // word 4
  '#0F172A',   // rejoin
  '#0A0F1C',   // hero
];

/* Meet text color: dark → white */
const meetColorSteps = [
  '#0F172A',   // intro
  '#0F172A',   // split
  '#0F172A',   // word 0
  '#0F172A',   // word 1
  '#F1F5F9',   // word 2
  '#F8FAFC',   // word 3
  '#FFFFFF',   // word 4
  '#FFFFFF',   // rejoin
  '#FFFFFF',   // hero
];

/* Rolling word color */
const wordColorSteps = [
  '#94A3B8',
  '#94A3B8',
  '#CBD5E1',
  '#E2E8F0',
  '#F1F5F9',
  '#F8FAFC',
];

/* Floating image opacity */
const imageOpacitySteps = [0.3, 0.4, 0.5, 0.6, 0.65];

/* Divider color */
const dividerColorSteps = [
  '#E2E8F0',
  '#CBD5E1',
  '#94A3B8',
  '#64748B',
  '#475569',
  '#334155',
];

type Phase = 'intro' | 'split' | 'rolling' | 'rejoin' | 'hero';

/* Floating image config */
const floatingImages = [
  { src: '/connect.jpg', left: '5%', top: '14%', w: 150, h: 100, r: -3, bobDelay: 0 },
  { src: '/rsvp.jpg', right: '7%', top: '10%', w: 135, h: 90, r: 3, bobDelay: 0.6 },
  { src: '/discover.jpg', left: '8%', bottom: '16%', w: 125, h: 85, r: 5, bobDelay: 1.2 },
  { src: '/disconnected.png', right: '5%', bottom: '13%', w: 140, h: 95, r: -4, bobDelay: 1.8 },
];

export default function HeroIntro({ onHeroReady }: { onHeroReady?: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [wordIndex, setWordIndex] = useState(0);

  // Lock scroll during intro animation
  useEffect(() => {
    if (phase === 'hero') {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  // Compute a single "step" index for color lookups
  const step = useMemo(() => {
    if (phase === 'intro') return 0;
    if (phase === 'split') return 1;
    if (phase === 'rolling') return 2 + wordIndex;
    if (phase === 'rejoin') return 7;
    return 8; // hero
  }, [phase, wordIndex]);

  const bgColor = bgSteps[Math.min(step, bgSteps.length - 1)];
  const meetColor = meetColorSteps[Math.min(step, meetColorSteps.length - 1)];
  const rollingWordColor = wordColorSteps[Math.min(wordIndex, wordColorSteps.length - 1)];
  const floatOpacity = imageOpacitySteps[Math.min(wordIndex, imageOpacitySteps.length - 1)];
  const dividerColor = dividerColorSteps[Math.min(step > 1 ? step - 1 : 0, dividerColorSteps.length - 1)];

  /* ── Sequencer ── */
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => setPhase('split'), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'split') return;
    const t = setTimeout(() => setPhase('rolling'), 1100);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'rolling') return;
    if (wordIndex < words.length - 1) {
      const t = setTimeout(() => setWordIndex((i) => i + 1), 1100);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('rejoin'), 1500);
    return () => clearTimeout(t);
  }, [phase, wordIndex]);

  useEffect(() => {
    if (phase !== 'rejoin') return;
    const t = setTimeout(() => {
      setPhase('hero');
      onHeroReady?.();
    }, 2000);
    return () => clearTimeout(t);
  }, [phase, onHeroReady]);

  const isSplit = phase === 'split' || phase === 'rolling';
  const isRolling = phase === 'rolling';
  const isRejoined = phase === 'rejoin' || phase === 'hero';
  const isHero = phase === 'hero';

  return (
    <section className="relative h-screen w-full overflow-hidden">

      {/* ── Animated background color ── */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ backgroundColor: bgColor }}
        transition={{ duration: 1.6, ease }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Hero background image ── */}
      <motion.div
        className="absolute inset-0 z-[2]"
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{
          opacity: isHero ? 1 : 0,
          scale: isHero ? 1 : 1.08,
        }}
        transition={{ duration: 3, ease }}
      >
        <img src="/rooftop.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/30 via-[#0F172A]/50 to-[#0F172A]/75" />
      </motion.div>

      {/* ── Floating images during roll ── */}
      <AnimatePresence>
        {isRolling && (
          <>
            {floatingImages.map((img, i) => (
              <motion.div
                key={img.src}
                className="absolute rounded-xl overflow-hidden z-[3] shadow-lg"
                style={{
                  width: img.w, height: img.h,
                  left: img.left, right: img.right,
                  top: img.top, bottom: img.bottom,
                }}
                initial={{ opacity: 0, scale: 0.85, rotate: 0, y: 20 }}
                animate={{
                  opacity: floatOpacity,
                  scale: 1,
                  rotate: img.r,
                  y: [0, -10, 0],
                }}
                exit={{ opacity: 0, scale: 0.9, y: -12, transition: { duration: 1.2, ease } }}
                transition={{
                  opacity: { duration: 1.6, delay: i * 0.12, ease },
                  scale: { duration: 1.6, delay: i * 0.12, ease },
                  rotate: { duration: 1.6, delay: i * 0.12, ease },
                  y: {
                    duration: 3.5,
                    delay: img.bobDelay,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  },
                }}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* ── Center stage ── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">

        {/* Logo unit */}
        <motion.div
          className="select-none"
          animate={{
            opacity: isHero ? 0 : 1,
            scale: isHero ? 0.3 : 1,
            y: isHero ? '-40vh' : 0,
          }}
          transition={{ duration: 1.8, ease }}
        >
          <div className="flex items-baseline">

            {/* "Meet" */}
            <motion.span
              className="font-[family-name:var(--font-playfair)] font-medium tracking-[-0.03em] leading-none"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                x: isSplit ? '-0.15em' : 0,
                color: meetColor,
              }}
              transition={{ ...smooth, opacity: { duration: 1.8, ease } }}
            >
              Meet
            </motion.span>

            {/* Ticker slot */}
            <motion.div
              className="relative overflow-hidden"
              style={{ height: 'clamp(3.5rem, 9vw, 8rem)' }}
              animate={{
                width: isSplit ? 'clamp(10rem, 26vw, 22rem)' : 'auto',
              }}
              transition={smooth}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {isRolling ? (
                  <motion.span
                    key={words[wordIndex]}
                    className="absolute left-[0.2em] font-[family-name:var(--font-playfair)] font-normal italic tracking-[-0.01em] leading-none whitespace-nowrap"
                    style={{
                      fontSize: 'clamp(2.2rem, 5.5vw, 5rem)',
                      color: rollingWordColor,
                    }}
                    initial={{ y: '110%', opacity: 0, filter: 'blur(8px)' }}
                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: '-110%', opacity: 0, filter: 'blur(8px)' }}
                    transition={{ duration: 0.8, ease }}
                  >
                    {words[wordIndex]}
                  </motion.span>
                ) : (
                  <motion.span
                    key="ra"
                    className="font-[family-name:var(--font-playfair)] font-medium tracking-[-0.03em] text-[#3B82F6] leading-none"
                    style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
                    initial={phase === 'rejoin' ? { y: '110%', opacity: 0, filter: 'blur(8px)' } : false}
                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: '-110%', opacity: 0, filter: 'blur(8px)' }}
                    transition={{ duration: 0.8, ease }}
                  >
                    ra
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Thin line */}
          <motion.div
            className="mx-auto mt-8 rounded-full"
            style={{ height: 1 }}
            animate={{
              width: isSplit || isRolling ? 100 : 0,
              opacity: isRejoined ? 0 : 1,
              backgroundColor: dividerColor,
            }}
            transition={{ ...smooth, opacity: { duration: 0.8, ease } }}
          />

          {/* Tagline */}
          <motion.p
            className="text-center mt-5 text-[13px] tracking-[0.08em]"
            animate={{
              opacity: isSplit || isRolling ? 0.6 : 0,
              y: isSplit || isRolling ? 0 : 6,
              color: step >= 4 ? '#CBD5E1' : '#94A3B8',
            }}
            transition={{ ...smooth, y: { duration: 1, ease } }}
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
              transition={{ duration: 2, delay: 0.4, ease }}
            >
              {/* Nav logo */}
              <motion.p
                className="absolute top-8 left-1/2 -translate-x-1/2 font-[family-name:var(--font-playfair)] text-[22px] font-semibold"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 1, ease }}
              >
                <span className="text-white">Meet</span>
                <span className="text-[#60A5FA]">ra</span>
              </motion.p>

              <motion.p
                className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA]/60 mb-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.7, ease }}
              >
                Join the waitlist
              </motion.p>

              <motion.h1
                className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,5vw,4.5rem)] font-medium text-white tracking-[-0.025em] leading-[1.08] max-w-3xl"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, delay: 0.9, ease }}
              >
                Meet the right people<br />at every event.
              </motion.h1>

              <motion.p
                className="mt-6 text-[15px] text-white/30 max-w-md leading-relaxed"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 1.3, ease }}
              >
                Every event has the right person for you. Meetra finds them.
              </motion.p>

              {/* CTA button */}
              <motion.a
                href="#waitlist-cta"
                className="
                  mt-10 inline-flex items-center gap-2 bg-white text-[#0F172A] px-8 py-4 rounded-full
                  text-[14px] font-medium
                  hover:bg-white/90 active:bg-white/80
                  transition-all duration-300
                  hover:shadow-[0_8px_32px_rgba(255,255,255,0.12)]
                "
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 1.7, ease }}
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
                transition={{ duration: 1.2, delay: 2.2, ease }}
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-[18px] h-7 rounded-full border border-white/12 flex items-start justify-center pt-1.5"
                >
                  <motion.div
                    className="w-[3px] h-[5px] rounded-full bg-white/25"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
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
