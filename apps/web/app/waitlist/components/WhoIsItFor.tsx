'use client';

import { motion } from 'framer-motion';

const personas = [
  {
    emoji: '\uD83C\uDF93',
    title: 'Students & new grads',
    desc: 'Find recruiters, alumni, and engineers who match your interests at career fairs and campus events.',
  },
  {
    emoji: '\uD83D\uDE80',
    title: 'Startup founders',
    desc: 'Identify investors, advisors, early hires, and design partners at demo days and startup meetups.',
  },
  {
    emoji: '\uD83D\uDD2C',
    title: 'Researchers & academics',
    desc: 'Discover collaborators, potential advisors, and people working on problems adjacent to yours at conferences and symposiums.',
  },
  {
    emoji: '\uD83D\uDCBC',
    title: 'Sales & BD professionals',
    desc: 'Stop spraying business cards. Focus on the high-value contacts that actually convert.',
  },
  {
    emoji: '\uD83C\uDF0D',
    title: 'Career changers & newcomers',
    desc: 'Moving to a new city or industry? Walk into events with a plan instead of anxiety.',
  },
  {
    emoji: '\uD83C\uDFAA',
    title: 'Event organizers',
    desc: 'Help your attendees leave with real outcomes. Better connections mean higher satisfaction and retention.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export default function WhoIsItFor() {
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
          WHO IT&rsquo;S FOR
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="wl-section-headline max-w-3xl mb-12 lg:mb-16"
        >
          Whether you&rsquo;re job-hunting, fundraising, or just trying to make one good connection — Meetra works for you.
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {personas.map((p) => (
            <motion.div
              key={p.title}
              variants={cardVariants}
              className="wl-glass-card p-6 sm:p-7"
            >
              <span className="text-2xl block mb-3">{p.emoji}</span>
              <h3 className="font-semibold text-base mb-2 text-[var(--wl-text)]">{p.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--wl-text-muted)]">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
