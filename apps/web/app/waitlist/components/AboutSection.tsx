'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

const paragraphs = [
  'If you understand what someone is looking for, you become the right person for them. Meetra exists to close that gap, between what you bring and what they need to hear.',
  'It works in the room and out of it. Meetra helps you write the message that actually gets a reply, the follow-up that lands the meeting, the resume bullet that doesn’t sound like everyone else’s. The same intelligence that sharpens a conversation sharpens everything around it.',
  'An interview is easy because you know what they will ask. Most of life is the resume. You are writing into your own assumptions. Meetra removes the guesswork and replaces it with the one thing that actually moves people: knowing how to argue your case.',
];

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  // Parallax + slow zoom on the full-bleed image
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.55, 0.55, 0.7]);

  return (
    <section ref={ref} className="relative bg-[#0F1729] text-white">
      {/* — FULL-BLEED HERO BLOCK WITH OVERLAID PULL QUOTE — */}
      <div className="relative h-[90vh] sm:h-screen w-full overflow-hidden">
        {/* Background image */}
        <motion.div
          className="absolute inset-0"
          style={{ y: imageY }}
          initial={{ scale: 1.08 }}
          animate={{ scale: [1.08, 1.14, 1.08] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src="/hero-bg.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>

        {/* Color wash so it stays in our navy palette */}
        <motion.div
          className="absolute inset-0 bg-[#0F1729]"
          style={{ opacity: overlayOpacity }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(15,23,41,0.4) 0%, transparent 30%, transparent 60%, rgba(15,23,41,0.85) 100%)',
          }}
        />

        {/* Top-left "About" label */}
        <motion.div
          className="absolute top-6 sm:top-10 left-5 sm:left-10 flex items-center gap-3 z-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.4, ease }}
        >
          <motion.span
            className="block h-px bg-white/40"
            initial={{ width: 0 }}
            animate={inView ? { width: 28 } : {}}
            transition={{ duration: 0.9, delay: 0.5, ease }}
          />
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/55">
            About
          </p>
        </motion.div>

        {/* Pull quote */}
        <div className="relative z-10 h-full flex items-center px-5 sm:px-12 lg:px-20">
          <div className="w-full max-w-[1100px]">
            {/* Opening quote mark */}
            <motion.span
              className="block font-[family-name:var(--font-playfair)] italic text-[#60A5FA]/55 leading-[0.6] text-[clamp(2.5rem,7vw,6rem)] -mb-3 sm:-mb-5"
              aria-hidden
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.2, ease }}
            >
              &ldquo;
            </motion.span>

            <h2 className="font-[family-name:var(--font-playfair)] font-normal text-white tracking-[-0.015em] leading-[1.08] text-[clamp(1.75rem,4.6vw,4.5rem)]">
              <span className="block overflow-hidden" style={{ paddingBottom: '0.06em' }}>
                <motion.span
                  className="inline-block"
                  initial={{ y: '110%' }}
                  animate={inView ? { y: '0%' } : {}}
                  transition={{ duration: 1, delay: 0.3, ease }}
                >
                  You can be the{' '}
                  <span className="italic text-[#60A5FA]">
                    worst engineer
                  </span>{' '}
                  in the room.
                </motion.span>
              </span>
              <span className="block overflow-hidden" style={{ paddingBottom: '0.06em' }}>
                <motion.span
                  className="inline-block"
                  initial={{ y: '110%' }}
                  animate={inView ? { y: '0%' } : {}}
                  transition={{ duration: 1, delay: 0.5, ease }}
                >
                  But if you can argue your case, you are{' '}
                  <span className="italic text-[#60A5FA]">never wrong.&rdquo;</span>
                </motion.span>
              </span>
            </h2>

            {/* Attribution */}
            <motion.div
              className="mt-7 sm:mt-9 flex items-center gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 1.05, ease }}
            >
              <span className="block h-px w-8 bg-white/35" />
              <p className="text-[12px] sm:text-[13px] tracking-[0.18em] uppercase text-white/55">
                Mahdiar Khodabakhshi, Founder
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* — BODY BLOCK BELOW — */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-12 lg:px-20 py-20 sm:py-36">
        <div className="grid grid-cols-12 gap-8 lg:gap-20">
          {/* Left: short headline */}
          <motion.div
            className="col-span-12 lg:col-span-5"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 1.2, ease }}
          >
            <h3 className="font-[family-name:var(--font-playfair)] text-[clamp(1.4rem,2.6vw,2.25rem)] leading-[1.18] tracking-[-0.01em] text-white">
              The right words, in
              the right <span className="italic text-[#60A5FA]">moment.</span>
            </h3>
          </motion.div>

          {/* Right: paragraphs */}
          <motion.div
            className="col-span-12 lg:col-span-6 lg:col-start-7 space-y-5 sm:space-y-6 text-[14.5px] sm:text-[16px] leading-[1.7] text-white/65"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-20%' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
            }}
          >
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.95, ease },
                  },
                }}
              >
                {p}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
