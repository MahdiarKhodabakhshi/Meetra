'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
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
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const [progress, setProgress] = useState(0);

  // Calculate how far "Meet" needs to travel from its natural position to the nav position
  const calcOffset = useCallback(() => {
    if (!meetRef.current) return;
    const rect = meetRef.current.getBoundingClientRect();
    // Nav position: top center of viewport
    const navX = window.innerWidth / 2 - rect.width * 0.5;
    const navY = 24;
    // How far from natural position to nav position
    setOffset({
      x: navX - rect.left,
      y: navY - rect.top,
    });
  }, []);

  // Recalculate on resize and scroll
  useEffect(() => {
    calcOffset();
    window.addEventListener('resize', calcOffset);
    return () => window.removeEventListener('resize', calcOffset);
  }, [calcOffset, heroReady]);

  // Also recalculate when section scrolls (because sticky changes rect)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setProgress(v);
    if (v < 0.1) calcOffset(); // recalc while near the top
  });

  // Animation progress: 0 = at nav position, 1 = at natural position (home)
  // Animate between 0.15 and 0.4 of section scroll
  const t = Math.min(Math.max((progress - 0.15) / 0.25, 0), 1);

  // Easing (ease-out cubic)
  const eased = 1 - Math.pow(1 - t, 3);

  // Transform: starts at offset (nav position), ends at 0 (natural position)
  const tx = offset ? offset.x * (1 - eased) : 0;
  const ty = offset ? offset.y * (1 - eased) : 0;

  // Scale: starts small (nav size / sentence size ≈ 0.39), ends at 1
  const scale = 0.39 + eased * 0.61;

  // "ra" fades out in the second half of the animation
  const raT = Math.min(Math.max((t - 0.4) / 0.5, 0), 1);

  // Text reveal: blurry → sharp
  const textT = Math.min(Math.max((t - 0.7) / 0.3, 0), 1);
  const textBlur = 8 * (1 - textT);
  const textOpacity = 0.2 + 0.8 * textT;

  // "Meet" color: white throughout (on dark bg)
  // "ra" color: blue, fading

  return (
    <div ref={sectionRef} className="relative bg-[#0A0F1C]" style={{ height: '150vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="px-6 max-w-4xl text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.2vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.3]">
            {/* Line 1 */}
            <span className="inline-flex items-baseline flex-wrap justify-center">
              {/* "Meet" — the star of the show */}
              <span
                ref={meetRef}
                className="inline-block text-white relative"
                style={{
                  transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                  transformOrigin: 'left baseline',
                  zIndex: 20,
                }}
              >
                Meet
                {/* "ra" rides along with Meet */}
                <span
                  className="text-[#60A5FA] inline-block"
                  style={{
                    opacity: 1 - raT,
                    transform: `translateX(${raT * 15}px)`,
                    filter: `blur(${raT * 8}px)`,
                  }}
                >
                  ra
                </span>
              </span>

              {/* "ing the right people" */}
              <span
                className="text-white"
                style={{
                  filter: `blur(${textBlur}px)`,
                  opacity: textOpacity,
                }}
              >
                ing the right people
              </span>
            </span>
            <br />
            {/* Line 2 */}
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
