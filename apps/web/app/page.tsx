'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Logo } from '@/app/components/ui/logo';
import { Button } from '@/app/components/ui/button';

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/70 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo iconHeight={48} linkTo="/" lightText textClass="text-xl" className="!gap-1" iconClassName="drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]" />
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10 text-sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button className="btn-gradient text-sm px-4 py-1.5">
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden">
      {/* Centered radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#0ea5e9] rounded-full blur-[220px] opacity-[0.10]" />
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[350px] bg-[#06b6d4] rounded-full blur-[180px] opacity-[0.07]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
        <div className="text-center">
          {/* Logo — large, floating freely */}
          <div className="flex justify-center mb-6">
            <Logo iconHeight={200} showText={false} />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white tracking-tight leading-[1.15]">
            Network with{' '}
            <span className="text-gradient">purpose</span>,{' '}
            <br className="hidden sm:block" />
            <span className="font-light text-slate-200">not by chance</span>
          </h1>

          {/* Subtitle — concise, product-specific */}
          <p className="mt-5 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Meetra helps you find the right people at events, understand why they
            matter, and walk in knowing exactly what to say.
          </p>

          {/* CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="btn-gradient text-base px-8 py-3.5 shadow-[0_4px_24px_rgba(14,165,233,0.3)]">
                Get started free
              </Button>
            </Link>
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              See how it works
              <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Product preview — mock UI cards (no screenshots needed)            */
/* ------------------------------------------------------------------ */

function ProductPreviewSection() {
  return (
    <section className="py-16 sm:py-20 bg-[var(--muted-bg)] border-y border-[var(--border)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-10">
          What you get from Meetra
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          {/* Card 1: match */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center text-white text-xs font-bold">92</span>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Sarah Chen</p>
                <p className="text-xs text-[var(--muted)]">ML Engineer @ Stripe</p>
              </div>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Strong overlap in NLP research. She led Stripe&apos;s document-understanding pipeline — relevant to your resume-parsing work.
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">Recommended match</p>
          </div>

          {/* Card 2: why connect */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-secondary)] mb-3">Why connect</p>
            <ul className="space-y-2.5 text-xs text-[var(--muted)] leading-relaxed">
              <li className="flex gap-2">
                <span className="text-[var(--accent)] mt-0.5 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                </span>
                Both working on transformer-based document extraction
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--accent)] mt-0.5 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                </span>
                She&apos;s hiring for her new team — matches your co-founder goal
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--accent)] mt-0.5 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                </span>
                Shared connection through NeurIPS 2024 workshop
              </li>
            </ul>
          </div>

          {/* Card 3: conversation starter */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-secondary)] mb-3">Suggested opener</p>
            <div className="rounded-lg bg-[var(--muted-bg)] px-4 py-3 text-xs text-[var(--foreground)] leading-relaxed italic">
              &ldquo;I saw your talk on multi-modal embeddings — we&apos;re solving a similar
              problem for unstructured resumes. Would love to compare approaches.&rdquo;
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--muted)]">
              <svg className="w-3.5 h-3.5 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
              AI-generated based on both profiles
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */

const coreFeatures = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Smart Matching',
    description: 'AI surfaces the highest-value connections at every event based on skills, experience, and goals.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: 'Conversation Starters',
    description: 'Personalized talking points so you always know what to say and how to approach someone.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'Resume Intelligence',
    description: 'Upload your resume — we extract skills, experience, and interests automatically for better matches.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: 'Event-First Design',
    description: 'Browse events, RSVP, and get matched with fellow attendees — all in one place.',
  },
];

const roadmapFeatures = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Goal-Driven Networking',
    description: 'Define what you want — a job, a co-founder, clients — and Meetra prioritizes matches accordingly.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-6.182a4.5 4.5 0 00-6.364 0L4.25 10.75" />
      </svg>
    ),
    title: 'Connection Tracking',
    description: 'Keep track of who you met, add notes, and build lasting professional relationships.',
  },
];

function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20 bg-[var(--background)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            Everything you need to{' '}
            <span className="text-gradient">network smarter</span>
          </h2>
          <p className="mt-3 text-base text-[var(--muted)] max-w-xl mx-auto">
            AI-powered insights that make every conversation count.
          </p>
        </div>

        {/* Core features — 2×2 grid, visually primary */}
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          {coreFeatures.map((f) => (
            <div key={f.title} className="feature-card p-5 flex gap-4">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">{f.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Roadmap features — visually secondary */}
        <div className="grid sm:grid-cols-2 gap-5">
          {roadmapFeatures.map((f) => (
            <div key={f.title} className="feature-card p-5 flex gap-4 opacity-70">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-[var(--muted-bg)] text-[var(--muted)] flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">{f.title}</h3>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--muted-bg)] text-[var(--muted)]">
                    Soon
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How it works                                                       */
/* ------------------------------------------------------------------ */

const steps = [
  {
    number: '1',
    title: 'Join an event',
    subtitle: 'Browse, RSVP, and set your networking goal',
    description: 'Upload your resume or build your profile so Meetra knows who you are, what you bring, and what you\'re looking for.',
  },
  {
    number: '2',
    title: 'Get matched',
    subtitle: 'See relevant attendees and why they matter',
    description: 'Our AI analyzes every attendee to surface the people most relevant to your background and goals — each match comes with a clear explanation.',
  },
  {
    number: '3',
    title: 'Connect with confidence',
    subtitle: 'Use tailored talking points in real time',
    description: 'Walk into every conversation prepared with personalized openers, common ground, and approach strategies.',
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-[var(--muted-bg)]">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            How it works
          </h2>
          <p className="mt-3 text-base text-[var(--muted)]">
            From RSVP to conversation — in three steps.
          </p>
        </div>
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step.number} className="flex gap-5">
              {/* Left rail: number + connector */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'var(--gradient-brand)' }}>
                  {step.number}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-[var(--accent)]/30 to-[var(--border)] my-1" />
                )}
              </div>
              {/* Content */}
              <div className={`pb-10 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
                <h3 className="text-base font-semibold text-[var(--foreground)] leading-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--accent)] font-medium mt-0.5">
                  {step.subtitle}
                </p>
                <p className="text-sm text-[var(--muted)] leading-relaxed mt-2">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA                                                          */
/* ------------------------------------------------------------------ */

function CTASection() {
  return (
    <section className="py-16 sm:py-20 bg-[var(--background)]">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          Ready to network with{' '}
          <span className="text-gradient">purpose</span>?
        </h2>
        <p className="mt-4 text-base text-[var(--muted)] max-w-lg mx-auto">
          Turn every event into a focused opportunity — not a room full of random conversations.
        </p>
        <div className="mt-8">
          <Link href="/register">
            <Button size="lg" className="btn-gradient text-base px-10 py-3.5 shadow-[0_4px_24px_rgba(14,165,233,0.25)]">
              Create your free account
            </Button>
          </Link>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8 bg-[var(--background)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo iconHeight={20} textClass="text-sm" />
          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
            <span>Privacy</span>
            <span className="text-[var(--border)]">|</span>
            <span>Terms</span>
            <span className="text-[var(--border)]">|</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="inline-block size-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProductPreviewSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
