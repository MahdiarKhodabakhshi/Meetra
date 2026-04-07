'use client';

import { motion } from 'framer-motion';

const diffs = [
  {
    title: 'Personalized, not generic',
    desc: 'Meetra doesn\u2019t show you a list of attendees. It shows you your list \u2014 filtered, ranked, and explained based on what you\u2019re actually trying to do.',
  },
  {
    title: 'Context, not just names',
    desc: 'Knowing someone\u2019s title isn\u2019t enough. Meetra tells you why they\u2019re relevant to you and gives you a real reason to walk up to them.',
  },
  {
    title: 'Built for the shy, the new, the underestimated',
    desc: 'Most networking tools make extroverts more powerful. Meetra gives everyone the same advantage: information, context, and a clear plan.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function WhyMeetraSection() {
  return (
    <section className="relative px-6 py-24 sm:py-32 lg:py-40">
      <div className="max-w-[1200px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="wl-micro-label mb-4"
        >
          WHY MEETRA
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="wl-section-headline max-w-2xl mb-12 lg:mb-16"
        >
          Not a directory. Not a CRM. Not another LinkedIn feature.
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="space-y-10 max-w-2xl"
        >
          {diffs.map((d, i) => (
            <motion.div key={d.title} variants={itemVariants} className="flex gap-5">
              <div className="flex-shrink-0 mt-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1.5 text-[var(--wl-text)]">{d.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--wl-text-muted)]">{d.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
