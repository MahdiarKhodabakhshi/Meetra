'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const personas = [
  {
    keyword: 'Students & new grads',
    desc: 'Find recruiters, alumni, and engineers who match your interests at career fairs and campus events. Walk in with a plan instead of anxiety.',
    image: '/rsvp.jpg',
  },
  {
    keyword: 'Startup founders',
    desc: 'Identify investors, advisors, early hires, and design partners at demo days and startup meetups. Stop pitching to the wrong people.',
    image: '/cta-bg.jpg',
  },
  {
    keyword: 'Sales & BD professionals',
    desc: 'Stop spraying business cards. Focus on the high-value contacts that actually convert. Every conversation with a purpose.',
    image: '/discover.jpg',
  },
  {
    keyword: 'Career changers',
    desc: 'Moving to a new city or industry? Walk into events with a clear plan. Meetra surfaces the people who can open the right doors.',
    image: '/connect.jpg',
  },
];

export default function WhoIsItFor() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-[#0F172A]">
      {/* Background crossfade */}
      {personas.map((p, i) => (
        <motion.div
          key={p.keyword}
          initial={false}
          animate={{ opacity: active === i ? 1 : 0 }}
          transition={{ duration: 0.8, ease }}
          className="absolute inset-0"
        >
          <img src={p.image} alt="" className="w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
          <div className="absolute inset-0 bg-[#0F172A]/72" />
        </motion.div>
      ))}

      <div className="relative z-10 min-h-[80vh] flex flex-col justify-center px-6 sm:px-10 py-24">
        <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — interactive keywords */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA] mb-6">
              Who it's for
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight leading-[1.15]">
              Built for{' '}
              <span className="text-white/30">anyone who wants</span>
              <br />
              {personas.map((p, i) => (
                <span key={p.keyword}>
                  {i > 0 && <span className="text-white/15">, </span>}
                  <span
                    onMouseEnter={() => setActive(i)}
                    className={`relative cursor-pointer transition-colors duration-300 inline-block ${
                      active === i ? 'text-white' : 'text-white/25 hover:text-white/55'
                    }`}
                  >
                    {p.keyword}
                    <span
                      className={`absolute left-0 -bottom-1 h-[1.5px] bg-[#3B82F6] transition-all duration-500 ${
                        active === i ? 'w-full' : 'w-0'
                      }`}
                    />
                  </span>
                </span>
              ))}
              <span className="text-white/15">.</span>
            </h2>
          </div>

          {/* Right — description */}
          <div className="lg:pl-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease }}
              >
                <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#60A5FA]/60 tabular-nums">
                  0{active + 1}
                </span>
                <p className="mt-4 font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-white/90 tracking-tight leading-[1.4]">
                  {personas[active].keyword}
                </p>
                <p className="mt-4 text-[15px] text-white/40 leading-relaxed max-w-sm">
                  {personas[active].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
