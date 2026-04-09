'use client';

import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const diffs = [
  {
    title: 'Personalized, not generic',
    desc: `Meetra doesn't show you a list of attendees. It shows you your list — filtered, ranked, and explained based on what you're actually trying to do.`,
  },
  {
    title: 'Context, not just names',
    desc: `Knowing someone's title isn't enough. Meetra tells you why they're relevant to you and gives you a real reason to walk up to them.`,
  },
  {
    title: 'Built for the shy, the new, the underestimated',
    desc: `Most networking tools make extroverts more powerful. Meetra gives everyone the same advantage: information, context, and a clear plan.`,
  },
];

export default function WhyMeetraSection() {
  return (
    <section className="py-24 sm:py-32 lg:py-40 px-6 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease }}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden order-2 lg:order-1"
          >
            <img
              src="/cta-bg.jpg"
              alt="Meetra in action"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/50 via-transparent to-transparent" />
          </motion.div>

          {/* Right — text */}
          <div className="order-1 lg:order-2">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease }}
              className="wl-micro-label mb-5"
            >
              Why Meetra
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.05, ease }}
              className="wl-section-headline mb-12"
            >
              Not a directory. Not a CRM. Not another LinkedIn feature.
            </motion.h2>

            <div className="space-y-10">
              {diffs.map((d, i) => (
                <motion.div
                  key={d.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease }}
                  className="flex gap-6"
                >
                  <div className="flex-shrink-0 pt-1">
                    <span className="font-[family-name:var(--font-playfair)] text-2xl font-medium text-[#E2E8F0]">
                      0{i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg font-medium text-[#0F172A] mb-2">
                      {d.title}
                    </h3>
                    <p className="text-[14px] text-[#64748B] leading-relaxed">{d.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
