'use client';

import { motion } from 'framer-motion';

function MatchCard() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="wl-glass-card p-6 max-w-sm mx-auto mt-12"
      style={{ boxShadow: '0 8px 40px rgba(79, 70, 229, 0.15)' }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          SR
        </div>
        <div>
          <p className="font-semibold text-[var(--wl-text)] text-sm">Sarah Rodriguez</p>
          <p className="text-xs text-[var(--wl-text-muted)]">ML Engineer at Stripe</p>
        </div>
        <div className="ml-auto">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(79, 70, 229, 0.15)',
              color: '#A78BFA',
            }}
          >
            94% match
          </span>
        </div>
      </div>
      <div
        className="rounded-lg p-3 text-xs leading-relaxed text-[var(--wl-text-muted)]"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        &ldquo;You both work on retrieval systems and are interested in applied ML.
        She&rsquo;s hiring for a team that aligns with your research.&rdquo;
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#A78BFA' }}
        >
          retrieval systems
        </span>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#A78BFA' }}
        >
          applied ML
        </span>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#A78BFA' }}
        >
          hiring
        </span>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const scrollToForm = () => {
    document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(79, 70, 229, 0.12), transparent)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="wl-micro-label mb-6"
        >
          NETWORKING, REIMAGINED
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="wl-gradient-text font-bold leading-[1.1] tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}
        >
          Stop networking blindly. Meet the right people, on purpose.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-[var(--wl-text-muted)] max-w-xl mx-auto leading-relaxed"
          style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
        >
          Meetra uses AI to tell you exactly who to talk to at any event — and what to say when you
          approach them. No more wasted conversations. No more missed connections.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10"
        >
          <button onClick={scrollToForm} className="wl-btn-gradient">
            Join the Waitlist — It&rsquo;s Free
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-4 text-sm text-[var(--wl-text-muted)] opacity-60"
        >
          Join hundreds of others already on the list
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <MatchCard />
        </motion.div>
      </div>
    </section>
  );
}
