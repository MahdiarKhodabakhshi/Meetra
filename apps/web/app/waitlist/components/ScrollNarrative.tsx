'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from 'framer-motion';

const chapters = [
  {
    image: '/rooftop.png',
    label: 'The scene',
    heading: 'You walk into a room\nfull of strangers.',
    body: `200 people. Name tags. Small talk. Three hours to make it count.`,
  },
  {
    image: '/disconnected.png',
    label: 'The problem',
    heading: `No one told you\nwho to talk to.`,
    body: `You scan the room. Everyone looks busy. The one person who could change your trajectory is ten feet away — and you\u2019ll never know.`,
  },
  {
    image: '/connect.jpg',
    label: 'The shift',
    heading: 'What if you\nalready knew?',
    body: `Before you arrive, Meetra tells you exactly who to meet — matched on shared interests, background, and goals.`,
  },
  {
    image: '/rsvp.jpg',
    label: 'The conversation',
    heading: 'You walk up\nprepared.',
    body: `Shared interests. Mutual goals. A real reason to talk. No more guessing, no more awkward openers.`,
  },
  {
    image: '/cta-bg.jpg',
    label: 'The result',
    heading: 'One event.\nThree conversations\nthat changed everything.',
    body: `A co-founder. An advisor. A customer. Meetra doesn\u2019t just connect you — it connects you with purpose.`,
  },
];

/* ─── Each chapter is its own scroll section ─── */
function Chapter({
  image,
  label,
  heading,
  body,
  index,
}: {
  image: string;
  label: string;
  heading: string;
  body: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Image container: starts at 65% width with rounded corners → expands to full
  const scale = useTransform(scrollYProgress, [0.1, 0.3, 0.5], [0.65, 0.85, 1]);
  const borderRadius = useTransform(scrollYProgress, [0.1, 0.3, 0.5], [28, 12, 0]);
  const borderRadiusPx = useMotionTemplate`${borderRadius}px`;

  // Overlay: darkens as text appears
  const overlayOpacity = useTransform(scrollYProgress, [0.15, 0.35, 0.65, 0.85], [0.15, 0.6, 0.6, 0.15]);

  // Text: fades in after image starts expanding
  const textOpacity = useTransform(scrollYProgress, [0.25, 0.38, 0.62, 0.75], [0, 1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0.25, 0.38, 0.62, 0.75], [50, 0, 0, -40]);

  return (
    <div ref={ref} className="h-[200vh] relative">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0F1C] flex items-center justify-center">
        {/* Image — scales from contained to full-bleed */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            className="relative overflow-hidden will-change-transform"
            style={{
              scale,
              borderRadius: borderRadiusPx,
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src={image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            {/* Dark overlay */}
            <motion.div
              className="absolute inset-0 bg-[#0F172A]"
              style={{ opacity: overlayOpacity }}
            />
          </motion.div>
        </motion.div>

        {/* Text — fades in centered */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-2xl pointer-events-none"
          style={{ opacity: textOpacity, y: textY }}
        >
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA] mb-5">
            {label}
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,5vw,4rem)] font-medium text-white tracking-[-0.025em] leading-[1.1] whitespace-pre-line">
            {heading}
          </h2>
          <p className="mt-6 text-[15px] sm:text-base text-white/45 leading-relaxed max-w-md mx-auto">
            {body}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Scroll indicator for the first section ─── */
function ScrollCue() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div ref={ref} className="absolute top-0 left-0 right-0 h-screen pointer-events-none z-20">
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        style={{ opacity }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-white/40" />
        </motion.div>
        <span className="text-[11px] text-white/25 tracking-wider uppercase">
          Scroll to explore
        </span>
      </motion.div>
    </div>
  );
}

export default function ScrollNarrative() {
  return (
    <div className="relative">
      <ScrollCue />
      {chapters.map((ch, i) => (
        <Chapter key={ch.label} {...ch} index={i} />
      ))}
    </div>
  );
}
