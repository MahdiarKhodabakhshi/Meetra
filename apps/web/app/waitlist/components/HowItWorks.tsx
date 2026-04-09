'use client';

import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const steps = [
  {
    num: '01',
    title: 'Tell Meetra about you',
    desc: 'Share your background, skills, and what you're looking for — a job, a co-founder, a mentor. Takes under 2 minutes. Upload your resume or paste your LinkedIn.',
  },
  {
    num: '02',
    title: 'See who matters most',
    desc: 'When you join an event, Meetra analyzes the attendees and surfaces the people most relevant to your specific goals. Each match comes with a clear reason why.',
  },
  {
    num: '03',
    title: 'Approach with confidence',
    desc: 'For every recommended person, Meetra gives you context: what they work on, where your interests overlap, and a suggested conversation angle.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 lg:py-40 px-6 sm:px-10 bg-[#FAFBFC]">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — text */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease }}
              className="wl-micro-label mb-5"
            >
              How it works
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.05, ease }}
              className="wl-section-headline mb-14"
            >
              Three steps. Better conversations. Real results.
            </motion.h2>

            <div className="space-y-10">
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease }}
                  className="flex gap-6"
                >
                  <div className="flex-shrink-0 pt-1">
                    <span className="font-[family-name:var(--font-playfair)] text-2xl font-medium text-[#E2E8F0]">
                      {s.num}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg font-medium text-[#0F172A] mb-2">
                      {s.title}
                    </h3>
                    <p className="text-[14px] text-[#64748B] leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — image */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease }}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden"
          >
            <img
              src="/connect.jpg"
              alt="Two professionals in conversation"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA] mb-2">
                The result
              </p>
              <p className="font-[family-name:var(--font-playfair)] text-xl font-medium text-white leading-[1.3]">
                Real conversations.<br />
                <span className="text-white/50">Real opportunities.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
