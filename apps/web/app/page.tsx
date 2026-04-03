'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useInView, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import TiltCard from './components/TiltCard';

const EventCardStack = dynamic(() => import('./components/EventCardStack'), { ssr: false });

const ease = [0.22, 1, 0.36, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.75, delay: 0.15 + i * 0.12, ease },
  }),
};

const stagger = { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
const up = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } } };

function CountUp({ target, suffix, duration = 2.2 }: { target: number; suffix: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const count = useMotionValue(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(count, target, {
      duration, ease,
      onUpdate: (v) => { if (ref.current) ref.current.textContent = `${Math.round(v).toLocaleString()}${suffix}`; },
    });
    return c.stop;
  }, [inView, target, suffix, duration, count]);
  return <span ref={ref} className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl font-medium tabular-nums">0{suffix}</span>;
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']);
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)']);
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.06]);

  // Parallax layers
  const connectImgY = useTransform(scrollY, [400, 1400], [40, -40]);
  const ctaImgY = useTransform(scrollY, [2000, 3600], [60, -60]);
  const statsY = useTransform(scrollY, [600, 1200], [30, -30]);

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

      {/* ── Card Stack + Intro ── */}
      <section className="py-24 sm:py-32 px-6 sm:px-10 bg-[#FAFBFC]">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
            <motion.p custom={0} variants={fade} className="text-xs font-semibold tracking-[0.2em] uppercase text-[#3B82F6]">Live on Meetra</motion.p>
            <motion.h2 custom={1} variants={fade}
              className="mt-4 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1]">
              Events happening<br />right now
            </motion.h2>
            <motion.p custom={2} variants={fade} className="mt-5 text-[15px] text-[#64748B] leading-[1.75] max-w-md">
              From intimate founder dinners to 500-person summits — a curated feed that matches your world.
            </motion.p>
            <motion.div custom={3} variants={fade}>
              <Link href="/register" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#0F172A] group">
                <span className="border-b border-[#0F172A] pb-px group-hover:border-[#3B82F6] group-hover:text-[#3B82F6] transition-colors">Browse events</span>
                <span className="text-[#94A3B8] group-hover:text-[#3B82F6] transition-colors">→</span>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease }}>
            <EventCardStack />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-20 sm:py-24 px-6 sm:px-10 border-b border-[#F1F5F9] overflow-hidden">
        <motion.div
          style={{ y: statsY }}
          className="will-change-transform"
        >
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-6">
            {[
              { target: 500, suffix: '+', label: 'Events hosted' },
              { target: 10, suffix: 'k+', label: 'Connections made' },
              { target: 98, suffix: '%', label: 'Return rate' },
              { target: 40, suffix: '+', label: 'Cities' },
            ].map((s) => (
              <motion.div key={s.label} variants={up}>
                <CountUp target={s.target} suffix={s.suffix} />
                <p className="mt-2 text-sm text-[#94A3B8]">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── How it works — 3 steps, horizontal timeline ── */}
      <section className="py-24 sm:py-32 px-6 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
            <motion.h2 custom={0} variants={fade}
              className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-medium tracking-tight">
              Three steps to your next great connection
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-0 sm:gap-0 relative">

            {/* Connector line */}
            <div className="hidden sm:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent" />

            {[
              {
                step: '01',
                title: 'Discover',
                desc: 'Browse a curated feed of events — from founder dinners to industry summits — filtered to your world.',
                color: '#EFF6FF',
                accent: '#3B82F6',
              },
              {
                step: '02',
                title: 'Commit',
                desc: 'One tap to RSVP. Your spot is locked, reminders are set, and your match list is being built.',
                color: '#F8FAFC',
                accent: '#3B82F6',
              },
              {
                step: '03',
                title: 'Connect',
                desc: 'Walk in knowing exactly who to find. We surface your matches before you even arrive.',
                color: '#EFF6FF',
                accent: '#2563EB',
              },
            ].map((item) => (
              <motion.div key={item.step} variants={up} className="relative px-0 sm:px-8 pb-12 sm:pb-0">
                <TiltCard className="h-full">
                  <div className="rounded-2xl border border-[#F1F5F9] p-8 h-full hover:border-[#E2E8F0] hover:shadow-lg hover:shadow-black/4 transition-all duration-300"
                    style={{ background: item.color }}>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-[family-name:var(--font-playfair)] text-5xl font-medium leading-none"
                        style={{ color: `${item.accent}30` }}>
                        {item.step}
                      </span>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: `${item.accent}15` }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: item.accent }} />
                      </div>
                    </div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl font-medium tracking-tight">{item.title}</h3>
                    <p className="mt-3 text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Connect image — single full-width ── */}
      <section className="px-6 sm:px-10 pb-24 sm:pb-32 overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          className="mx-auto max-w-7xl">
          <motion.div variants={up}>
            <TiltCard className="w-full">
              <div className="w-full aspect-video overflow-hidden rounded-2xl">
                <motion.img
                  src="/connect.jpg"
                  alt="People connecting at a tech event"
                  style={{ y: connectImgY, scale: 1.08 }}
                  className="w-full h-full object-cover will-change-transform"
                  loading="lazy"
                />
              </div>
            </TiltCard>
          </motion.div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-16 items-start">
            <motion.div variants={up}>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-medium tracking-tight leading-[1.2]">
                Real conversations.<br />Real opportunities.
              </h2>
            </motion.div>
            <motion.p variants={up} className="text-[15px] text-[#64748B] leading-[1.75] sm:pt-2">
              Before you arrive, we surface the people you should meet — matched on shared interests, background, and goals. Walk in knowing exactly who to find.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* ── Why Meetra — 3 value props ── */}
      <section className="py-20 sm:py-28 px-6 sm:px-10 bg-[#FAFBFC] border-t border-[#F1F5F9]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-10">
          {[
            { title: 'Event-first', desc: 'Every connection starts with a shared experience — not a profile, not a swipe.' },
            { title: 'Private by default', desc: 'Your data stays yours. Share only what you want, when you want.' },
            { title: 'Zero friction', desc: 'From sign-up to showing up, every step is designed to feel effortless.' },
          ].map((item) => (
            <motion.div key={item.title} variants={up}>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl font-medium tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
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
