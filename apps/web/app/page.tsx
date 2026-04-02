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

      {/* How it works — connected timeline */}
      <section className="py-32 px-6 bg-[#FAFBFC]">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.p
              custom={0}
              variants={fade}
              className="text-center text-xs font-medium tracking-[0.2em] uppercase text-[#3B82F6]"
            >
              How it works
            </motion.p>
            <motion.h2
              custom={1}
              variants={fade}
              className="mt-4 font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl font-medium text-center tracking-tight leading-[1.15]"
            >
              Three moments to
              <br />
              something meaningful
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mt-20 relative"
          >
            {/* Vertical connector line */}
            <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#E2E8F0] via-[#3B82F6]/20 to-[#E2E8F0]" />

            {[
              {
                num: '01',
                title: 'Discover',
                desc: 'Browse a curated feed of events tailored to your world — from intimate dinners to industry mixers.',
                align: 'right' as const,
              },
              {
                num: '02',
                title: 'Commit',
                desc: 'One tap to RSVP. No forms, no friction. Your spot is secured and your profile is shared with the host.',
                align: 'left' as const,
              },
              {
                num: '03',
                title: 'Connect',
                desc: 'Before you even arrive, we surface the people you should meet — matched on shared interests and goals.',
                align: 'right' as const,
              },
            ].map((step) => (
              <motion.div
                key={step.num}
                variants={cardFade}
                className={`relative flex items-start gap-8 sm:gap-16 mb-20 last:mb-0 ${
                  step.align === 'left' ? 'sm:flex-row-reverse sm:text-right' : ''
                }`}
              >
                {/* Content side */}
                <div className="flex-1">
                  <span className="font-[family-name:var(--font-playfair)] text-6xl sm:text-8xl font-semibold text-[#F1F5F9] leading-none select-none">
                    {step.num}
                  </span>
                  <h3 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-[15px] text-[#64748B] leading-relaxed max-w-sm">
                    {step.desc}
                  </p>
                </div>

                {/* Center dot */}
                <div className="hidden sm:flex flex-col items-center flex-shrink-0">
                  <motion.div
                    whileInView={{ scale: [0, 1.2, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-4 h-4 rounded-full bg-[#3B82F6] ring-4 ring-[#EFF6FF] shadow-sm shadow-blue-200"
                  />
                </div>

                {/* Empty side for layout balance */}
                <div className="hidden sm:block flex-1" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features — bento grid */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.p
              custom={0}
              variants={fade}
              className="text-center text-xs font-medium tracking-[0.2em] uppercase text-[#3B82F6]"
            >
              Why Meetra
            </motion.p>
            <motion.h2
              custom={1}
              variants={fade}
              className="mt-4 font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl font-medium text-center tracking-tight leading-[1.15]"
            >
              Designed around people,
              <br />
              not profiles
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mt-16 grid grid-cols-1 sm:grid-cols-6 gap-5"
          >
            {/* Large card — spans 4 cols */}
            <motion.div
              variants={cardFade}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="sm:col-span-4 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EFF6FF] to-[#F8FAFC] p-10 sm:p-12 border border-[#E2E8F0]/60 cursor-default"
            >
              <div className="absolute top-6 right-6 w-24 h-24 rounded-full bg-[#3B82F6]/5 blur-2xl group-hover:bg-[#3B82F6]/10 transition-colors duration-700" />
              <svg className="w-8 h-8 text-[#3B82F6] mb-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">Event-first approach</h3>
              <p className="mt-3 text-[15px] text-[#64748B] leading-relaxed max-w-md">
                Every connection starts with a shared experience. We don&apos;t ask you to swipe — we ask you to show up.
              </p>
            </motion.div>

            {/* Tall card — spans 2 cols */}
            <motion.div
              variants={cardFade}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="sm:col-span-2 sm:row-span-2 group relative overflow-hidden rounded-3xl bg-[#0F172A] text-white p-10 sm:p-8 flex flex-col justify-between cursor-default"
            >
              <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-[#3B82F6]/10 blur-3xl" />
              <div>
                <svg className="w-8 h-8 text-[#60A5FA] mb-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                <h3 className="text-xl font-semibold tracking-tight">Smart matching</h3>
                <p className="mt-3 text-[15px] text-[#94A3B8] leading-relaxed">
                  We pair you with people who share your background, interests, and goals — before you walk through the door.
                </p>
              </div>
              <p className="mt-8 text-xs text-[#475569] font-medium tracking-wide uppercase">
                AI-powered · Context-aware
              </p>
            </motion.div>

            {/* Bottom left — spans 2 cols */}
            <motion.div
              variants={cardFade}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="sm:col-span-2 group relative overflow-hidden rounded-3xl bg-white p-10 sm:p-8 border border-[#E2E8F0]/60 cursor-default"
            >
              <svg className="w-8 h-8 text-[#3B82F6] mb-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <h3 className="text-lg font-semibold tracking-tight">Safe &amp; private</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                Your data stays yours. We only share what you choose, when you choose.
              </p>
            </motion.div>

            {/* Bottom right — spans 2 cols */}
            <motion.div
              variants={cardFade}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="sm:col-span-2 group relative overflow-hidden rounded-3xl bg-white p-10 sm:p-8 border border-[#E2E8F0]/60 cursor-default"
            >
              <svg className="w-8 h-8 text-[#3B82F6] mb-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              <h3 className="text-lg font-semibold tracking-tight">Effortless</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                From sign-up to showing up — everything feels easy and intuitive. Zero learning curve.
              </p>
            </motion.div>
          </motion.div>
        </div>
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
