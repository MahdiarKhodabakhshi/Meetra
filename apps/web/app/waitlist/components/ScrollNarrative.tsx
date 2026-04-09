'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
  useMotionTemplate,
} from 'framer-motion';

/* ─── Story beats ─── */
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
    heading: 'No one told you\nwho to talk to.',
    body: `You scan the room. Everyone looks busy. The one person who could change your trajectory is ten feet away — and you'll never know.`,
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
    body: `A co-founder. An advisor. A customer. Meetra doesn't just connect you — it connects you with purpose.`,
  },
];

/* ─── Single chapter: image expands + text fades ─── */
function Chapter({
  image,
  label,
  heading,
  body,
  scrollYProgress,
  index,
  total,
}: {
  image: string;
  label: string;
  heading: string;
  body: string;
  scrollYProgress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const chapterSize = 1 / total;
  const start = index * chapterSize;
  const end = start + chapterSize;
  const mid = start + chapterSize * 0.5;

  // Image: starts contained (rounded, 70% width) → expands to full-bleed
  const imageScale = useTransform(
    scrollYProgress,
    [start, start + chapterSize * 0.35, mid],
    [0.7, 0.85, 1]
  );
  const imageBorderRadius = useTransform(
    scrollYProgress,
    [start, start + chapterSize * 0.35, mid],
    [24, 12, 0]
  );
  const imageOpacity = useTransform(
    scrollYProgress,
    [start, start + chapterSize * 0.08, end - chapterSize * 0.08, end],
    [0, 1, 1, 0]
  );

  // Text: fades in after image starts expanding, fades out before next chapter
  const textOpacity = useTransform(
    scrollYProgress,
    [start + chapterSize * 0.2, start + chapterSize * 0.35, end - chapterSize * 0.2, end - chapterSize * 0.08],
    [0, 1, 1, 0]
  );
  const textY = useTransform(
    scrollYProgress,
    [start + chapterSize * 0.2, start + chapterSize * 0.35, end - chapterSize * 0.2, end - chapterSize * 0.08],
    [40, 0, 0, -30]
  );

  // Overlay darkens as text appears
  const overlayOpacity = useTransform(
    scrollYProgress,
    [start, start + chapterSize * 0.25, mid, end - chapterSize * 0.1, end],
    [0.2, 0.55, 0.6, 0.55, 0.2]
  );

  const borderRadiusPx = useMotionTemplate`${imageBorderRadius}px`;

  return (
    <>
      {/* Image layer */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: imageOpacity }}
      >
        <motion.div
          className="relative overflow-hidden will-change-transform"
          style={{
            scale: imageScale,
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
          <motion.div
            className="absolute inset-0 bg-[#0F172A]"
            style={{ opacity: overlayOpacity }}
          />
        </motion.div>
      </motion.div>

      {/* Text layer */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
        style={{ opacity: textOpacity, y: textY }}
      >
        <div className="text-center px-6 max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA] mb-5">
            {label}
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,5vw,4rem)] font-medium text-white tracking-[-0.025em] leading-[1.08] whitespace-pre-line">
            {heading}
          </h2>
          <p className="mt-6 text-[15px] sm:text-base text-white/45 leading-relaxed max-w-md mx-auto">
            {body}
          </p>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Main scroll container ─── */
export default function ScrollNarrative() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Scroll indicator opacity — fades out as user starts scrolling
  const scrollCueOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  return (
    <div
      ref={containerRef}
      style={{ height: `${chapters.length * 150}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0F1C]">
        {chapters.map((ch, i) => (
          <Chapter
            key={ch.label}
            {...ch}
            scrollYProgress={scrollYProgress}
            index={i}
            total={chapters.length}
          />
        ))}

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
          style={{ opacity: scrollCueOpacity }}
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
    </div>
  );
}
