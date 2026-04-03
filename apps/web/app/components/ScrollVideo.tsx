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

  // Text overlay transforms — two phases as user scrolls
  // Phase 1: 0% - 40% scroll — "Introducing Meetra"
  const text1Opacity = useTransform(scrollYProgress, [0.04, 0.12, 0.32, 0.4], [0, 1, 1, 0]);
  const text1Y = useTransform(scrollYProgress, [0.04, 0.12, 0.32, 0.4], [30, 0, 0, -20]);

  // Phase 2: 45% - 85% scroll — "The details"
  const text2Opacity = useTransform(scrollYProgress, [0.44, 0.52, 0.75, 0.84], [0, 1, 1, 0]);
  const text2Y = useTransform(scrollYProgress, [0.44, 0.52, 0.75, 0.84], [30, 0, 0, -20]);

  // Canvas transforms
  const canvasScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 1.02]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.06, 0.88, 1], [0, 1, 1, 0]);

  useEffect(() => {
    let mounted = true;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES && mounted) {
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

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (!loaded) return;
    const frameIndex = Math.round(progress * (TOTAL_FRAMES - 1)) + 1;
    drawFrame(frameIndex);
  });

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen overflow-hidden" style={{ background: '#E8ECF0' }}>

        {/* Canvas — fills entire viewport */}
        <motion.div
          style={{ scale: canvasScale, opacity: canvasOpacity }}
          className="absolute inset-0 will-change-transform"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </motion.div>

        {/* Text overlay — Phase 1: Brand intro */}
        <motion.div
          style={{ opacity: text1Opacity, y: text1Y }}
          className="absolute inset-0 z-10 flex items-center pointer-events-none"
        >
          <div className="px-8 sm:px-16 lg:px-24 max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#3B82F6]">
              Introducing
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl font-medium text-[#0F172A] tracking-tight leading-[1.08]">
              Meetra
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[#64748B] leading-relaxed max-w-md">
              The networking platform that puts events first and people at the center. No swiping. No cold DMs. Just real connections at real events.
            </p>
          </div>
        </motion.div>

        {/* Text overlay — Phase 2: How it works */}
        <motion.div
          style={{ opacity: text2Opacity, y: text2Y }}
          className="absolute inset-0 z-10 flex items-center justify-end pointer-events-none"
        >
          <div className="px-8 sm:px-16 lg:px-24 max-w-md text-right">
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#3B82F6]">
              How it works
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0F172A] tracking-tight leading-[1.1]">
              Discover. RSVP.
              <br />Connect.
            </h2>
            <p className="mt-5 text-[15px] text-[#64748B] leading-relaxed">
              Browse curated events, reserve your spot in one tap, and get matched with the people you should meet — before you even walk through the door.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {['AI matching', 'One-tap RSVP', 'Pre-event intros'].map((t) => (
                <span key={t} className="text-[11px] font-medium text-[#3B82F6] bg-[#EFF6FF] px-3 py-1.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {!loaded && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#E8ECF0]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#94A3B8]">Loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
