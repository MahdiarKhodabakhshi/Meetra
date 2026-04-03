'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useInView, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

const fade = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.3 + i * 0.2, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.15 } },
};

const cardFade = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

function CountUp({ target, suffix, duration = 2 }: { target: number; suffix: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const count = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = `${Math.round(v).toLocaleString()}${suffix}`;
        }
      },
    });
    return controls.stop;
  }, [inView, target, suffix, duration, count]);

  return (
    <span ref={ref} className="font-[family-name:var(--font-playfair)] text-4xl font-semibold tabular-nums">
      0{suffix}
    </span>
  );
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)']);
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(241,245,249,0)', 'rgba(241,245,249,1)']);

  return (
    <div className="min-h-screen bg-white text-[#0F172A]">
      {/* Navigation */}
      <motion.nav
        style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <motion.span
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-[family-name:var(--font-playfair)] text-xl font-semibold tracking-tight"
          >
            Meetra
          </motion.span>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <Link
              href="/login"
              className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-[#0F172A] text-white px-4 py-2 rounded-full hover:bg-[#1E293B] transition-colors"
            >
              Get started
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image */}
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/hero-bg.png"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px]" />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto max-w-3xl text-center"
        >
          <motion.h1
            custom={0}
            variants={fade}
            className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl font-medium leading-[1.1] tracking-tight"
          >
            Where meaningful
            <br />
            connections begin
          </motion.h1>
          <motion.p
            custom={1}
            variants={fade}
            className="mt-6 text-lg sm:text-xl text-[#64748B] max-w-xl mx-auto leading-relaxed"
          >
            Discover curated events, RSVP with ease, and meet the people who
            matter — all in one place.
          </motion.p>
          <motion.div
            custom={2}
            variants={fade}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto text-center bg-[#3B82F6] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#2563EB] transition-colors hover:shadow-lg hover:shadow-blue-500/20"
            >
              Join Meetra — it&apos;s free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-center border border-[#E2E8F0] text-[#0F172A] px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
            >
              I already have an account
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* RSVP — editorial image + text */}
      <section className="py-0">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]"
        >
          {/* Image side */}
          <motion.div
            variants={{ hidden: { opacity: 0, scale: 1.04 }, visible: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } } }}
            className="relative overflow-hidden"
          >
            <img
              src="/rsvp.png"
              alt="RSVP experience"
              className="w-full h-full object-cover min-h-[400px] lg:min-h-0"
            />
          </motion.div>

          {/* Text side */}
          <div className="flex items-center px-8 sm:px-16 lg:px-20 py-20 lg:py-0 bg-[#FAFBFC]">
            <div className="max-w-md">
              <motion.p
                custom={0}
                variants={fade}
                className="text-xs font-medium tracking-[0.2em] uppercase text-[#3B82F6]"
              >
                Effortless
              </motion.p>
              <motion.h2
                custom={1}
                variants={fade}
                className="mt-4 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.12]"
              >
                One tap.
                <br />
                You&apos;re in.
              </motion.h2>
              <motion.p
                custom={2}
                variants={fade}
                className="mt-6 text-[15px] sm:text-base text-[#64748B] leading-relaxed"
              >
                No forms to fill. No hoops to jump through. See an event you love, tap RSVP, and your spot is secured. We handle the rest — confirmation, reminders, and your match list.
              </motion.p>
              <motion.div custom={3} variants={fade} className="mt-8 flex items-center gap-6">
                <Link
                  href="/register"
                  className="text-sm font-medium text-[#0F172A] border-b border-[#0F172A] pb-0.5 hover:text-[#3B82F6] hover:border-[#3B82F6] transition-colors"
                >
                  Try it yourself
                </Link>
                <span className="text-xs text-[#94A3B8]">Free forever</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Connect — reversed editorial */}
      <section className="py-0">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]"
        >
          {/* Text side */}
          <div className="flex items-center px-8 sm:px-16 lg:px-20 py-20 lg:py-0 order-2 lg:order-1">
            <div className="max-w-md">
              <motion.p
                custom={0}
                variants={fade}
                className="text-xs font-medium tracking-[0.2em] uppercase text-[#3B82F6]"
              >
                The moment
              </motion.p>
              <motion.h2
                custom={1}
                variants={fade}
                className="mt-4 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.12]"
              >
                Conversations that
                <br />
                actually matter
              </motion.h2>
              <motion.p
                custom={2}
                variants={fade}
                className="mt-6 text-[15px] sm:text-base text-[#64748B] leading-relaxed"
              >
                Before you even arrive, we surface the people you should meet — matched on shared interests, background, and goals. No awkward icebreakers. Just real conversations with the right people.
              </motion.p>
              <motion.div custom={3} variants={fade} className="mt-8 flex flex-wrap items-center gap-3">
                {['Shared interests', 'Smart matching', 'Pre-event intros'].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-[#3B82F6] bg-[#EFF6FF] px-3.5 py-1.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Image side */}
          <motion.div
            variants={{ hidden: { opacity: 0, scale: 1.04 }, visible: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } } }}
            className="relative overflow-hidden order-1 lg:order-2"
          >
            <img
              src="/connect.png"
              alt="People connecting at an event"
              className="w-full h-full object-cover min-h-[400px] lg:min-h-0"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Value props — minimal text strip */}
      <section className="py-24 px-6 bg-[#FAFBFC]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-16 sm:gap-8"
        >
          {[
            { title: 'Event-first', desc: 'Every connection starts with a shared experience — not a profile.' },
            { title: 'Private by default', desc: 'Your data stays yours. Share only what you want, when you want.' },
            { title: 'Zero friction', desc: 'From sign-up to showing up, everything just works.' },
          ].map((item) => (
            <motion.div key={item.title} variants={cardFade}>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl font-medium tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-[#64748B] leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Social proof */}
      <section className="py-20 px-6 bg-[#F8FAFC]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="mx-auto max-w-4xl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-20">
            {[
              { target: 500, suffix: '+', label: 'Events hosted' },
              { target: 10, suffix: 'k+', label: 'Connections made' },
              { target: 98, suffix: '%', label: 'Would attend again' },
            ].map((stat) => (
              <motion.div key={stat.label} variants={cardFade} className="text-center">
                <CountUp target={stat.target} suffix={stat.suffix} duration={2.2} />
                <p className="mt-1 text-sm text-[#64748B]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.h2
            custom={0}
            variants={fade}
            className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-medium tracking-tight"
          >
            Ready to meet someone new?
          </motion.h2>
          <motion.p
            custom={1}
            variants={fade}
            className="mt-4 text-[#64748B] text-base max-w-md mx-auto"
          >
            Join a community that values real conversations over small talk.
          </motion.p>
          <motion.div custom={2} variants={fade} className="mt-8">
            <Link
              href="/register"
              className="inline-block bg-[#3B82F6] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#2563EB] transition-colors hover:shadow-lg hover:shadow-blue-500/20"
            >
              Create your free account
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="border-t border-[#F1F5F9] py-10 px-6"
      >
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-[family-name:var(--font-playfair)] text-sm font-medium">
            Meetra
          </span>
          <p className="text-xs text-[#94A3B8]">
            &copy; {new Date().getFullYear()} Meetra. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[#94A3B8]">
            <a href="#" className="hover:text-[#64748B] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#64748B] transition-colors">Terms</a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
