'use client';

import { useState, type RefObject } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

interface Props {
  sectionRef: RefObject<HTMLDivElement | null>;
  meetGapRef: RefObject<HTMLSpanElement | null>;
}

export default function ProblemStatement({ sectionRef, meetGapRef }: Props) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const [popped, setPopped] = useState(false);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v >= 0.4 && !popped) setPopped(true);
    if (v < 0.3 && popped) setPopped(false);
  });

  return (
    <div ref={sectionRef} className="relative bg-[#0A0F1C]" style={{ height: '120vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="px-6 max-w-4xl text-center">
          <h2
            className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.2vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.3] transition-all duration-700"
            style={{
              filter: popped ? 'blur(0px)' : 'blur(8px)',
              opacity: popped ? 1 : 0.25,
            }}
          >
            <span className="text-white">
              <span ref={meetGapRef} className="invisible inline">Meet</span>
              <span>ing the right people</span>
            </span>
            <br />
            <span className="text-white/50">{`shouldn\u2019t be left to chance.`}</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
