'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Navbar() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.92)']);
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.04)']);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-2xl border-b"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 sm:px-10 h-[72px]">
        <motion.span
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="font-[family-name:var(--font-playfair)] text-[22px] font-semibold tracking-[-0.01em] text-[#0F172A]"
        >
          Meetra
        </motion.span>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="flex items-center gap-2"
        >
          <button
            onClick={() => scrollTo('how-it-works')}
            className="hidden sm:block text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors px-4 py-2"
          >
            How it works
          </button>
          <Link
            href="/login"
            className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <button
            onClick={() => scrollTo('waitlist-form')}
            className="text-[13px] bg-[#0F172A] text-white px-5 py-2.5 rounded-full hover:bg-[#1E293B] transition-all hover:shadow-lg hover:shadow-black/8"
          >
            Join waitlist
          </button>
        </motion.div>
      </div>
    </motion.nav>
  );
}
