'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useInView, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import TiltCard from './components/TiltCard';

const ScrollVideo = dynamic(() => import('./components/ScrollVideo'), { ssr: false });

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
  const connectY = useTransform(scrollY, [2800, 4200], [40, -40]);
  const ctaY = useTransform(scrollY, [4400, 5800], [50, -50]);

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

      {/* ── Scroll Video ── */}
      <ScrollVideo />

      {/* ── Stats ── */}
      <section className="py-24 sm:py-32 px-6 sm:px-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
          className="mx-auto max-w-7xl">
          <motion.p custom={0} variants={fade}
            className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-[2.5rem] font-medium leading-[1.35] tracking-tight max-w-3xl">
            One platform for people who&apos;d rather have one great conversation than collect a hundred business cards.
          </motion.p>
          <motion.div custom={1} variants={fade}
            className="mt-16 pt-10 border-t border-[#F1F5F9] grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-6">
            {[
              { target: 500, suffix: '+', label: 'Events hosted' },
              { target: 10, suffix: 'k+', label: 'Connections made' },
              { target: 98, suffix: '%', label: 'Return rate' },
              { target: 40, suffix: '+', label: 'Cities' },
            ].map((s) => (
              <div key={s.label}>
                <CountUp target={s.target} suffix={s.suffix} />
                <p className="mt-2 text-sm text-[#94A3B8]">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Connect — full-width parallax image ── */}
      <section className="px-6 sm:px-10 pb-24 sm:pb-32 overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          className="mx-auto max-w-7xl">
          <motion.div variants={up}>
            <TiltCard className="w-full">
              <div className="w-full aspect-[16/9] overflow-hidden rounded-2xl">
                <motion.img src="/connect.jpg" alt="People connecting at a tech event"
                  style={{ y: connectY, scale: 1.1 }}
                  className="w-full h-full object-cover will-change-transform" loading="lazy" />
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

      {/* ── Three pillars ── */}
      <section className="py-24 sm:py-32 px-6 sm:px-10 bg-[#0F172A]">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
            <motion.p custom={0} variants={fade} className="text-xs font-semibold tracking-[0.25em] uppercase text-[#3B82F6]">
              Why Meetra
            </motion.p>
            <motion.h2 custom={1} variants={fade}
              className="mt-4 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-medium text-white tracking-tight leading-[1.15]">
              Built different
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Event-first',
                desc: 'Every connection starts with a shared experience. We don\'t ask you to swipe — we ask you to show up.',
              },
              {
                num: '02',
                title: 'Private by default',
                desc: 'Your data stays yours. Share only what you want, when you want, with who you want.',
              },
              {
                num: '03',
                title: 'Zero friction',
                desc: 'From sign-up to showing up, every step is designed to feel effortless. One tap and you\'re in.',
              },
            ].map((item) => (
              <motion.div key={item.num} variants={up}>
                <TiltCard className="h-full">
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 sm:p-10 h-full hover:bg-white/8 transition-colors duration-300">
                    <span className="text-[#3B82F6] font-[family-name:var(--font-playfair)] text-4xl font-medium opacity-40">
                      {item.num}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-white tracking-tight">{item.title}</h3>
                    <p className="mt-3 text-sm text-[#94A3B8] leading-relaxed">{item.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonial strip ── */}
      <section className="py-24 sm:py-32 px-6 sm:px-10 border-b border-[#F1F5F9]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
          className="mx-auto max-w-4xl text-center">
          <motion.div custom={0} variants={fade}>
            <svg className="mx-auto w-8 h-8 text-[#E2E8F0]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
            </svg>
          </motion.div>
          <motion.p custom={1} variants={fade}
            className="mt-6 font-[family-name:var(--font-playfair)] text-xl sm:text-2xl lg:text-3xl font-medium text-[#0F172A] tracking-tight leading-[1.35]">
            I walked into an AI Summit knowing exactly who to talk to. Left with a co-founder and two advisors. Meetra changed how I network.
          </motion.p>
          <motion.div custom={2} variants={fade} className="mt-8">
            <p className="text-sm font-medium text-[#0F172A]">Sarah K.</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">Product Lead · Stripe</p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <motion.img src="/cta-bg.jpg" alt=""
            style={{ y: ctaY, scale: 1.12 }}
            className="w-full h-full object-cover will-change-transform" loading="lazy" />
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
