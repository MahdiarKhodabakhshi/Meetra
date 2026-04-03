'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

const TOTAL_FRAMES = 121;
const FRAME_PATH = '/phone-frames/frame_';

function getFrameSrc(index: number) {
  const clamped = Math.max(1, Math.min(TOTAL_FRAMES, index));
  return `${FRAME_PATH}${String(clamped).padStart(4, '0')}.jpg`;
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

  // Preload all frames
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
          // Draw first frame
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

  // Parallax for the canvas itself
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 1.02]);
  const opacity = useTransform(scrollYProgress, [0, 0.08, 0.85, 1], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden bg-[#E8ECF0]">
        <motion.div
          style={{ y, scale, opacity }}
          className="relative w-full h-full flex items-center justify-center will-change-transform"
        >
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full object-contain"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </motion.div>

        {/* Loading state */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#E8ECF0]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#94A3B8]">Loading experience...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
