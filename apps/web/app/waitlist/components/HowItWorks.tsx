'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

const steps = [
  { num: '01', text: 'Upload your resume — our AI learns who you should meet.' },
  { num: '02', text: 'RSVP to a curated event. One tap, you\u2019re in.' },
  { num: '03', text: 'Walk in knowing exactly who to talk to and why.' },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-[#0A0F1C] border-t border-white/[0.06] py-24 sm:py-32 px-6 sm:px-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Image */}
        <motion.div
          className="relative aspect-[4/3] rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
        >
          <img
            src="/connect.jpg"
            alt="People networking at an event"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C]/50 via-transparent to-transparent" />
        </motion.div>

        {/* Steps */}
        <div>
          <motion.p
            className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA]/50 mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease }}
          >
            How it works
          </motion.p>
          <motion.h2
            className="font-[family-name:var(--font-playfair)] text-[clamp(1.6rem,3.5vw,2.5rem)] font-medium text-white tracking-[-0.02em] leading-[1.2] mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.1, ease }}
          >
            Three steps. Zero awkwardness.
          </motion.h2>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex gap-4 items-start"
                initial={{ opacity: 0, y: 14 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.1, ease }}
              >
                <span className="text-[12px] font-mono text-[#60A5FA]/40 mt-1 shrink-0">
                  {step.num}
                </span>
                <p className="text-[15px] text-white/50 leading-relaxed">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
