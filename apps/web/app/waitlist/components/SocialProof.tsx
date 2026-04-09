'use client';

import { motion, useInView, useMotionValue, animate } from 'framer-motion';
import { useRef, useEffect } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const count = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;
    const c = animate(count, target, {
      duration: 2,
      ease,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v).toLocaleString()}${suffix}`;
      },
    });
    return c.stop;
  }, [inView, target, suffix, count]);

  return <span ref={ref}>0{suffix}</span>;
}

const stats = [
  { target: 2400, suffix: '+', label: 'On the waitlist' },
  { target: 50, suffix: '+', label: 'Cities represented' },
  { target: 92, suffix: '%', label: 'Want AI-powered matching' },
];

export default function SocialProof() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="relative bg-[#0A0F1C] overflow-hidden">
      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <div ref={ref} className="py-20 sm:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.12, ease }}
              >
                <p className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-medium text-white tracking-tight tabular-nums">
                  <CountUp target={stat.target} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-[13px] text-white/30 tracking-wide">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>
    </section>
  );
}
