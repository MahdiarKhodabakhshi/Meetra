'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, useTransform } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

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
  useEffect(() => {
    if (!heroReady) return;
    const measure = () => {
      if (!meetRef.current) return;
      const rect = meetRef.current.getBoundingClientRect();
      setHomeRect({ x: rect.left, y: rect.top });
    };
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

  // Smoother easing: ease-out quart for buttery feel
  const t = Math.min(Math.max((progress - 0.08) / 0.35, 0), 1);
  const eased = 1 - Math.pow(1 - t, 4);

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

  // "ra" fades in with smoother curve
  const raT = Math.min(Math.max((eased - 0.25) / 0.45, 0), 1);
  const raEased = 1 - Math.pow(1 - raT, 3);

  // Text reveal — smoother with longer ramp
  const textT = Math.min(Math.max((eased - 0.5) / 0.5, 0), 1);
  const textEased = 1 - Math.pow(1 - textT, 3);
  const textBlur = 10 * (1 - textEased);
  const textOpacity = textEased;
  const textY = 16 * (1 - textEased);

  // Subtle parallax on the second line
  const line2T = Math.min(Math.max((eased - 0.6) / 0.4, 0), 1);
  const line2Eased = 1 - Math.pow(1 - line2T, 3);
  const line2Blur = 12 * (1 - line2Eased);
  const line2Opacity = line2Eased;
  const line2Y = 24 * (1 - line2Eased);

  // Subtle glow behind text as it reveals
  const glowOpacity = textEased * 0.06;

  return (
    <div ref={sectionRef} className="relative bg-[#0A0F1C]" style={{ height: '160vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59, 130, 246, ${glowOpacity}), transparent)`,
            transition: 'background 0.3s ease',
          }}
        />

        <div className="px-6 max-w-4xl text-center relative z-10">
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
                  willChange: 'transform',
                }}
              >
                <span className="text-white">Meet</span>
                {/* "ra" — absolutely positioned so it doesn't create a gap */}
                <span
                  className="absolute left-full top-0 text-[#60A5FA] whitespace-nowrap"
                  style={{
                    opacity: 1 - raEased,
                    transform: `translateX(${raEased * 14}px)`,
                    filter: `blur(${raEased * 10}px)`,
                    transition: 'filter 0.1s linear',
                  }}
                >
                  ra
                </span>
              </span>
              <span
                style={{
                  filter: `blur(${textBlur}px)`,
                  opacity: textOpacity,
                  transform: `translateY(${textY}px)`,
                  display: 'inline-block',
                  transition: 'filter 0.1s linear',
                }}
              >
                ing the right people
              </span>
            </span>
            <br />
            <span
              className="text-white/50 inline-block"
              style={{
                filter: `blur(${line2Blur}px)`,
                opacity: line2Opacity,
                transform: `translateY(${line2Y}px)`,
                transition: 'filter 0.1s linear',
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
