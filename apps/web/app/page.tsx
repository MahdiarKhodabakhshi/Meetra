'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.75, delay: 0.15 + i * 0.12, ease },
  }),
};

export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']);
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)']);
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.06]);
  const ctaImgY = useTransform(scrollY, [400, 1200], [40, -40]);

  return (
    <div className="bg-white text-[#0F172A]">

      {/* ── Nav ── */}
      <motion.nav style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 sm:px-10 h-[72px]">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1, ease }}
            className="font-[family-name:var(--font-playfair)] text-[22px] font-semibold tracking-[-0.01em]">
            Meetra
          </motion.span>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2, ease }}
            className="flex items-center gap-2">
            <Link href="/login" className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors px-4 py-2">Sign in</Link>
            <Link href="/register" className="text-[13px] bg-[#0F172A] text-white px-5 py-2.5 rounded-full hover:bg-[#1E293B] transition-all hover:shadow-lg hover:shadow-black/8">Get started</Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 will-change-transform">
          <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
        </motion.div>
        <div className="relative z-10 w-full px-6 sm:px-10 pb-16 sm:pb-24">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-7xl">
            <motion.h1 custom={0} variants={fade}
              className="font-[family-name:var(--font-playfair)] text-[clamp(2.6rem,6.5vw,5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-white max-w-2xl">
              Where the right{'\u00A0'}people find you
            </motion.h1>
            <motion.p custom={1} variants={fade} className="mt-5 text-base sm:text-lg text-white/60 max-w-md leading-relaxed">
              Curated events. Intelligent matching. Conversations that turn into opportunities.
            </motion.p>
            <motion.div custom={2} variants={fade} className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/register" className="bg-white text-[#0F172A] px-7 py-3.5 rounded-full text-sm font-medium hover:bg-white/90 transition-all hover:shadow-xl hover:shadow-white/10">
                Join the community
              </Link>
              <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors py-3.5">
                I have an account →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <motion.img
            src="/cta-bg.jpg"
            alt=""
            style={{ y: ctaImgY, scale: 1.12 }}
            className="w-full h-full object-cover will-change-transform"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[#0F172A]/72" />
        </div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
          className="relative z-10 text-center px-6 py-20">
          <motion.h2 custom={0} variants={fade}
            className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-[1.1]">
            Your next conversation<br />is waiting
          </motion.h2>
          <motion.p custom={1} variants={fade} className="mt-5 text-base text-white/50 max-w-md mx-auto">
            Join a community built on real connections.
          </motion.p>
          <motion.div custom={2} variants={fade} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="bg-white text-[#0F172A] px-8 py-3.5 rounded-full text-sm font-medium hover:bg-white/90 transition-all hover:shadow-xl hover:shadow-white/10">
              Create your free account
            </Link>
            <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors py-3.5">Sign in →</Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#F1F5F9] py-12 px-6 sm:px-10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-[family-name:var(--font-playfair)] text-sm font-medium">Meetra</span>
          <p className="text-xs text-[#94A3B8]">&copy; {new Date().getFullYear()} Meetra. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-[#94A3B8]">
            <a href="#" className="hover:text-[#64748B] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#64748B] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
