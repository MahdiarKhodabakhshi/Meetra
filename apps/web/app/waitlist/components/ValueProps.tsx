'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

const props = [
  {
    label: 'AI-powered matching',
    headline: 'We read your resume so you don\u2019t have to explain yourself.',
    body: 'Our AI understands your background, goals, and the kind of people who can move the needle for you. No more awkward introductions.',
    image: '/connect.jpg',
  },
  {
    label: 'Event-first design',
    headline: 'Every connection starts with a shared experience.',
    body: 'We don\u2019t ask you to swipe. We ask you to show up. Curated events with high-signal attendees, not crowded mixers.',
    image: '/discover.jpg',
  },
  {
    label: 'Conversation starters',
    headline: 'Walk in knowing exactly what to say.',
    body: 'Before you arrive, we surface shared interests, mutual connections, and talking points. Nothing feels forced.',
    image: '/rsvp.jpg',
  },
];

export default function ValueProps() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [active, setActive] = useState(0);

  return (
    <section className="relative bg-[#0A0F1C] py-32 sm:py-40 overflow-hidden">
      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
        >
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA]/50 mb-5">
            Why Meetra
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4vw,3rem)] font-medium text-white tracking-[-0.02em] leading-[1.15] max-w-xl">
            Networking shouldn&apos;t feel like work.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — interactive list */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.15, ease }}
          >
            {props.map((p, i) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setActive(i)}
                className={`
                  w-full text-left rounded-xl px-6 py-5 transition-all duration-500 group
                  ${active === i
                    ? 'bg-white/[0.04] border border-white/[0.08]'
                    : 'bg-transparent border border-transparent hover:bg-white/[0.02]'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <span className={`
                    text-[11px] font-mono tracking-wider mt-1 transition-colors duration-300
                    ${active === i ? 'text-[#60A5FA]/60' : 'text-white/15'}
                  `}>
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className={`
                      font-[family-name:var(--font-playfair)] text-[17px] font-medium tracking-tight transition-colors duration-300
                      ${active === i ? 'text-white' : 'text-white/40'}
                    `}>
                      {p.headline}
                    </h3>
                    <motion.div
                      initial={false}
                      animate={{
                        height: active === i ? 'auto' : 0,
                        opacity: active === i ? 1 : 0,
                      }}
                      transition={{ duration: 0.5, ease }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-[14px] text-white/30 leading-relaxed pr-4">
                        {p.body}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>

          {/* Right — image crossfade */}
          <motion.div
            className="relative aspect-[4/3] rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease }}
          >
            {props.map((p, i) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C]/60 via-transparent to-[#0A0F1C]/20" />
              </motion.div>
            ))}

            {/* Label overlay */}
            <div className="absolute bottom-0 inset-x-0 p-6">
              <motion.span
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#60A5FA]/60"
              >
                {props[active].label}
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
