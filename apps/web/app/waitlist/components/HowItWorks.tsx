'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

const steps = [
  {
    num: '01',
    title: 'Upload your resume',
    desc: 'Our AI reads between the lines — your skills, your goals, the people you should know.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'RSVP to an event',
    desc: 'Browse curated gatherings — founder dinners, tech summits, creative meetups. One tap to join.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Meet your matches',
    desc: 'Before you arrive, we tell you who to talk to, why they matter, and what to say.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative bg-[#0A0F1C] py-32 sm:py-40 overflow-hidden">
      {/* Subtle top gradient blend */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0A0F1C] to-transparent z-10 pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
        >
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA]/60 mb-5">
            How it works
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4vw,3rem)] font-medium text-white tracking-[-0.02em] leading-[1.15]">
            Three steps to your<br />
            <span className="text-white/40">best conversation yet.</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="group relative"
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease }}
            >
              <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 h-full backdrop-blur-sm hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-500">
                {/* Step number */}
                <span className="text-[11px] font-mono font-medium tracking-wider text-[#60A5FA]/40 mb-6 block">
                  {step.num}
                </span>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#60A5FA]/[0.08] text-[#60A5FA]/70 flex items-center justify-center mb-5 group-hover:bg-[#60A5FA]/[0.12] group-hover:text-[#60A5FA] transition-all duration-500">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="font-[family-name:var(--font-playfair)] text-lg font-medium text-white tracking-tight mb-3">
                  {step.title}
                </h3>
                <p className="text-[14px] text-white/35 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connecting line (desktop) */}
        <motion.div
          className="hidden sm:block absolute top-[58%] left-[20%] right-[20%] h-px"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.4, delay: 0.6, ease }}
          style={{
            background: 'linear-gradient(to right, transparent, rgba(96, 165, 250, 0.15), transparent)',
            transformOrigin: 'left',
          }}
        />
      </div>
    </section>
  );
}
