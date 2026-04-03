'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useInView, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import TiltCard from './components/TiltCard';

const EventCardStack = dynamic(() => import('./components/EventCardStack'), { ssr: false });

const ease = [0.22, 1, 0.36, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: 0.2 + i * 0.15, ease },
  }),
};

const stagger = { visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } };
const up = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };

function CountUp({ target, suffix, duration = 2.4 }: { target: number; suffix: string; duration?: number }) {
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
  const navBg = useTransform(scrollY, [0, 100], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']);
  const navBorder = useTransform(scrollY, [0, 100], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)']);
  const heroScale = useTransform(scrollY, [0, 800], [1, 1.08]);

  return (
    <div className="bg-white text-[#0F172A]">

      {/* ── Nav ── */}
      <motion.nav
        style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b"
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 sm:px-10 h-[72px]">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1, ease }}
            className="font-[family-name:var(--font-playfair)] text-[22px] font-semibold tracking-[-0.01em]">
            Meetra
          </motion.span>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2, ease }}
            className="flex items-center gap-2">
            <Link href="/login" className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors px-4 py-2">Sign in</Link>
            <Link href="/register" className="text-[13px] bg-[#0F172A] text-white px-5 py-2.5 rounded-full hover:bg-[#1E293B] transition-all hover:shadow-lg hover:shadow-black/8">Get started</Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 will-change-transform">
          <img src="/hero-bg.png" alt="" className="w-full h-full object-cover" />
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

      {/* ── Event Card Stack ── */}
      <section className="py-24 sm:py-32 px-6 sm:px-10 bg-[#FAFBFC] overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div custom={0} variants={fade}>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#3B82F6]">Live on Meetra</p>
              <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1]">
                Events happening<br />right now
              </h2>
              <p className="mt-5 text-[15px] text-[#64748B] leading-[1.75] max-w-md">
                From intimate founder dinners to 500-person summits — browse a curated feed that matches your world.
              </p>
              <Link href="/register"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#0F172A] group">
                <span className="border-b border-[#0F172A] pb-px group-hover:border-[#3B82F6] group-hover:text-[#3B82F6] transition-colors">
                  Browse events
                </span>
                <span className="text-[#94A3B8] group-hover:text-[#3B82F6] transition-colors">→</span>
              </Link>
            </motion.div>
            <motion.div custom={1} variants={fade}>
              <EventCardStack />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Intro + Stats ── */}
      <section className="py-24 sm:py-36 px-6 sm:px-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
          className="mx-auto max-w-7xl">
          <motion.p custom={0} variants={fade}
            className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-[2.5rem] font-medium leading-[1.35] tracking-tight max-w-3xl">
            Meetra is the networking platform for people who&apos;d rather have one great conversation than collect a hundred business cards.
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

      {/* ── Discover — full-bleed, 16:9 image, text below ── */}
      <section className="px-6 sm:px-10 pb-24 sm:pb-36">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          className="mx-auto max-w-7xl">
          <TiltCard className="w-full">
            <div className="w-full aspect-video overflow-hidden rounded-2xl">
              <img src="/discover.png" alt="Tech meetup venue" className="w-full h-full object-cover" />
            </div>
          </TiltCard>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-16 items-start">
            <motion.div variants={up}>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#3B82F6]">Discover</span>
              <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-medium tracking-tight leading-[1.2]">
                Events worth showing up for
              </h2>
            </motion.div>
            <motion.p variants={up} className="text-[15px] text-[#64748B] leading-[1.75] sm:pt-8">
              From intimate founder dinners to 500-person industry summits — a curated feed that matches your world. No noise. Just the ones that matter.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* ── RSVP — 3:2 image left, text right ── */}
      <section className="px-6 sm:px-10 pb-24 sm:pb-36">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-16 items-center">
          <motion.div variants={up} className="w-full aspect-[3/2] overflow-hidden rounded-2xl">
            <TiltCard className="w-full h-full">
              <img src="/rsvp.png" alt="RSVP experience" className="w-full h-full object-cover rounded-2xl" />
            </TiltCard>
          </motion.div>
          <motion.div variants={up} className="lg:py-8">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#3B82F6]">Commit</span>
            <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-[2rem] font-medium tracking-tight leading-[1.2]">
              One tap.<br />You&apos;re in.
            </h2>
            <p className="mt-5 text-[15px] text-[#64748B] leading-[1.75]">
              No forms. No friction. Tap RSVP and your spot is locked — confirmation, reminders, and your match list, handled.
            </p>
            <Link href="/register" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#0F172A] group">
              <span className="border-b border-[#0F172A] pb-px group-hover:border-[#3B82F6] group-hover:text-[#3B82F6] transition-colors">Get started free</span>
              <span className="text-[#94A3B8] group-hover:text-[#3B82F6] transition-colors">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Connect — text left, 3:2 image right ── */}
      <section className="px-6 sm:px-10 pb-24 sm:pb-36">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 lg:gap-16 items-center">
          <motion.div variants={up} className="order-2 lg:order-1 lg:py-8">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#3B82F6]">Connect</span>
            <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-[2rem] font-medium tracking-tight leading-[1.2]">
              Skip the<br />small talk
            </h2>
            <p className="mt-5 text-[15px] text-[#64748B] leading-[1.75]">
              Before you arrive, we surface the people you should meet — matched on shared interests, background, and goals. Walk in knowing exactly who to find.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {['AI matching', 'Shared interests', 'Pre-event intros'].map((t) => (
                <span key={t} className="text-[11px] font-medium text-[#475569] bg-[#F1F5F9] px-3 py-1.5 rounded-full">{t}</span>
              ))}
            </div>
          </motion.div>
          <motion.div variants={up} className="order-1 lg:order-2 w-full aspect-[3/2] overflow-hidden rounded-2xl">
            <TiltCard className="w-full h-full">
              <img src="/connect.png" alt="People connecting" className="w-full h-full object-cover rounded-2xl" />
            </TiltCard>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Value props ── */}
      <section className="py-20 sm:py-28 px-6 sm:px-10 border-t border-[#F1F5F9]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-3 gap-14 sm:gap-10">
          {[
            { title: 'Event-first', desc: 'Every connection starts with a shared experience — not a profile, not a swipe.' },
            { title: 'Private by default', desc: 'Your data stays yours. Share only what you want, when you want, with who you want.' },
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
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/cta-bg.png" alt="" className="w-full h-full object-cover" />
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
