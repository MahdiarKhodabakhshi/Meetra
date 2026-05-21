'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

export default function WaitlistCTA() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setState('error');
      setErrorMsg('Please enter a valid email.');
      return;
    }
    setState('loading');
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setState('success');
  };

  return (
    <section id="waitlist-cta" className="relative bg-[#0A0F1C] py-32 sm:py-40 overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(59, 130, 246, 0.06), transparent)',
        }}
      />

      <div ref={ref} className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <motion.p
          className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA]/50 mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
        >
          Early access
        </motion.p>

        <motion.h2
          className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,5vw,3.5rem)] font-medium text-white tracking-[-0.025em] leading-[1.1]"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.1, ease }}
        >
          Be the first to<br />
          <span className="text-white/40">experience Meetra.</span>
        </motion.h2>

        <motion.p
          className="mt-5 text-[15px] text-white/25 leading-relaxed max-w-xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.25, ease }}
        >
          Get early access to attendee matching and personalized conversation guidance that helps you find relevant people before the event starts.
        </motion.p>

        {/* Form */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.4, ease }}
        >
          {state === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease }}
              className="py-6"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="font-[family-name:var(--font-playfair)] text-xl text-white font-medium">
                You&apos;re on the list.
              </p>
              <p className="mt-2 text-[14px] text-white/30">
                We&apos;ll reach out when it&apos;s your turn.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
              <div className="relative flex-1 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (state === 'error') setState('idle');
                  }}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className={`
                    w-full bg-white/[0.04] border rounded-full px-5 py-3.5 text-[15px] text-white
                    placeholder:text-white/20 outline-none
                    transition-all duration-300
                    focus:bg-white/[0.06] focus:border-[#60A5FA]/30 focus:shadow-[0_0_0_3px_rgba(96,165,250,0.08)]
                    ${state === 'error' ? 'border-red-500/40' : 'border-white/[0.08]'}
                  `}
                  disabled={state === 'loading'}
                />
                {state === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-6 left-5 text-[12px] text-red-400/70"
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </div>
              <button
                type="submit"
                disabled={state === 'loading'}
                className="
                  shrink-0 bg-white text-[#0F172A] px-7 py-3.5 rounded-full text-[14px] font-medium
                  hover:bg-white/90 active:bg-white/80
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300
                  hover:shadow-[0_4px_24px_rgba(255,255,255,0.1)]
                  w-full sm:w-auto
                "
              >
                {state === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-[#0F172A]/20 border-t-[#0F172A] rounded-full animate-spin" />
                    Joining…
                  </span>
                ) : (
                  'Join waitlist'
                )}
              </button>
            </form>
          )}
        </motion.div>

        <motion.p
          className="mt-12 text-[12px] text-white/15"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.6, ease }}
        >
          No spam. Just one email when early access opens.
        </motion.p>
      </div>
    </section>
  );
}
