'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Attempt to measure a ref's bounding rect relative to the sticky container.
 * Returns center-x, center-y relative to viewport when sticky is active.
 */
function useRelativeRect(ref: React.RefObject<HTMLElement | null>, deps: unknown[]) {
  const [rect, setRect] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setRect({ x: r.left, y: r.top });
    };
    const t = setTimeout(measure, 120);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return rect;
}

/** Ease-out quart */
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

/** Clamp + normalize a value within a range to 0..1 */
function norm(value: number, start: number, end: number) {
  return Math.min(Math.max((value - start) / (end - start), 0), 1);
}

interface Props {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  heroReady: boolean;
}

/*
 * Scroll phases (within 0..1 of scrollYProgress):
 *
 * Phase 1 (0.04 – 0.28): "Meet" flies from nav → sentence position.
 *   "Meeting the right people" reveals. "shouldn't be left to chance." reveals.
 *
 * Phase 2 (0.32 – 0.52): Sentence 1 fades. "right people" and "event" migrate
 *   into sentence 2: "The right people are already at your next event."
 *
 * Phase 3 (0.56 – 0.78): Sentence 2 fades. "Meet" recombines with "ra" →
 *   "Meetra finds them before you arrive."
 *
 * Phase 4 (0.82 – 0.95): Final sentence holds, then fades to transition out.
 */

export default function WordJourney({ sectionRef, heroReady }: Props) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setProgress(v));

  /* ── Refs for measuring word positions ── */
  const meetS1Ref = useRef<HTMLSpanElement>(null);
  const rightPeopleS1Ref = useRef<HTMLSpanElement>(null);
  const rightPeopleS2Ref = useRef<HTMLSpanElement>(null);
  const meetS3Ref = useRef<HTMLSpanElement>(null);

  const meetS1Rect = useRelativeRect(meetS1Ref, [heroReady]);
  const rightPeopleS1Rect = useRelativeRect(rightPeopleS1Ref, [heroReady]);
  const rightPeopleS2Rect = useRelativeRect(rightPeopleS2Ref, [heroReady]);
  const meetS3Rect = useRelativeRect(meetS3Ref, [heroReady]);

  /* ── Phase 1: "Meet" flies in, sentence 1 reveals ── */
  const p1Enter = easeOut(norm(progress, 0.04, 0.22));

  // "Meet" position: from nav to sentence
  const navX = typeof window !== 'undefined' ? window.innerWidth / 2 - 30 : 500;
  const navY = 24;
  const meetOffX = meetS1Rect ? navX - meetS1Rect.x : 0;
  const meetOffY = meetS1Rect ? navY - meetS1Rect.y : 0;
  const meetTx = meetOffX * (1 - p1Enter);
  const meetTy = meetOffY * (1 - p1Enter);
  const meetScale = 0.39 + p1Enter * 0.61;

  // "ra" fades out as Meet separates from Meetra
  const raFade = easeOut(norm(p1Enter, 0.2, 0.6));

  // Rest of sentence 1 text
  const s1TextReveal = easeOut(norm(p1Enter, 0.45, 1));
  const s1Line2Reveal = easeOut(norm(p1Enter, 0.55, 1));

  // Sentence 1 overall opacity (fades out for phase 2)
  const s1FadeOut = easeOut(norm(progress, 0.28, 0.34));
  const s1Opacity = Math.min(p1Enter, 1 - s1FadeOut);

  /* ── Phase 2: "The right people are already at your next event." ── */
  const p2Enter = easeOut(norm(progress, 0.32, 0.48));
  const p2FadeOut = easeOut(norm(progress, 0.52, 0.58));
  const s2Opacity = Math.min(p2Enter, 1 - p2FadeOut);

  // "right people" migration: from sentence 1 position to sentence 2 position
  const rpMigrate = easeOut(norm(progress, 0.30, 0.42));
  const rpOffX = rightPeopleS1Rect && rightPeopleS2Rect
    ? (rightPeopleS1Rect.x - rightPeopleS2Rect.x) * (1 - rpMigrate)
    : 0;
  const rpOffY = rightPeopleS1Rect && rightPeopleS2Rect
    ? (rightPeopleS1Rect.y - rightPeopleS2Rect.y) * (1 - rpMigrate)
    : 0;

  // Other words in sentence 2
  const s2RestReveal = easeOut(norm(p2Enter, 0.3, 1));

  /* ── Phase 3: "Meetra finds them before you arrive." ── */
  const p3Enter = easeOut(norm(progress, 0.56, 0.72));
  const p3FadeOut = easeOut(norm(progress, 0.82, 0.90));
  const s3Opacity = Math.min(p3Enter, 1 - p3FadeOut);

  // "Meet" migrates from sentence 1 area to sentence 3 "Meetra" position
  const meetMigrate = easeOut(norm(progress, 0.54, 0.66));
  const meetToS3X = meetS1Rect && meetS3Rect
    ? (meetS1Rect.x - meetS3Rect.x) * (1 - meetMigrate)
    : 0;
  const meetToS3Y = meetS1Rect && meetS3Rect
    ? (meetS1Rect.y - meetS3Rect.y) * (1 - meetMigrate)
    : 0;

  // "ra" reappears and joins "Meet"
  const raReappear = easeOut(norm(p3Enter, 0.3, 0.7));

  // Rest of sentence 3
  const s3RestReveal = easeOut(norm(p3Enter, 0.4, 1));

  /* ── Glow ── */
  const maxGlow = Math.max(s1TextReveal * 0.06, s2Opacity * 0.05, s3Opacity * 0.07);

  return (
    <div ref={sectionRef} className="relative bg-[#0A0F1C]" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59, 130, 246, ${maxGlow}), transparent)`,
          }}
        />

        {/* Grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.015] z-[1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="px-6 max-w-4xl text-center relative z-10">

          {/* ═══════════════════════════════════════════
              SENTENCE 1: "Meeting the right people
                           shouldn't be left to chance."
              ═══════════════════════════════════════════ */}
          <h2
            className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.2vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.3] absolute inset-x-6 top-1/2 -translate-y-1/2"
            style={{ opacity: s1Opacity }}
          >
            <span className="text-white">
              {/* "Meet" — flies in from nav */}
              <span
                ref={meetS1Ref}
                className="inline-block relative"
                style={{
                  transform: `translate(${meetTx}px, ${meetTy}px) scale(${meetScale})`,
                  transformOrigin: 'left baseline',
                  zIndex: 20,
                  willChange: 'transform',
                }}
              >
                <span className="text-white">Meet</span>
                <span
                  className="absolute left-full top-0 text-[#60A5FA] whitespace-nowrap"
                  style={{
                    opacity: 1 - raFade,
                    transform: `translateX(${raFade * 14}px)`,
                    filter: `blur(${raFade * 10}px)`,
                  }}
                >
                  ra
                </span>
              </span>
              <span
                style={{
                  filter: `blur(${10 * (1 - s1TextReveal)}px)`,
                  opacity: s1TextReveal,
                  transform: `translateY(${16 * (1 - s1TextReveal)}px)`,
                  display: 'inline-block',
                }}
              >
                ing{' '}
                <span ref={rightPeopleS1Ref} className="inline">
                  the right people
                </span>
              </span>
            </span>
            <br />
            <span
              className="text-white/50 inline-block"
              style={{
                filter: `blur(${12 * (1 - s1Line2Reveal)}px)`,
                opacity: s1Line2Reveal,
                transform: `translateY(${24 * (1 - s1Line2Reveal)}px)`,
              }}
            >
              {`shouldn\u2019t be left to chance.`}
            </span>
          </h2>

          {/* ═══════════════════════════════════════════
              SENTENCE 2: "The right people are already
                           at your next event."
              ═══════════════════════════════════════════ */}
          <h2
            className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.2vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.3] absolute inset-x-6 top-1/2 -translate-y-1/2"
            style={{ opacity: s2Opacity }}
          >
            <span className="text-white">
              <span
                style={{
                  filter: `blur(${10 * (1 - s2RestReveal)}px)`,
                  opacity: s2RestReveal,
                  display: 'inline-block',
                  transform: `translateY(${12 * (1 - s2RestReveal)}px)`,
                }}
              >
                The{' '}
              </span>
              {/* "right people" — migrates from sentence 1 */}
              <span
                ref={rightPeopleS2Ref}
                className="inline-block text-[#60A5FA]"
                style={{
                  transform: `translate(${rpOffX}px, ${rpOffY}px)`,
                  willChange: 'transform',
                }}
              >
                right people
              </span>
              <span
                style={{
                  filter: `blur(${10 * (1 - s2RestReveal)}px)`,
                  opacity: s2RestReveal,
                  display: 'inline-block',
                  transform: `translateY(${12 * (1 - s2RestReveal)}px)`,
                }}
              >
                {' '}are already
              </span>
            </span>
            <br />
            <span
              className="text-white/50 inline-block"
              style={{
                filter: `blur(${12 * (1 - s2RestReveal)}px)`,
                opacity: s2RestReveal,
                transform: `translateY(${20 * (1 - s2RestReveal)}px)`,
              }}
            >
              at your next event.
            </span>
          </h2>

          {/* ═══════════════════════════════════════════
              SENTENCE 3: "Meetra finds them
                           before you arrive."
              ═══════════════════════════════════════════ */}
          <h2
            className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.2vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.3] absolute inset-x-6 top-1/2 -translate-y-1/2"
            style={{ opacity: s3Opacity }}
          >
            <span className="text-white">
              {/* "Meet" migrates back, "ra" rejoins → "Meetra" */}
              <span
                ref={meetS3Ref}
                className="inline-block relative"
                style={{
                  transform: `translate(${meetToS3X}px, ${meetToS3Y}px)`,
                  willChange: 'transform',
                }}
              >
                <span className="text-white">Meet</span>
                <span
                  className="text-[#60A5FA]"
                  style={{
                    opacity: raReappear,
                    filter: `blur(${8 * (1 - raReappear)}px)`,
                  }}
                >
                  ra
                </span>
              </span>
              <span
                style={{
                  filter: `blur(${10 * (1 - s3RestReveal)}px)`,
                  opacity: s3RestReveal,
                  display: 'inline-block',
                  transform: `translateY(${12 * (1 - s3RestReveal)}px)`,
                }}
              >
                {' '}finds them
              </span>
            </span>
            <br />
            <span
              className="text-white/50 inline-block"
              style={{
                filter: `blur(${12 * (1 - s3RestReveal)}px)`,
                opacity: s3RestReveal,
                transform: `translateY(${20 * (1 - s3RestReveal)}px)`,
              }}
            >
              before you arrive.
            </span>
          </h2>

        </div>
      </div>
    </div>
  );
}
