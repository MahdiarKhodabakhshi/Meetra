'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useInView, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

/* ── animation presets ── */
const ease = [0.16, 1, 0.3, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 1, delay: 0.35 + i * 0.18, ease },
  }),
};

const imgReveal = {
  hidden: { opacity: 0, scale: 1.06 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.4, ease } },
};

const stagger = { visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } } };
const cardUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease } } };

/* ── count-up component ── */
function CountUp({ target, suffix, duration = 2.4 }: { target: number; suffix: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
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

/* ── page ── */
export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 100], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.92)']);
  const navBorder = useTransform(scrollY, [0, 100], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.06)']);

  return (
    <div className="min-h-screen bg-white text-[#0F172A] overflow-x-hidden">

      {/* ─── Nav ─── */}
      <motion.nav
        style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 sm:px-10 h-[72px]">
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="font-[family-name:var(--font-playfair)] text-[22px] font-semibold tracking-[-0.01em]"
          >
            Meetra
          </motion.span>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="flex items-center gap-2"
          >
            <Link href="/login" className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link href="/register" className="text-[13px] bg-[#0F172A] text-white px-5 py-2.5 rounded-full hover:bg-[#1E293B] transition-all hover:shadow-lg hover:shadow-black/10">
              Get started
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <motion.div
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease }}
          className="absolute inset-0 z-0"
        >
          <img src="/hero-bg.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-white/20" />
        </motion.div>

        <div className="relative z-10 w-full pb-20 sm:pb-28 pt-40 px-6 sm:px-10">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-7xl">
            <motion.p custom={0} variants={fade} className="text-xs font-medium tracking-[0.25em] uppercase text-[#3B82F6]">
              Event-first networking
            </motion.p>
            <motion.h1 custom={1} variants={fade} className="mt-5 font-[family-name:var(--font-playfair)] text-[clamp(2.8rem,7vw,5.5rem)] font-medium leading-[1.05] tracking-[-0.02em] max-w-3xl">
              Where the right
              <br />people find you
            </motion.h1>
            <motion.p custom={2} variants={fade} className="mt-6 text-base sm:text-lg text-[#64748B] max-w-lg leading-relaxed">
              Curated events. Intelligent matching. Conversations
              that turn into opportunities.
            </motion.p>
            <motion.div custom={3} variants={fade} className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/register" className="bg-[#3B82F6] text-white px-7 py-3.5 rounded-full text-sm font-medium hover:bg-[#2563EB] transition-all hover:shadow-xl hover:shadow-blue-500/25">
                Join the community
              </Link>
              <Link href="/login" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors px-2 py-3.5 border-b border-transparent hover:border-[#0F172A]">
                I have an account →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ribbon ─── */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 border-b border-[#F1F5F9]">
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-6"
        >
          {[
            { target: 500, suffix: '+', label: 'Events hosted' },
            { target: 10, suffix: 'k+', label: 'Connections made' },
            { target: 98, suffix: '%', label: 'Return rate' },
            { target: 40, suffix: '+', label: 'Cities' },
          ].map((s) => (
            <motion.div key={s.label} variants={cardUp}>
              <CountUp target={s.target} suffix={s.suffix} />
              <p className="mt-2 text-sm text-[#94A3B8]">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Discover — full-bleed image left ─── */}
      <section className="py-0">
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 lg:grid-cols-2 min-h-[85vh]"
        >
          <motion.div variants={imgReveal} className="relative overflow-hidden">
            <img src="/discover.png" alt="Tech meetup venue" className="w-full h-full object-cover min-h-[420px] lg:min-h-0" />
          </motion.div>

          <div className="flex items-center px-8 sm:px-16 lg:px-20 xl:px-28 py-20 lg:py-0">
            <div className="max-w-md">
              <motion.span custom={0} variants={fade} className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#3B82F6] bg-[#EFF6FF] px-3 py-1 rounded-full">
                Discover
              </motion.span>
              <motion.h2 custom={1} variants={fade} className="mt-6 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-[2.75rem] font-medium tracking-tight leading-[1.12]">
                Events worth
                <br />showing up for
              </motion.h2>
              <motion.p custom={2} variants={fade} className="mt-5 text-[15px] text-[#64748B] leading-[1.7]">
                From intimate founder dinners to 500-person industry summits — browse a curated feed of events that match your world. No noise, no spam. Just the ones that matter.
              </motion.p>
              <motion.div custom={3} variants={fade} className="mt-8 flex items-center gap-8">
                <div>
                  <p className="text-2xl font-semibold">12</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">Event categories</p>
                </div>
                <div className="w-px h-10 bg-[#E2E8F0]" />
                <div>
                  <p className="text-2xl font-semibold">Weekly</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">New events added</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── RSVP — image right ─── */}
      <section className="py-0">
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 lg:grid-cols-2 min-h-[85vh]"
        >
          <div className="flex items-center px-8 sm:px-16 lg:px-20 xl:px-28 py-20 lg:py-0 order-2 lg:order-1 bg-[#FAFBFC]">
            <div className="max-w-md">
              <motion.span custom={0} variants={fade} className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#3B82F6] bg-[#EFF6FF] px-3 py-1 rounded-full">
                Commit
              </motion.span>
              <motion.h2 custom={1} variants={fade} className="mt-6 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-[2.75rem] font-medium tracking-tight leading-[1.12]">
                One tap.
                <br />You&apos;re in.
              </motion.h2>
              <motion.p custom={2} variants={fade} className="mt-5 text-[15px] text-[#64748B] leading-[1.7]">
                No forms. No friction. See something you love, tap RSVP, and your spot is locked. We handle the confirmation, the reminders, and your match list — so you can just show up.
              </motion.p>
              <motion.div custom={3} variants={fade} className="mt-8">
                <Link href="/register" className="text-sm font-medium text-[#0F172A] inline-flex items-center gap-2 group">
                  <span className="border-b border-[#0F172A] pb-px group-hover:border-[#3B82F6] group-hover:text-[#3B82F6] transition-colors">
                    Try it yourself
                  </span>
                  <span className="text-[#94A3B8] group-hover:text-[#3B82F6] transition-colors">→</span>
                </Link>
              </motion.div>
            </div>
          </div>

          <motion.div variants={imgReveal} className="relative overflow-hidden order-1 lg:order-2">
            <img src="/rsvp.png" alt="RSVP experience" className="w-full h-full object-cover min-h-[420px] lg:min-h-0" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Connect — full-bleed image left ─── */}
      <section className="py-0">
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 lg:grid-cols-2 min-h-[85vh]"
        >
          <motion.div variants={imgReveal} className="relative overflow-hidden">
            <img src="/connect.png" alt="People connecting" className="w-full h-full object-cover min-h-[420px] lg:min-h-0" />
          </motion.div>

          <div className="flex items-center px-8 sm:px-16 lg:px-20 xl:px-28 py-20 lg:py-0">
            <div className="max-w-md">
              <motion.span custom={0} variants={fade} className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#3B82F6] bg-[#EFF6FF] px-3 py-1 rounded-full">
                Connect
              </motion.span>
              <motion.h2 custom={1} variants={fade} className="mt-6 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-[2.75rem] font-medium tracking-tight leading-[1.12]">
                Skip the small talk
              </motion.h2>
              <motion.p custom={2} variants={fade} className="mt-5 text-[15px] text-[#64748B] leading-[1.7]">
                Before you arrive, we surface the people you should meet — matched on shared interests, background, and goals. Walk in knowing exactly who to find.
              </motion.p>
              <motion.div custom={3} variants={fade} className="mt-8 flex flex-wrap gap-2">
                {['Shared interests', 'AI matching', 'Pre-event intros', 'Mutual connections'].map((t) => (
                  <span key={t} className="text-[11px] font-medium text-[#475569] bg-[#F1F5F9] px-3 py-1.5 rounded-full">
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Bottom CTA — cinematic ─── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.08, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.6, ease }}
          className="absolute inset-0 z-0"
        >
          <img src="/cta-bg.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0F172A]/70" />
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="relative z-10 text-center px-6 py-24"
        >
          <motion.h2 custom={0} variants={fade} className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-[1.1]">
            Your next conversation
            <br />is waiting
          </motion.h2>
          <motion.p custom={1} variants={fade} className="mt-5 text-base text-white/60 max-w-md mx-auto leading-relaxed">
            Join a community that values real connections over small talk.
          </motion.p>
          <motion.div custom={2} variants={fade} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="bg-white text-[#0F172A] px-8 py-3.5 rounded-full text-sm font-medium hover:bg-white/90 transition-all hover:shadow-xl hover:shadow-white/10">
              Create your free account
            </Link>
            <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-3.5">
              Sign in →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
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
