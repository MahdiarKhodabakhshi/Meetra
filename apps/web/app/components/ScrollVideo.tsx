'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

const TOTAL_FRAMES = 121;

function getFrameSrc(index: number) {
  const clamped = Math.max(1, Math.min(TOTAL_FRAMES, index));
  return `/phone-frames/frame_${String(clamped).padStart(4, '0')}.jpg`;
}

export default function ScrollVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Text phases
  const t1Op = useTransform(scrollYProgress, [0.02, 0.1, 0.35, 0.42], [0, 1, 1, 0]);
  const t1Y = useTransform(scrollYProgress, [0.02, 0.1, 0.35, 0.42], [24, 0, 0, -16]);
  const t2Op = useTransform(scrollYProgress, [0.48, 0.56, 0.78, 0.86], [0, 1, 1, 0]);
  const t2Y = useTransform(scrollYProgress, [0.48, 0.56, 0.78, 0.86], [24, 0, 0, -16]);

  useEffect(() => {
    let mounted = true;
    const images: HTMLImageElement[] = [];
    let count = 0;
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      img.onload = () => {
        count++;
        if (count === TOTAL_FRAMES && mounted) {
          imagesRef.current = images;
          setLoaded(true);
          drawFrame(1);
        }
      };
      images.push(img);
    }
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imagesRef.current[frameIndex - 1];
    if (!canvas || !ctx || !img) return;
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
    ctx.drawImage(img, 0, 0);
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (!loaded) return;
    drawFrame(Math.round(p * (TOTAL_FRAMES - 1)) + 1);
  });

  return (
    <div ref={containerRef} className="relative h-[350vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#E8ECF0]">

        {/* Canvas — always full, no scale animation */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Phase 1 — left */}
        <motion.div style={{ opacity: t1Op, y: t1Y }}
          className="absolute inset-0 z-10 flex items-center pointer-events-none">
          <div className="px-8 sm:px-16 lg:px-24 max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#3B82F6]">
              Introducing
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl font-medium text-[#0F172A] tracking-tight leading-[1.08]">
              Meetra
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[#64748B] leading-relaxed max-w-md">
              The networking platform that puts events first and people at the center. No swiping. No cold DMs. Just real connections.
            </p>
          </div>
        </motion.div>

        {/* Phase 2 — right */}
        <motion.div style={{ opacity: t2Op, y: t2Y }}
          className="absolute inset-0 z-10 flex items-center justify-end pointer-events-none">
          <div className="px-8 sm:px-16 lg:px-24 max-w-md text-right">
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#3B82F6]">
              How it works
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0F172A] tracking-tight leading-[1.1]">
              Discover. RSVP.<br />Connect.
            </h2>
            <p className="mt-5 text-[15px] text-[#64748B] leading-relaxed">
              Browse curated events, reserve your spot in one tap, and get matched with the people you should meet — before you walk through the door.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {['AI matching', 'One-tap RSVP', 'Pre-event intros'].map((t) => (
                <span key={t} className="text-[11px] font-medium text-[#3B82F6] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {!loaded && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#E8ECF0]">
            <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
