'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Props {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  heroReady: boolean;
}

export default function ProblemStatement({ sectionRef, heroReady }: Props) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const meetRef = useRef<HTMLSpanElement>(null);
  const [offsets, setOffsets] = useState({ offsetX: 0, offsetY: 0 });

  useEffect(() => {
    if (!heroReady) return;
    const measure = () => {
      if (!meetRef.current) return;
      const rect = meetRef.current.getBoundingClientRect();
      setOffsets({
        offsetX: window.innerWidth / 2 - 30 - rect.left,
        offsetY: 24 - rect.top,
      });
    };
    const t = setTimeout(measure, 150);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(t); window.removeEventListener('resize', measure); };
  }, [heroReady]);

  // Single normalized progress
  const eased = useTransform(scrollYProgress, [0.1, 0.6], [0, 1], { clamp: true });

  // Meet: translate from nav to home
  const meetTx = useTransform(eased, [0, 1], [offsets.offsetX, 0]);
  const meetTy = useTransform(eased, [0, 1], [offsets.offsetY, 0]);
  const meetScale = useTransform(eased, [0, 1], [0.39, 1]);

  // "ra" fades out
  const raOpacity = useTransform(eased, [0.2, 0.6], [1, 0], { clamp: true });

  // Text reveals (opacity + y only, no blur)
  const textOpacity = useTransform(eased, [0.45, 0.85], [0, 1], { clamp: true });
  const textY = useTransform(eased, [0.45, 0.85], [16, 0], { clamp: true });

  const line2Opacity = useTransform(eased, [0.55, 0.9], [0, 1], { clamp: true });
  const line2Y = useTransform(eased, [0.55, 0.9], [24, 0], { clamp: true });



  return (
    <div ref={sectionRef} className="relative bg-[#0A0F1C] h-screen mb-16">
      <div className="h-full flex items-center justify-center overflow-hidden">
        <div className="px-6 max-w-4xl text-center relative z-10">
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.2vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.3]">
            <span className="text-white">
              <motion.span
                ref={meetRef}
                className="inline-block relative"
                style={{
                  x: meetTx,
                  y: meetTy,
                  scale: meetScale,
                  transformOrigin: 'left baseline',
                  zIndex: 20,
                }}
              >
                <span className="text-white">Meet</span>
                <motion.span
                  className="absolute left-full top-0 text-[#60A5FA] whitespace-nowrap"
                  style={{ opacity: raOpacity }}
                >
                  ra
                </motion.span>
              </motion.span>
              <motion.span
                className="inline-block"
                style={{ opacity: textOpacity, y: textY }}
              >
                ing the right people
              </motion.span>
            </span>
            <br />
            <motion.span
              className="text-white/50 inline-block"
              style={{ opacity: line2Opacity, y: line2Y }}
            >
              {`shouldn\u2019t be left to chance.`}
            </motion.span>
          </h2>
        </div>
      </div>
    </div>
  );
}
