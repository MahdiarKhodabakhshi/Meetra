'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const pillars = [
  {
    keyword: 'The feeling',
    title: 'Know who to meet before you walk into the room.',
    desc: 'Meetra helps event attendees find relevant people, understand why each connection matters, and prepare personalized conversation starters before networking begins.',
    image: '/connect.jpg',
    contentClassName: 'mx-auto text-center',
    titleClassName: 'max-w-[38rem] mx-auto',
    descClassName: 'max-w-[28rem] mx-auto text-white/55',
  },
  {
    keyword: 'The edge',
    title: 'Your next hire, investor, or co-founder is in the room.',
    desc: 'Stop hoping you’ll bump into the right person. Meetra scans every attendee and surfaces the ones who align with what you’re building.',
    image: '/newhero.png',
    contentClassName: 'mx-auto text-center',
    titleClassName: 'max-w-[38rem] mx-auto',
    descClassName: 'max-w-[28rem] mx-auto text-white/55',
  },
  {
    keyword: 'The start',
    title: 'Your career starts with one conversation.',
    desc: 'First events are intimidating. Meetra removes the guesswork — you’ll know who the mentors are, who’s hiring, and how to introduce yourself.',
    image: '/bottomcta.png',
    contentClassName: 'mx-auto text-center',
    titleClassName: 'max-w-[38rem] mx-auto',
    descClassName: 'max-w-[28rem] mx-auto text-white/55',
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
      <div className="relative" style={{ height: `${pillars.length * 100}vh` }}>
        <div className="sticky top-0 h-screen">
          <div className="absolute inset-0 pointer-events-none z-0">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.keyword}
                initial={false}
                animate={{ opacity: active === index ? 1 : 0 }}
                transition={{ duration: 0.8, ease }}
                className="absolute inset-0"
              >
                <img
                  src={pillar.image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-[#0F172A]/70" />
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-10">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
              <div>
                <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#60A5FA]">
                  Why Meetra
                </p>
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.15]">
                  AI-powered{' '}
                  <span className="text-white/40">event networking for better conversations.</span>
                </h2>
              </div>

              <div className="mx-auto w-full max-w-[38rem] text-center lg:justify-self-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease }}
                    className={pillars[active].contentClassName}
                  >
                    <span className="text-[18px] font-medium uppercase tracking-[0.2em] text-[#60A5FA]/60 tabular-nums">
                      0{active + 1}
                    </span>
                    <p
                      className={`mt-4 font-[family-name:var(--font-playfair)] text-xl font-medium tracking-tight text-white/90 sm:text-2xl leading-[1.4] ${pillars[active].titleClassName}`}
                    >
                      {pillars[active].title}
                    </p>
                    <p
                      className={`mt-4 text-[15px] leading-relaxed text-white/40 ${pillars[active].descClassName}`}
                    >
                      {pillars[active].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex gap-2 lg:justify-center">
                  {pillars.map((_, index) => (
                    <div
                      key={index}
                      className={`h-[3px] rounded-full transition-all duration-500 ${
                        index === active ? 'w-8 bg-[#60A5FA]/60' : 'w-3 bg-white/15'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {pillars.slice(1).map((pillar) => (
          <div
            key={pillar.keyword}
            className="h-screen"
            style={{ scrollSnapAlign: 'start' }}
          />
        ))}
      </div>
    </section>
  );
}
