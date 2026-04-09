'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

/* Similar visual width words — no periods to keep it clean */
const words = ['mentors', 'founders', 'partners', 'investors', 'advisors'];

type Phase = 'intro' | 'rolling' | 'rejoin' | 'hero';

export default function HeroIntro() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [wordIndex, setWordIndex] = useState(0);

  // intro → rolling (show Meetra for 1.2s then start)
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => setPhase('rolling'), 1200);
    return () => clearTimeout(t);
  }, [phase]);

  // rolling: cycle words
  useEffect(() => {
    if (phase !== 'rolling') return;
    if (wordIndex < words.length - 1) {
      const t = setTimeout(() => setWordIndex((i) => i + 1), 700);
      return () => clearTimeout(t);
    }
    // last word — hold briefly then rejoin
    const t = setTimeout(() => setPhase('rejoin'), 900);
    return () => clearTimeout(t);
  }, [phase, wordIndex]);

  // rejoin → hero
  useEffect(() => {
    if (phase !== 'rejoin') return;
    const t = setTimeout(() => setPhase('hero'), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  const isRolling = phase === 'rolling';
  const isHero = phase === 'hero';

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#FAFAF8]">

      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Hero background ── */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: isHero ? 1 : 0, scale: isHero ? 1 : 1.06 }}
        transition={{ duration: 2, ease }}
      >
        <img src="/rooftop.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/45 via-[#0F172A]/55 to-[#0F172A]/75" />
      </motion.div>

      {/* ── Floating images during roll ── */}
      <AnimatePresence>
        {isRolling && (
          <>
            {[
              { src: '/connect.jpg', left: '5%', top: '14%', w: 150, h: 100, r: -3 },
              { src: '/rsvp.jpg', right: '7%', top: '10%', w: 135, h: 90, r: 3 },
              { src: '/discover.jpg', left: '8%', bottom: '16%', w: 125, h: 85, r: 5 },
              { src: '/disconnected.png', right: '5%', bottom: '13%', w: 140, h: 95, r: -4 },
            ].map((img, i) => (
              <motion.div
                key={img.src}
                className="absolute rounded-lg overflow-hidden"
                style={{
                  width: img.w, height: img.h,
                  left: img.left, right: img.right,
                  top: img.top, bottom: img.bottom,
                }}
                initial={{ opacity: 0, scale: 0.9, rotate: 0, y: 15 }}
                animate={{ opacity: 0.4, scale: 1, rotate: img.r, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.8, ease } }}
                transition={{ duration: 1.2, delay: i * 0.1, ease }}
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
            scale: isHero ? 0.35 : 1,
            y: isHero ? '-38vh' : 0,
          }}
          transition={{ duration: 1.4, ease }}
        >
          <div className="flex items-baseline justify-center">
            {/* "Meet" — always in place */}
            <span
              className="font-[family-name:var(--font-playfair)] font-medium tracking-[-0.03em] text-[#0F172A] leading-none"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
            >
              Meet
            </span>

            {/* Ticker slot — always visible, clips content */}
            <div
              className="relative overflow-hidden"
              style={{
                height: 'clamp(3.5rem, 9vw, 8rem)',
                width: 'clamp(10rem, 28vw, 24rem)',
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isRolling ? (
                  <motion.span
                    key={words[wordIndex]}
                    className="absolute left-0 bottom-0 font-[family-name:var(--font-playfair)] font-medium tracking-[-0.03em] text-[#3B82F6] leading-none whitespace-nowrap"
                    style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    {words[wordIndex]}
                  </motion.span>
                ) : (
                  <motion.span
                    key="ra"
                    className="absolute left-0 bottom-0 font-[family-name:var(--font-playfair)] font-medium tracking-[-0.03em] text-[#3B82F6] leading-none"
                    style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
                    initial={phase === 'rejoin' ? { y: '100%', opacity: 0 } : false}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    ra
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Thin line */}
          <motion.div
            className="mx-auto mt-6 bg-[#E2E8F0] rounded-full"
            style={{ height: 1 }}
            animate={{ width: isRolling ? 100 : 0, opacity: phase === 'rejoin' || isHero ? 0 : 1 }}
            transition={{ duration: 0.8, ease }}
          />

          {/* Tagline */}
          <motion.p
            className="text-center mt-4 text-[13px] text-[#94A3B8] tracking-[0.08em]"
            animate={{ opacity: isRolling ? 0.6 : 0 }}
            transition={{ duration: 0.6, ease }}
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
              transition={{ duration: 1.4, delay: 0.4, ease }}
            >
              {/* Nav logo */}
              <motion.p
                className="absolute top-8 left-1/2 -translate-x-1/2 font-[family-name:var(--font-playfair)] text-[22px] font-semibold"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1, ease }}
              >
                <span className="text-white">Meet</span>
                <span className="text-[#60A5FA]">ra</span>
              </motion.p>

              <motion.p
                className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA]/70 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease }}
              >
                Join the waitlist
              </motion.p>

              <motion.h1
                className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,5vw,4.5rem)] font-medium text-white tracking-[-0.025em] leading-[1.08] max-w-3xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8, ease }}
              >
                Meet the right people<br />at every event.
              </motion.h1>

              <motion.p
                className="mt-6 text-[15px] text-white/35 max-w-md leading-relaxed"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1, ease }}
              >
                AI-powered networking that tells you who to talk to, why they matter, and what to say.
              </motion.p>

              <motion.div
                className="absolute bottom-10 flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.8, ease }}
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
