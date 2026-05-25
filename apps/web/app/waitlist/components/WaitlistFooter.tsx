'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

export default function WaitlistFooter() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <footer ref={ref} className="relative bg-[#070A14] border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="font-[family-name:var(--font-playfair)] text-[18px] font-semibold">
              <span className="text-white/80">Meet</span>
              <span className="text-[#60A5FA]/60">ra</span>
            </span>
            <span className="text-white/10">·</span>
            <span className="text-[12px] text-white/30">Know what to say.</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-[12px] text-white/20">
            <a href="#" className="hover:text-white/40 transition-colors duration-300">Privacy</a>
            <a href="#" className="hover:text-white/40 transition-colors duration-300">Terms</a>
            <a href="mailto:hello@meetra.app" className="hover:text-white/40 transition-colors duration-300">Contact</a>
          </div>
        </motion.div>

        <motion.div
          className="mt-8 pt-6 border-t border-white/[0.04] text-center"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.2, ease }}
        >
          <p className="text-[11px] text-white/10">
            &copy; {new Date().getFullYear()} Meetra. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
