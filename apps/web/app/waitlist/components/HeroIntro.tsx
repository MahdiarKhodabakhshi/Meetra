'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const smooth = { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const };
const ease = [0.22, 1, 0.36, 1] as const;

const words = ['mentors.', 'founders.', 'partners.', 'investors.', 'advisors.'];

/* Background darkens progressively: white → cool slate → dark navy */
const bgSteps = [
  '#FAFAFA', // intro
  '#F1F5F9', // split
  '#E2E8F0', // word 0
  '#CBD5E1', // word 1
  '#64748B', // word 2
  '#334155', // word 3
  '#1E293B', // word 4
  '#0F172A', // rejoin
  '#0A0F1C', // hero
];

/* Meet text color: dark → white */
const meetColorSteps = [
  '#0F172A', // intro
  '#0F172A', // split
  '#0F172A', // word 0
  '#0F172A', // word 1
  '#F1F5F9', // word 2
  '#F8FAFC', // word 3
  '#FFFFFF', // word 4
  '#FFFFFF', // rejoin
  '#FFFFFF', // hero
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
const imageOpacitySteps = [0.35, 0.45, 0.55, 0.65, 0.7];

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
    const t = setTimeout(() => setPhase('split'), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'split') return;
    const t = setTimeout(() => setPhase('rolling'), 1000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'rolling') return;
    if (wordIndex < words.length - 1) {
      const t = setTimeout(() => setWordIndex((i) => i + 1), 1000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('rejoin'), 1400);
    return () => clearTimeout(t);
  }, [phase, wordIndex]);

  useEffect(() => {
    if (phase !== 'rejoin') return;
    const t = setTimeout(() => {
      setPhase('hero');
      onHeroReady?.();
    }, 1800);
    return () => clearTimeout(t);
  }, [phase]);

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
        transition={{ duration: 1.4, ease }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Hero background image ── */}
      <motion.div
        className="absolute inset-0 z-[2]"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{
          opacity: isHero ? 1 : 0,
          scale: isHero ? 1 : 1.06,
        }}
        transition={{ duration: 2.5, ease }}
      >
        <img src="/rooftop.png" alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/40 via-[#0F172A]/50 to-[#0F172A]/70" />
      </motion.div>

      {/* ── Floating images during roll ── */}
      <AnimatePresence>
        {isRolling && (
          <>
            {[
              { src: '/connect.jpg', left: '5%', top: '14%', w: 150, h: 100, r: -3, bobDelay: 0 },
              { src: '/rsvp.jpg', right: '7%', top: '10%', w: 135, h: 90, r: 3, bobDelay: 0.5 },
              { src: '/discover.jpg', left: '8%', bottom: '16%', w: 125, h: 85, r: 5, bobDelay: 1.0 },
              { src: '/disconnected.png', right: '5%', bottom: '13%', w: 140, h: 95, r: -4, bobDelay: 1.5 },
            ].map((img, i) => (
              <motion.div
                key={img.src}
                className="absolute rounded-lg overflow-hidden z-[3] will-change-transform"
                style={{
                  width: img.w, height: img.h,
                  left: img.left, right: img.right,
                  top: img.top, bottom: img.bottom,
                }}
                initial={{ opacity: 0, scale: 0.9, rotate: 0, y: 15 }}
                animate={{
                  opacity: floatOpacity,
                  scale: 1,
                  rotate: img.r,
                  y: [0, -8, 0],
                }}
                exit={{ opacity: 0, scale: 0.95, y: -8, transition: { duration: 1, ease } }}
                transition={{
                  opacity: { duration: 1.4, delay: i * 0.15, ease },
                  scale: { duration: 1.4, delay: i * 0.15, ease },
                  rotate: { duration: 1.4, delay: i * 0.15, ease },
                  y: {
                    duration: 3,
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
          className="select-none will-change-transform"
          animate={{
            opacity: isHero ? 0 : 1,
            scale: isHero ? 0.35 : 1,
            y: isHero ? '-38vh' : 0,
          }}
          transition={{ duration: 1.6, ease }}
        >
          <div className="flex items-baseline">

            {/* "Meet" */}
            <motion.span
              className="font-[family-name:var(--font-playfair)] font-medium tracking-[-0.03em] leading-none"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
              initial={{ opacity: 0, y: 8 }}
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
                    initial={{ y: '120%', opacity: 0, filter: 'blur(6px)' }}
                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: '-120%', opacity: 0, filter: 'blur(6px)' }}
                    transition={{ duration: 0.7, ease }}
                  >
                    {words[wordIndex]}
                  </motion.span>
                ) : (
                  <motion.span
                    key="ra"
                    className="font-[family-name:var(--font-playfair)] font-medium tracking-[-0.03em] text-[#3B82F6] leading-none"
                    style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
                    initial={phase === 'rejoin' ? { y: '120%', opacity: 0, filter: 'blur(6px)' } : false}
                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: '-120%', opacity: 0, filter: 'blur(6px)' }}
                    transition={{ duration: 0.7, ease }}
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
            transition={smooth}
          />

          {/* Tagline */}
          <motion.p
            className="text-center mt-5 text-[13px] tracking-[0.08em]"
            animate={{
              opacity: isSplit || isRolling ? 0.6 : 0,
              color: step >= 4 ? '#CBD5E1' : '#94A3B8',
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
              transition={{ duration: 1.8, delay: 0.5, ease }}
            >
              {/* Nav logo — handled by FloatingLogo at page level */}

              <motion.p
                className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA]/70 mb-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8, ease }}
              >
                Join the waitlist
              </motion.p>

              <motion.h1
                className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,5vw,4.5rem)] font-medium text-white tracking-[-0.025em] leading-[1.08] max-w-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 1, ease }}
              >
                Meet the right people<br />at every event.
              </motion.h1>

              <motion.p
                className="mt-6 text-[15px] text-white/35 max-w-md leading-relaxed"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.4, ease }}
              >
                Every event has the right person for you. Meetra finds them.
              </motion.p>

              <motion.div
                className="absolute bottom-10 flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2.4, ease }}
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-[18px] h-7 rounded-full border border-white/15 flex items-start justify-center pt-1.5"
                >
                  <div className="w-[3px] h-[5px] rounded-full bg-white/30" />
                </motion.div>
                <span className="text-[10px] text-white/20 tracking-[0.2em] uppercase">Scroll</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
