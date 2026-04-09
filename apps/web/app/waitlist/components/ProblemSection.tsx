'use client';

import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const problems = [
  {
    num: '01',
    title: 'Wasted time, missed people',
    desc: `You spend 3 hours at an event talking to whoever is nearby. The one person who could've changed your trajectory was 10 feet away.`,
  },
  {
    num: '02',
    title: 'No context, no confidence',
    desc: `You spot someone interesting but don't know what they work on or how to start a conversation that isn't awkward small talk.`,
  },
  {
    num: '03',
    title: 'Networking favors the extroverted',
    desc: `Confident, well-connected people dominate these spaces. Everyone else — equally talented — gets left behind.`,
  },
  {
    num: '04',
    title: 'Events end. Connections disappear.',
    desc: `You had a good conversation but forgot to follow up. The momentum died. The opportunity vanished.`,
  },
];

export default function ProblemSection() {
  return (
    <section className="relative overflow-hidden bg-[#0F172A] py-24 sm:py-32 lg:py-40">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src="/disconnected.png" alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/60 via-[#0F172A]/80 to-[#0F172A]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease }}
          className="max-w-2xl mb-16 lg:mb-20"
        >
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA] mb-5">
            The problem
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.75rem,4vw,3rem)] font-medium leading-[1.15] tracking-tight text-white">
            You paid to be in the room. But no one told you who to talk to.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {problems.map((p, i) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className="bg-[#0F172A] p-8 sm:p-10"
            >
              <span className="font-[family-name:var(--font-playfair)] text-3xl font-medium text-white/10 block mb-4">
                {p.num}
              </span>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-medium text-white mb-3">
                {p.title}
              </h3>
              <p className="text-[14px] text-white/45 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
