'use client';

import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.15 + i * 0.12, ease },
  }),
};

export default function Hero() {
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.08]);
  const heroOverlay = useTransform(scrollY, [0, 400], [0.45, 0.72]);

  const scrollToForm = () => {
    document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex items-end overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ scale: heroScale }} className="absolute inset-0 will-change-transform">
        <img
          src="/rooftop.png"
          alt=""
          className="w-full h-full object-cover"
          fetchPriority="high"
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background: useMotionTemplate`linear-gradient(to top, rgba(15,23,42,${heroOverlay}), rgba(15,23,42,0.25), transparent)`,
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 sm:px-10 pb-16 sm:pb-24">
        <motion.div initial="hidden" animate="visible" className="mx-auto max-w-7xl">
          <motion.p
            custom={0}
            variants={fade}
            className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA] mb-6"
          >
            Early access
          </motion.p>

          <motion.h1
            custom={1}
            variants={fade}
            className="font-[family-name:var(--font-playfair)] text-[clamp(2.6rem,6.5vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white max-w-3xl"
          >
            Where the right people find&nbsp;you
          </motion.h1>

          <motion.p
            custom={2}
            variants={fade}
            className="mt-6 text-base sm:text-lg text-white/50 max-w-md leading-relaxed"
          >
            Meetra tells you exactly who to talk to at any event — and why they matter to your goals.
            No more wasted conversations.
          </motion.p>

          <motion.div
            custom={3}
            variants={fade}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button onClick={scrollToForm} className="wl-btn-primary" style={{ background: '#fff', color: '#0F172A' }}>
              Request an invite
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-white/35 hover:text-white/80 transition-colors py-4"
            >
              See how it works →
            </button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-16 flex items-center gap-3"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5"
            >
              <div className="w-1 h-1.5 rounded-full bg-white/40" />
            </motion.div>
            <span className="text-[11px] text-white/25 tracking-wider uppercase">Scroll to explore</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
