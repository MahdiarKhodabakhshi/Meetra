'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

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

      {/* How it works */}
      <section className="py-24 px-6 bg-[#F8FAFC]">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.h2
              custom={0}
              variants={fade}
              className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-medium text-center tracking-tight"
            >
              Simple by design
            </motion.h2>
            <motion.p
              custom={1}
              variants={fade}
              className="mt-3 text-center text-[#64748B] text-base max-w-lg mx-auto"
            >
              Three steps to your next great connection.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8"
          >
            {[
              { num: '1', title: 'Browse events', desc: 'Explore a curated selection of events that match your interests and schedule.' },
              { num: '2', title: 'RSVP instantly', desc: 'Reserve your spot in seconds. No complicated forms, no friction.' },
              { num: '3', title: 'Meet your match', desc: 'Get paired with like-minded attendees before the event even starts.' },
            ].map((step) => (
              <motion.div key={step.num} variants={cardFade} className="text-center">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="mx-auto w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center"
                >
                  <span className="text-[#3B82F6] text-lg font-semibold">{step.num}</span>
                </motion.div>
                <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-[#64748B] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.h2
              custom={0}
              variants={fade}
              className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-medium text-center tracking-tight"
            >
              Built for real connections
            </motion.h2>
            <motion.p
              custom={1}
              variants={fade}
              className="mt-3 text-center text-[#64748B] text-base max-w-lg mx-auto"
            >
              Everything you need, nothing you don&apos;t.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {[
              {
                title: 'Event-first approach',
                desc: 'Every connection starts with a shared experience. Browse events that align with what you care about.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                ),
              },
              {
                title: 'Smart matching',
                desc: 'Our matching pairs you with attendees who share your background and interests before the event.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                ),
              },
              {
                title: 'Safe and private',
                desc: 'Your data stays yours. We only share what you choose, when you choose.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                ),
              },
              {
                title: 'Effortless experience',
                desc: 'From sign-up to showing up — everything is designed to feel easy and intuitive.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                ),
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={cardFade}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl border border-[#F1F5F9] bg-white p-8 hover:shadow-md hover:shadow-slate-100 transition-shadow cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-[#64748B] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
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
              { value: '500+', label: 'Events hosted' },
              { value: '10k+', label: 'Connections made' },
              { value: '98%', label: 'Would attend again' },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={cardFade} className="text-center">
                <p className="font-[family-name:var(--font-playfair)] text-4xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-sm text-[#64748B]">{stat.label}</p>
                {i < 2 && <div className="hidden sm:block absolute" />}
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
