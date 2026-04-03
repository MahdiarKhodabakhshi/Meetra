'use client';

import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useInView,
  animate,
  useMotionTemplate,
} from 'framer-motion';
import { useEffect, useRef } from 'react';
import TiltCard from './components/TiltCard';
import EventCardStack from './components/EventCardStack';
import WhyMeetra from './components/WhyMeetra';
import ScrollVideo from './components/ScrollVideo';

const ease = [0.22, 1, 0.36, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.15 + i * 0.12, ease },
  }),
};
const stagger = {
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const up = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

function CountUp({
  target,
  suffix,
  duration = 2.2,
}: {
  target: number;
  suffix: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const count = useMotionValue(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(count, target, {
      duration,
      ease,
      onUpdate: (v) => {
        if (ref.current)
          ref.current.textContent = `${Math.round(v).toLocaleString()}${suffix}`;
      },
    });
    return c.stop;
  }, [inView, target, suffix, duration, count]);
  return (
    <span
      ref={ref}
      className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl font-medium tabular-nums"
    >
      0{suffix}
    </span>
  );
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.92)']);
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.04)']);
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.08]);
  const heroOverlay = useTransform(scrollY, [0, 400], [0.4, 0.7]);
  const connectY = useTransform(scrollY, [2800, 4200], [40, -40]);

  const brands = ['Y Combinator', 'Stripe', 'Figma', 'Notion', 'Linear', 'Vercel'];

  return (
    <div className="bg-white text-[#0F172A]">

      {/* ── Nav ── */}
      <motion.nav
        style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-2xl border-b"
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 sm:px-10 h-[72px]">
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="font-[family-name:var(--font-playfair)] text-[22px] font-semibold tracking-[-0.01em]"
          >
            Meetra
          </motion.span>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="flex items-center gap-2"
          >
            <Link href="/login" className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link href="/register" className="text-[13px] bg-[#0F172A] text-white px-5 py-2.5 rounded-full hover:bg-[#1E293B] transition-all hover:shadow-lg hover:shadow-black/8">
              Get started
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 will-change-transform">
          <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover" fetchPriority="high" />
          <motion.div
            className="absolute inset-0"
            style={{
              background: useMotionTemplate`linear-gradient(to top, rgba(15,23,42,${heroOverlay}), rgba(15,23,42,0.25), transparent)`,
            }}
          />
        </motion.div>

        <div className="relative z-10 w-full px-6 sm:px-10 pb-16 sm:pb-24">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-7xl">
            <motion.h1
              custom={0} variants={fade}
              className="font-[family-name:var(--font-playfair)] text-[clamp(2.6rem,6.5vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white max-w-3xl"
            >
              Where the right{'\u00A0'}people find&nbsp;you
            </motion.h1>
            <motion.p custom={1} variants={fade} className="mt-6 text-base sm:text-lg text-white/50 max-w-md leading-relaxed">
              Curated events. Intelligent matching. Conversations that turn into opportunities.
            </motion.p>
            <motion.div custom={2} variants={fade} className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/register" className="bg-white text-[#0F172A] px-8 py-4 rounded-full text-sm font-medium hover:bg-white/95 transition-all hover:shadow-2xl hover:shadow-white/15">
                Request an invite
              </Link>
              <Link href="/login" className="text-sm text-white/35 hover:text-white/80 transition-colors py-4">
                I have an account →
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-16 flex items-center gap-3"
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5"
              >
                <div className="w-1 h-1.5 rounded-full bg-white/40" />
              </motion.div>
              <span className="text-[11px] text-white/25 tracking-wider uppercase">Scroll to explore</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Scroll Video ── */}
      <ScrollVideo />

      {/* ── Trusted By ── */}
      <section className="py-24 sm:py-28 px-6 sm:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mx-auto max-w-7xl text-center"
        >
          <motion.p custom={0} variants={fade} className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#94A3B8] mb-14">
            Trusted by teams at
          </motion.p>
          <motion.div
            custom={1}
            variants={fade}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-10 gap-x-8 items-center justify-items-center"
          >
            {brands.map((name, i) => (
              <motion.span
                key={name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease }}
                className="text-[15px] sm:text-base font-medium text-[#CBD5E1] hover:text-[#94A3B8] transition-colors duration-300 tracking-wide cursor-default select-none"
              >
                {name}
              </motion.span>
            ))}
          </motion.div>
          <motion.div custom={2} variants={fade} className="mt-14 mx-auto max-w-lg">
            <div className="h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="py-24 sm:py-28 px-6 sm:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mx-auto max-w-7xl"
        >
          <motion.div custom={0} variants={fade} className="max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#3B82F6] mb-5">
              By the numbers
            </p>
            <p className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-[2.5rem] font-medium leading-[1.3] tracking-tight">
              One platform for people who&apos;d rather have one great conversation than collect a hundred business cards.
            </p>
          </motion.div>
          <motion.div
            custom={1} variants={fade}
            className="mt-14 pt-10 border-t border-[#F1F5F9] grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-6"
          >
            {[
              { target: 500, suffix: '+', label: 'Events hosted' },
              { target: 10, suffix: 'k+', label: 'Connections made' },
              { target: 98, suffix: '%', label: 'Return rate' },
              { target: 40, suffix: '+', label: 'Cities' },
            ].map((s) => (
              <div key={s.label}>
                <CountUp target={s.target} suffix={s.suffix} />
                <p className="mt-3 text-sm text-[#94A3B8]">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Events Showcase ── */}
      <section className="py-24 sm:py-28 px-6 sm:px-10 bg-[#FAFBFC]">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          >
            <motion.div custom={0} variants={fade}>
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#3B82F6]">Upcoming</p>
              <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-medium tracking-tight leading-[1.15]">
                Curated, not crowded
              </h2>
            </motion.div>
            <motion.p custom={1} variants={fade} className="text-[13px] text-[#94A3B8] sm:text-right max-w-xs">
              Every event is hand-picked. Small groups, high signal.
            </motion.p>
          </motion.div>
          <EventCardStack />
        </div>
      </section>

      {/* ── Connect ── */}
      <section className="px-6 sm:px-10 py-24 sm:py-28 overflow-hidden">
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto max-w-7xl"
        >
          <motion.div variants={up}>
            <TiltCard className="w-full">
              <div className="relative w-full aspect-[16/9] sm:aspect-[2.2/1] overflow-hidden rounded-2xl sm:rounded-3xl">
                <motion.img
                  src="/connect.jpg" alt="People connecting at a tech event"
                  style={{ y: connectY, scale: 1.1 }}
                  className="absolute inset-0 w-full h-full object-cover will-change-transform"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/30 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-12 lg:p-16">
                  <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA] mb-4">
                    The experience
                  </p>
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight leading-[1.1] max-w-xl">
                    Real conversations.{' '}
                    <span className="text-white/50">Real opportunities.</span>
                  </h2>
                  <p className="mt-5 text-[14px] sm:text-[15px] text-white/45 leading-relaxed max-w-md">
                    Before you arrive, we surface the people you should meet — matched on shared interests, background, and goals.
                  </p>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Why Meetra ── */}
      <WhyMeetra />

      {/* ── Testimonials ── */}
      <section className="py-24 sm:py-28 px-6 sm:px-10">
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mx-auto max-w-7xl"
        >
          <motion.div custom={0} variants={fade} className="text-center mb-16">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#3B82F6]">Testimonials</p>
            <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-medium tracking-tight">
              In their words
            </h2>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {[
              { quote: 'I walked into an AI Summit knowing exactly who to talk to. Left with a co-founder and two advisors.', name: 'Sarah K.', role: 'Product Lead · Stripe' },
              { quote: 'Meetra replaced every networking app I had. The pre-event matching is genuinely magical.', name: 'James R.', role: 'Founding Engineer · Linear' },
              { quote: 'The quality of people at Meetra events is unmatched. Every conversation felt intentional.', name: 'Priya M.', role: 'Partner · Sequoia' },
            ].map((t) => (
              <motion.div key={t.name} variants={up}>
                <div className="group relative rounded-2xl border border-[#F1F5F9] bg-[#FAFBFC] p-8 h-full hover:border-[#E2E8F0] hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-500">
                  <svg className="w-7 h-7 text-[#E2E8F0] group-hover:text-[#CBD5E1] transition-colors mb-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                  </svg>
                  <p className="font-[family-name:var(--font-playfair)] text-[17px] font-medium text-[#0F172A] leading-[1.5] tracking-tight">
                    {t.quote}
                  </p>
                  <div className="mt-6 pt-5 border-t border-[#F1F5F9]">
                    <p className="text-sm font-medium text-[#0F172A]">{t.name}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 sm:py-40 overflow-hidden bg-[#0F172A]">
        {/* Radial glow */}
        <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.15), transparent)' }} />

        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="relative z-10 text-center px-6 mx-auto max-w-3xl"
        >
          <motion.h2
            custom={0} variants={fade}
            className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-[3.75rem] font-medium text-white tracking-tight leading-[1.06]"
          >
            Your next conversation<br />is waiting
          </motion.h2>
          <motion.p custom={2} variants={fade} className="mt-6 text-base sm:text-lg text-white/30 max-w-md mx-auto leading-relaxed">
            Join a community built on real connections, not vanity metrics.
          </motion.p>
          <motion.div custom={3} variants={fade} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="bg-white text-[#0F172A] px-8 py-4 rounded-full text-sm font-medium hover:bg-[#F1F5F9] transition-all hover:shadow-2xl hover:shadow-blue-500/10">
              Request an invite
            </Link>
            <Link href="/login" className="text-sm text-white/25 hover:text-white/60 transition-colors py-4">
              Sign in →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#F1F5F9] py-12 px-6 sm:px-10 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="font-[family-name:var(--font-playfair)] text-base font-semibold">Meetra</span>
              <span className="text-[11px] text-[#CBD5E1]">·</span>
              <span className="text-[11px] text-[#94A3B8]">Event-first networking</span>
            </div>
            <p className="text-xs text-[#94A3B8]">&copy; {new Date().getFullYear()} Meetra. All rights reserved.</p>
            <div className="flex items-center gap-8 text-xs text-[#94A3B8]">
              <a href="#" className="hover:text-[#64748B] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#64748B] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#64748B] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
