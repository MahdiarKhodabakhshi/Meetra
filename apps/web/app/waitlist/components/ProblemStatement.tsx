'use client';

import { useRef, useState, useEffect } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

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
  const [progress, setProgress] = useState(0);
  const [homeRect, setHomeRect] = useState<{ x: number; y: number } | null>(null);

  // Measure where "Meet" naturally sits (its "home" position)
  // We need to do this after the sticky kicks in
  useEffect(() => {
    if (!heroReady) return;
    const measure = () => {
      if (!meetRef.current) return;
      const rect = meetRef.current.getBoundingClientRect();
      setHomeRect({ x: rect.left, y: rect.top });
    };
    // Delay to let sticky positioning settle
    const t = setTimeout(measure, 100);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [heroReady]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setProgress(v);
  });

  // Animation: 0.1 → 0.4 of section scroll
  const t = Math.min(Math.max((progress - 0.1) / 0.3, 0), 1);
  // Ease out cubic
  const eased = 1 - Math.pow(1 - t, 3);

  // Where "Meet" should start: nav position (top center)
  const navX = typeof window !== 'undefined' ? window.innerWidth / 2 - 30 : 500;
  const navY = 24;

  // Offset from home to nav
  const offsetX = homeRect ? navX - homeRect.x : 0;
  const offsetY = homeRect ? navY - homeRect.y : 0;

  // Current transform: starts at offset, ends at 0
  const tx = offsetX * (1 - eased);
  const ty = offsetY * (1 - eased);

  // Scale: nav size (22px) / sentence size (~56px at 3.5rem) ≈ 0.39
  const scale = 0.39 + eased * 0.61;

  // "ra" fades in second half
  const raT = Math.min(Math.max((eased - 0.3) / 0.5, 0), 1);

  // Text reveal
  const textT = Math.min(Math.max((eased - 0.6) / 0.4, 0), 1);
  const textBlur = 8 * (1 - textT);
  const textOpacity = 0.15 + 0.85 * textT;

  return (
    <div ref={sectionRef} className="relative bg-[#0A0F1C]" style={{ height: '150vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="px-6 max-w-4xl text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.2vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.3]">
            <span className="text-white">
              {/* "Meet" + "ra" — Meet transforms from nav, ra is absolute so no gap */}
              <span
                ref={meetRef}
                className="inline-block relative"
                style={{
                  transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                  transformOrigin: 'left baseline',
                  zIndex: 20,
                }}
              >
                <span className="text-white">Meet</span>
                {/* "ra" — absolutely positioned so it doesn't create a gap */}
                <span
                  className="absolute left-full top-0 text-[#60A5FA] whitespace-nowrap"
                  style={{
                    opacity: 1 - raT,
                    transform: `translateX(${raT * 12}px)`,
                    filter: `blur(${raT * 8}px)`,
                  }}
                >
                  ra
                </span>
              </span>
              <span
                style={{
                  filter: `blur(${textBlur}px)`,
                  opacity: textOpacity,
                }}
              >
                ing the right people
              </span>
            </span>
            <br />
            <span
              className="text-white/50"
              style={{
                filter: `blur(${textBlur}px)`,
                opacity: textOpacity,
              }}
            >
              {`shouldn\u2019t be left to chance.`}
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
}
