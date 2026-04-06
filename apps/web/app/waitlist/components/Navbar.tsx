'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(11, 15, 26, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/waitlist" className="flex items-center gap-1 text-xl font-bold tracking-tight">
          <span
            className="inline-block w-2 h-2 rounded-full mr-0.5"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          />
          <span className="text-[var(--wl-text)]">Meetra</span>
        </a>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => scrollTo('how-it-works')}
            className="hidden sm:block text-sm text-[var(--wl-text-muted)] hover:text-[var(--wl-text)] transition-colors"
          >
            How it works
          </button>
          <button
            onClick={() => scrollTo('waitlist-form')}
            className="text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200 hover:scale-[1.03]"
            style={{
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: 'white',
            }}
          >
            Join Waitlist
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
