'use client';
import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

const TOTAL_FRAMES = 241;
function frameSrc(i: number) {
  return `/sky-frames/frame_${String(Math.max(1, Math.min(TOTAL_FRAMES, i))).padStart(4, '0')}.jpg`;
}

export default function ScrollVideo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastFrame = useRef(0);
  const rafId = useRef(0);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const drawFrame = useCallback((idx: number) => {
    if (idx === lastFrame.current) return;
    lastFrame.current = idx;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imagesRef.current[idx - 1];
    if (!canvas || !ctx || !img || !img.complete) return;
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
    ctx.drawImage(img, 0, 0);
  }, []);

  useEffect(() => {
    let mounted = true;
    const imgs: HTMLImageElement[] = [];
    imagesRef.current = imgs;
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = frameSrc(i);
      img.onload = () => { if (i === 1 && mounted) drawFrame(1); };
      imgs.push(img);
    }
    return () => { mounted = false; };
  }, [drawFrame]);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setProgress(p);
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      drawFrame(Math.round(p * (TOTAL_FRAMES - 1)) + 1);
    });
  });

  /* Phase 1: visible 5%-35%, Phase 2: visible 50%-85% */
  const p1 = progress > 0.03 && progress < 0.40;
  const p1Op = p1 ? (progress < 0.08 ? (progress - 0.03) / 0.05 : progress > 0.33 ? 1 - (progress - 0.33) / 0.07 : 1) : 0;

  const p2 = progress > 0.45 && progress < 0.92;
  const p2Op = p2 ? (progress < 0.52 ? (progress - 0.45) / 0.07 : progress > 0.85 ? 1 - (progress - 0.85) / 0.07 : 1) : 0;

  const overlayOp = (p1Op > 0.1 || p2Op > 0.1) ? 0.4 : 0.05;

  return (
    <div ref={sectionRef} className="relative h-[350vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0F1C]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0A0F1C] transition-opacity duration-300" style={{ opacity: overlayOp }} />

        {/* Phase 1 */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-all duration-100"
          style={{ opacity: p1Op, transform: `translateY(${(1 - p1Op) * 20}px)` }}
        >
          <div className="px-8 sm:px-16 lg:px-24 max-w-2xl text-center">
            <p className="text-[10px] font-semibold tracking-[0.35em] uppercase text-white/40">Introducing Meetra</p>
            <h2 className="mt-5 font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-[3.75rem] font-medium text-white tracking-[-0.02em] leading-[1.06] drop-shadow-lg">Where every<br />connection counts</h2>
            <p className="mt-6 text-base sm:text-lg text-white/40 leading-[1.7] max-w-lg mx-auto drop-shadow-sm">No more cold DMs or awkward small talk. Meetra matches you with the right people at events you actually want to attend.</p>
          </div>
        </div>

        {/* Phase 2 */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-all duration-100"
          style={{ opacity: p2Op, transform: `translateY(${(1 - p2Op) * 20}px)` }}
        >
          <div className="px-8 sm:px-16 lg:px-24 max-w-2xl text-center">
            <p className="text-[10px] font-semibold tracking-[0.35em] uppercase text-white/40">A new way to network</p>
            <h2 className="mt-5 font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-[3.75rem] font-medium text-white tracking-[-0.02em] leading-[1.06] drop-shadow-lg">Show up prepared.<br />Leave connected.</h2>
            <p className="mt-6 text-base sm:text-lg text-white/40 leading-[1.7] max-w-lg mx-auto drop-shadow-sm">Our AI surfaces who you should meet before you walk through the door. Shared interests, mutual goals, real conversations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
