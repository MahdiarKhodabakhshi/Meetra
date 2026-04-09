'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const panels = [
  {
    label: 'What is Meetra',
    keyword: 'The feeling',
    headline: 'Walk into every room like you belong there.',
    body: 'Meetra tells you who to meet, why they matter to your goals, and exactly what to say. No more wandering. No more wasted conversations. Just the right people, at the right time.',
    image: '/connect.jpg',
  },
  {
    label: 'For founders & recruiters',
    keyword: 'The edge',
    headline: 'Your next hire, investor, or co-founder is in the room.',
    body: 'Stop hoping you\u2019ll bump into the right person. Meetra scans every attendee and surfaces the ones who align with what you\u2019re building — before you even show up.',
    image: '/newhero.png',
  },
  {
    label: 'For students & interns',
    keyword: 'The start',
    headline: 'Your career starts with one conversation.',
    body: 'First events are intimidating. Meetra removes the guesswork — you\u2019ll know who the mentors are, who\u2019s hiring, and how to introduce yourself with confidence.',
    image: '/bottomcta.png',
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const isScrolling = useRef(false);

  // Scroll-snap driven: detect which panel is in view
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isScrolling.current) return;
    const el = containerRef.current;
    const scrollTop = el.scrollTop;
    const h = el.clientHeight;
    const idx = Math.round(scrollTop / h);
    if (idx !== active && idx >= 0 && idx < panels.length) {
      setActive(idx);
    }
  }, [active]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen overflow-y-auto"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {/* Background images — crossfade */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ height: '100vh' }}>
        {panels.map((p, i) => (
          <motion.div
            key={p.label}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: active === i ? 1 : 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <img
              src={p.image}
              alt=""
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-[#0A0F1C]/65" />
          </motion.div>
        ))}
      </div>

      {/* Snap panels */}
      {panels.map((panel, i) => (
        <div
          key={panel.label}
          className="h-screen flex items-center relative z-10"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="px-8 sm:px-14 lg:px-20 w-full max-w-7xl mx-auto">
            <div className="max-w-xl">
              {/* Micro label */}
              <AnimatePresence mode="wait">
                {active === i && (
                  <motion.p
                    key={`label-${i}`}
                    className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA]/60 mb-5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    {panel.label}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Keyword */}
              <AnimatePresence mode="wait">
                {active === i && (
                  <motion.p
                    key={`kw-${i}`}
                    className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#60A5FA]/40 mb-3 tabular-nums"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    0{i + 1} — {panel.keyword}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Headline */}
              <AnimatePresence mode="wait">
                {active === i && (
                  <motion.h2
                    key={`head-${i}`}
                    className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.5vw,3.2rem)] font-medium text-white tracking-[-0.02em] leading-[1.15] mb-5"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.6, delay: 0.05, ease }}
                  >
                    {panel.headline}
                  </motion.h2>
                )}
              </AnimatePresence>

              {/* Body */}
              <AnimatePresence mode="wait">
                {active === i && (
                  <motion.p
                    key={`body-${i}`}
                    className="text-[15px] text-white/40 leading-relaxed max-w-md"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, delay: 0.1, ease }}
                  >
                    {panel.body}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="mt-10 flex gap-2">
              {panels.map((_, j) => (
                <div
                  key={j}
                  className={`h-[3px] rounded-full transition-all duration-500 ${
                    j === active
                      ? 'w-8 bg-[#60A5FA]/60'
                      : 'w-3 bg-white/15'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
