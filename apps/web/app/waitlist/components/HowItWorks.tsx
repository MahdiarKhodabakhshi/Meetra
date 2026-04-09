'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const pillars = [
  {
    keyword: 'The feeling',
    title: 'Walk into every room like you belong there.',
    desc: 'Meetra tells you who to meet, why they matter to your goals, and exactly what to say. No more wandering. No more wasted conversations.',
    image: '/connect.jpg',
  },
  {
    keyword: 'The edge',
    title: 'Your next hire, investor, or co-founder is in the room.',
    desc: 'Stop hoping you\u2019ll bump into the right person. Meetra scans every attendee and surfaces the ones who align with what you\u2019re building.',
    image: '/newhero.png',
  },
  {
    keyword: 'The start',
    title: 'Your career starts with one conversation.',
    desc: 'First events are intimidating. Meetra removes the guesswork \u2014 you\u2019ll know who the mentors are, who\u2019s hiring, and how to introduce yourself.',
    image: '/bottomcta.png',
  },
];

export default function HowItWorks() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    if (idx !== active && idx >= 0 && idx < pillars.length) {
      setActive(idx);
    }
  }, [active]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <section
      ref={scrollRef}
      className="relative h-screen overflow-y-auto bg-[#0F172A]"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {/* Background images — crossfade (fixed within this section) */}
      <div className="sticky top-0 h-screen pointer-events-none z-0">
        {pillars.map((p, i) => (
          <motion.div
            key={p.keyword}
            initial={false}
            animate={{ opacity: active === i ? 1 : 0 }}
            transition={{ duration: 0.8, ease }}
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
      </div>

      {/* Scroll-snap panels — each one is a full viewport */}
      {pillars.map((_, i) => (
        <div
          key={i}
          className="h-screen relative z-10"
          style={{ scrollSnapAlign: 'start', marginTop: i === 0 ? '-100vh' : 0 }}
        />
      ))}

      {/* Content overlay — stays fixed visually via sticky bg */}
      <div
        className="sticky bottom-0 h-screen z-10 pointer-events-none"
        style={{ marginTop: `-${pillars.length * 100}vh` }}
      >
        <div className="h-full flex flex-col justify-center px-6 sm:px-10">
          <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center pointer-events-auto">

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
                      className={`
                        relative cursor-default transition-colors duration-300 inline-block
                        ${active === i ? 'text-white' : 'text-white/30'}
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
                  transition={{ duration: 0.4, ease }}
                >
                  <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#60A5FA]/60 tabular-nums">
                    0{active + 1}
                  </span>
                  <p className="mt-4 font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-white/90 tracking-tight leading-[1.4]">
                    {pillars[active].title}
                  </p>
                  <p className="mt-4 text-[15px] text-white/40 leading-relaxed max-w-sm">
                    {pillars[active].desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress dots */}
              <div className="mt-8 flex gap-2">
                {pillars.map((_, j) => (
                  <div
                    key={j}
                    className={`h-[3px] rounded-full transition-all duration-500 ${
                      j === active ? 'w-8 bg-[#60A5FA]/60' : 'w-3 bg-white/15'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
