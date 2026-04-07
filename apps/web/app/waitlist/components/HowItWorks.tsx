'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'Tell Meetra about you',
    desc: 'Share your background, skills, and what you\u2019re looking for \u2014 a job, a co-founder, a mentor, a collaborator, a customer. Takes under 2 minutes. You can also upload your resume or paste your LinkedIn.',
  },
  {
    num: '02',
    title: 'See who matters most',
    desc: 'When you join an event, Meetra analyzes the attendees and shows you the people most relevant to your specific goals. Not everyone \u2014 just the right ones. Each match comes with a clear reason why they matter to you.',
  },
  {
    num: '03',
    title: 'Approach with confidence',
    desc: 'For every recommended person, Meetra gives you context: what they work on, where your interests overlap, and a suggested conversation angle. You walk up prepared, not guessing.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-24 sm:py-32 lg:py-40">
      <div className="max-w-[1200px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="wl-micro-label mb-4"
        >
          HOW IT WORKS
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="wl-section-headline max-w-2xl mb-12 lg:mb-16"
        >
          Three steps. Better conversations. Real results.
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {steps.map((s) => (
            <motion.div key={s.num} variants={stepVariants} className="wl-glass-card p-8">
              <span
                className="wl-gradient-text text-4xl font-bold tracking-tight block mb-4"
              >
                {s.num}
              </span>
              <h3 className="font-semibold text-lg mb-3 text-[var(--wl-text)]">{s.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--wl-text-muted)]">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-sm text-[var(--wl-text-muted)] opacity-60 text-center lg:text-left"
        >
          Coming soon: post-event follow-up support, conversation notes, and suggested follow-up
          messages.
        </motion.p>
      </div>
    </section>
  );
}
