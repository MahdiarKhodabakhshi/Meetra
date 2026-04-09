'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const steps = [
  { num: '01', text: 'Upload your resume — our AI learns who you should meet.' },
  { num: '02', text: 'RSVP to a curated event. One tap, you\u2019re in.' },
  { num: '03', text: 'Walk in knowing exactly who to talk to and why.' },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Image zoom: starts at 1, slowly zooms to 1.15 as user scrolls
  const imgScale = useTransform(scrollYProgress, [0.0, 0.8], [1, 1.2]);

  // Darken overlay as text appears
  const overlayOp = useTransform(scrollYProgress, [0.15, 0.35], [0.2, 0.55]);

  // Label
  const labelOp = useTransform(scrollYProgress, [0.2, 0.32], [0, 1]);
  const labelY = useTransform(scrollYProgress, [0.2, 0.32], [12, 0]);

  // Heading
  const headOp = useTransform(scrollYProgress, [0.25, 0.38], [0, 1]);
  const headY = useTransform(scrollYProgress, [0.25, 0.38], [16, 0]);

  // Steps staggered
  const s1Op = useTransform(scrollYProgress, [0.32, 0.42], [0, 1]);
  const s1Y = useTransform(scrollYProgress, [0.32, 0.42], [14, 0]);
  const s2Op = useTransform(scrollYProgress, [0.37, 0.47], [0, 1]);
  const s2Y = useTransform(scrollYProgress, [0.37, 0.47], [14, 0]);
  const s3Op = useTransform(scrollYProgress, [0.42, 0.52], [0, 1]);
  const s3Y = useTransform(scrollYProgress, [0.42, 0.52], [14, 0]);

  const stepAnims = [
    { op: s1Op, y: s1Y },
    { op: s2Op, y: s2Y },
    { op: s3Op, y: s3Y },
  ];

  return (
    <div ref={ref} className="relative h-screen overflow-hidden">
      {/* Full-bleed image with scroll zoom */}
      <motion.div
        className="absolute inset-0 z-0 origin-center"
        style={{ scale: imgScale }}
      >
        <img
          src="/connect.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Dark overlay — intensifies as text appears */}
      <motion.div
        className="absolute inset-0 z-[1] bg-[#0A0F1C]"
        style={{ opacity: overlayOp }}
      />

      {/* Text content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="px-8 sm:px-14 max-w-xl">
          <motion.p
            className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA]/60 mb-4"
            style={{ opacity: labelOp, y: labelY }}
          >
            How it works
          </motion.p>

          <motion.h2
            className="font-[family-name:var(--font-playfair)] text-[clamp(1.6rem,3.5vw,2.5rem)] font-medium text-white tracking-[-0.02em] leading-[1.2] mb-10"
            style={{ opacity: headOp, y: headY }}
          >
            Three steps.<br />Zero awkwardness.
          </motion.h2>

          <div className="space-y-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex gap-4 items-start"
                style={{ opacity: stepAnims[i].op, y: stepAnims[i].y }}
              >
                <span className="text-[12px] font-mono text-[#60A5FA]/40 mt-0.5 shrink-0">
                  {step.num}
                </span>
                <p className="text-[15px] text-white/60 leading-relaxed">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
