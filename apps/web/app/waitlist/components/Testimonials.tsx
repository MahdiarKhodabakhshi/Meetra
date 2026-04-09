'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

const quotes = [
  {
    text: 'I walked into an AI Summit knowing exactly who to talk to. Left with a co-founder and two advisors.',
    name: 'Sarah K.',
    role: 'Product Lead',
  },
  {
    text: 'The pre-event matching is genuinely magical. Every conversation felt intentional, not forced.',
    name: 'James R.',
    role: 'Founding Engineer',
  },
  {
    text: 'Meetra replaced every networking app I had. One platform, real connections.',
    name: 'Priya M.',
    role: 'Investor',
  },
];

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative bg-[#0A0F1C] py-28 sm:py-36 overflow-hidden">
      <div ref={ref} className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
        >
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA]/50 mb-5">
            Early feedback
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.6rem,3.5vw,2.5rem)] font-medium text-white tracking-[-0.02em] leading-[1.2]">
            In their words
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <motion.div
              key={q.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease }}
            >
              <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 h-full hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-500">
                {/* Quote mark */}
                <svg
                  className="w-6 h-6 text-white/[0.08] group-hover:text-white/[0.12] transition-colors duration-500 mb-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                </svg>

                <p className="font-[family-name:var(--font-playfair)] text-[15px] font-medium text-white/70 leading-[1.6] tracking-tight">
                  {q.text}
                </p>

                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <p className="text-[13px] font-medium text-white/50">{q.name}</p>
                  <p className="text-[11px] text-white/20 mt-0.5">{q.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
