'use client';

import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

type Highlight = {
  key: 'say' | 'show' | 'follow';
  word: string;
  image: string;
};

const highlights: Highlight[] = [
  { key: 'say', word: 'say', image: '/rooftop.png' },
  { key: 'show', word: 'show up', image: '/discover.png' },
  { key: 'follow', word: 'follow up', image: '/connect.png' },
];

const defaultImage = '/cta-bg.png';

export default function InteractiveHeadline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const [active, setActive] = useState<Highlight['key'] | null>(null);

  useEffect(() => {
    [defaultImage, ...highlights.map((h) => h.image)].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const activeImage =
    highlights.find((h) => h.key === active)?.image ?? defaultImage;

  return (
    <div
      ref={ref}
      className="relative h-full w-full flex items-center justify-center overflow-hidden bg-[#0A0F1C]"
    >
      {/* Backdrop image stack */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={activeImage}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.9, ease }}
          >
            <img
              src={activeImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {/* Strong dark overlay so headline always reads */}
        <div className="absolute inset-0 bg-[#0A0F1C]/75" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(10,15,28,0.55) 100%)',
          }}
        />
      </div>

      {/* Headline */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] font-normal text-white tracking-[-0.015em] leading-[1.12] text-[clamp(1.75rem,5.4vw,5rem)]">
          <Reveal inView={inView} delay={0.15} dim>
            Know what to
          </Reveal>{' '}
          <HighlightWord
            word="say"
            isActive={active === 'say'}
            anyActive={active !== null}
            onEnter={() => setActive('say')}
            onLeave={() => setActive(null)}
            inView={inView}
            delay={0.28}
          />
          <Reveal inView={inView} delay={0.36} dim>
            ,
          </Reveal>{' '}
          <Reveal inView={inView} delay={0.42} dim>
            how to
          </Reveal>{' '}
          <HighlightWord
            word="show up"
            isActive={active === 'show'}
            anyActive={active !== null}
            onEnter={() => setActive('show')}
            onLeave={() => setActive(null)}
            inView={inView}
            delay={0.55}
          />
          <Reveal inView={inView} delay={0.63} dim>
            ,
          </Reveal>{' '}
          <Reveal inView={inView} delay={0.69} dim>
            and how to
          </Reveal>{' '}
          <HighlightWord
            word="follow up"
            isActive={active === 'follow'}
            anyActive={active !== null}
            onEnter={() => setActive('follow')}
            onLeave={() => setActive(null)}
            inView={inView}
            delay={0.82}
          />
          <Reveal inView={inView} delay={0.95} dim>
            .
          </Reveal>
        </h2>
      </div>
    </div>
  );
}

/* — Helpers — */

function Reveal({
  children,
  inView,
  delay = 0,
  dim = false,
}: {
  children: React.ReactNode;
  inView: boolean;
  delay?: number;
  dim?: boolean;
}) {
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        className={`inline-block ${dim ? 'dimmable' : ''}`}
        initial={{ y: '110%' }}
        animate={inView ? { y: '0%' } : {}}
        transition={{ duration: 1, delay, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function HighlightWord({
  word,
  isActive,
  anyActive,
  onEnter,
  onLeave,
  inView,
  delay,
}: {
  word: string;
  isActive: boolean;
  anyActive: boolean;
  onEnter: () => void;
  onLeave: () => void;
  inView: boolean;
  delay: number;
}) {
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        className="inline-block"
        initial={{ y: '110%' }}
        animate={inView ? { y: '0%' } : {}}
        transition={{ duration: 1, delay, ease }}
      >
        <button
          type="button"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onFocus={onEnter}
          onBlur={onLeave}
          onClick={onEnter}
          className={`relative inline-block italic font-[family-name:var(--font-playfair)] outline-none transition-colors duration-500 ${
            anyActive && !isActive
              ? 'text-[#60A5FA]/30'
              : 'text-[#60A5FA]'
          }`}
          aria-pressed={isActive}
        >
          <span className="relative z-10">{word}</span>
          {/* Static blue underline — always visible */}
          <motion.span
            className="absolute left-0 right-0 -bottom-[0.04em] h-[2px] rounded-full bg-[#60A5FA]"
            initial={false}
            animate={{ opacity: anyActive && !isActive ? 0.3 : 0.85 }}
            transition={{ duration: 0.5, ease }}
            aria-hidden
          />
          {/* Glowing overlay underline when active */}
          <motion.span
            className="absolute left-0 right-0 -bottom-[0.04em] h-[2px] origin-left rounded-full bg-[#60A5FA]"
            initial={false}
            animate={{
              scaleX: isActive ? 1 : 0,
              opacity: isActive ? 1 : 0,
            }}
            transition={{ duration: 0.5, ease }}
            style={{ boxShadow: '0 0 14px rgba(96,165,250,0.7)' }}
            aria-hidden
          />
        </button>
      </motion.span>
    </span>
  );
}
