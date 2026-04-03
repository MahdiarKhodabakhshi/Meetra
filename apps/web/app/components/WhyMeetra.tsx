'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const pillars = [
  {
    keyword: 'Event-first',
    desc: "Every connection starts with a shared experience. We don't ask you to swipe — we ask you to show up.",
    image: '/discover.jpg',
  },
  {
    keyword: 'Private by default',
    desc: 'Your data stays yours. Share only what you want, when you want, with who you want.',
    image: '/cta-bg.jpg',
  },
  {
    keyword: 'Zero friction',
    desc: "From sign-up to showing up, every step is designed to feel effortless. One tap and you're in.",
    image: '/rsvp.jpg',
  },
];

export default function WhyMeetra() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative min-h-[90vh] sm:min-h-screen overflow-hidden bg-[#0F172A]">
      {/* Background images — crossfade */}
      {pillars.map((p, i) => (
        <motion.div
          key={p.keyword}
          initial={false}
          animate={{ opacity: active === i ? 1 : 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={p.image}
            alt=""
            className="w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-[#0F172A]/70" />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full min-h-[90vh] sm:min-h-screen flex flex-col justify-center px-6 sm:px-10">
        <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — heading with interactive keywords */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA] mb-6">
              Why Meetra
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight leading-[1.15]">
              Built{' '}
              <span className="text-white/40">for people who value</span>
              <br />
              {pillars.map((p, i) => (
                <span key={p.keyword}>
                  {i > 0 && <span className="text-white/20">, </span>}
                  <span
                    onMouseEnter={() => setActive(i)}
                    className={`
                      relative cursor-pointer transition-colors duration-300 inline-block
                      ${active === i ? 'text-white' : 'text-white/30 hover:text-white/60'}
                    `}
                  >
                    {p.keyword}
                    <span
                      className={`
                        absolute left-0 -bottom-1 h-[1.5px] bg-[#3B82F6] transition-all duration-500
                        ${active === i ? 'w-full' : 'w-0'}
                      `}
                    />
                  </span>
                </span>
              ))}
              <span className="text-white/20">.</span>
            </h2>
          </div>

          {/* Right — description that swaps */}
          <div className="lg:pl-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#60A5FA]/60 tabular-nums">
                  0{active + 1}
                </span>
                <p className="mt-4 font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-white/90 tracking-tight leading-[1.4]">
                  {pillars[active].keyword}
                </p>
                <p className="mt-4 text-[15px] text-white/40 leading-relaxed max-w-sm">
                  {pillars[active].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
