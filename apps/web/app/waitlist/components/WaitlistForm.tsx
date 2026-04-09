'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabase } from '@/lib/supabase';

const ease = [0.22, 1, 0.36, 1] as const;

const roles = [
  'Student / New Grad',
  'Working Professional',
  'Startup Founder',
  'Researcher / Academic',
  'Sales / Business Development',
  'Event Organizer',
  'Other',
];

const useCases = [
  'Finding jobs / internships',
  'Meeting investors / fundraising',
  'Finding collaborators or co-founders',
  'Expanding my professional network',
  'Sales / business development',
  'Academic networking',
  'Other',
];

const payOptions = ['Yes, definitely', 'Maybe, depends on price', 'Probably not', 'Not sure yet'];

export default function WaitlistForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [useCase, setUseCase] = useState('');
  const [frustration, setFrustration] = useState('');
  const [willPay, setWillPay] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState(false);

  const validate = () => {
    const errs: { name?: string; email?: string } = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setDuplicateEmail(false);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('waitlist').insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role || null,
        use_case: useCase || null,
        frustration: frustration.trim() || null,
        willingness_to_pay: willPay || null,
      });
      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          setDuplicateEmail(true);
        } else {
          alert('Something went wrong. Please try again.');
        }
        return;
      }
      setSubmitted(true);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const shareText = encodeURIComponent(
    'I just joined the waitlist for Meetra — an AI tool that helps you meet the right people at events. Check it out:'
  );
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';

  return (
    <section
      id="waitlist-form"
      className="relative py-32 sm:py-40 overflow-hidden bg-[#0F172A]"
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.15), transparent)' }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left — headline */}
          <div className="lg:sticky lg:top-32">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease }}
              className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#60A5FA] mb-6"
            >
              Early access
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.05, ease }}
              className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-[3.5rem] font-medium text-white tracking-tight leading-[1.06] mb-6"
            >
              Your next conversation<br />is waiting
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="text-base text-white/30 leading-relaxed max-w-sm"
            >
              Join a community built on real connections, not vanity metrics. We&apos;re building something new — help us shape it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 pt-10 border-t border-white/8"
            >
              <div className="flex gap-10">
                {[
                  { val: '500+', label: 'On the list' },
                  { val: 'Free', label: 'Early access' },
                  { val: 'Q3 2025', label: 'Launch target' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-[family-name:var(--font-playfair)] text-2xl font-medium text-white">{s.val}</p>
                    <p className="text-xs text-white/30 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-white/8 bg-white/4 p-10 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                    className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#22C55E" strokeWidth={2.5}>
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </motion.div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-medium text-white mb-3">You&apos;re in.</h3>
                  <p className="text-sm text-white/40 mb-8">
                    Thanks for joining the Meetra waitlist. We&apos;ll reach out with early access details soon.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => navigator.clipboard.writeText(window.location.href)}
                      className="px-5 py-2.5 text-sm rounded-full border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
                    >
                      Copy link
                    </button>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 text-sm rounded-full border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
                    >
                      Share on X
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 text-sm rounded-full border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                </motion.div>
              ) : (
                <form
                  key="form"
                  onSubmit={handleSubmit}
                  className="rounded-2xl border border-white/8 bg-white/4 p-8 space-y-5"
                  noValidate
                >
                  {duplicateEmail && (
                    <div className="rounded-xl p-4 text-sm bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      You&apos;re already on the list. We&apos;ll be in touch soon.
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label htmlFor="wl-name" className="block text-sm font-medium text-white/70 mb-1.5">
                      Full name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="wl-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`wl-input ${errors.name ? 'wl-input-error' : ''}`}
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: errors.name ? '#EF4444' : 'rgba(255,255,255,0.1)', color: '#F1F5F9' }}
                      placeholder="Jane Smith"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="wl-email" className="block text-sm font-medium text-white/70 mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="wl-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`wl-input ${errors.email ? 'wl-input-error' : ''}`}
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: errors.email ? '#EF4444' : 'rgba(255,255,255,0.1)', color: '#F1F5F9' }}
                      placeholder="jane@example.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                  </div>

                  <div className="pt-1">
                    <p className="text-xs text-white/25">Optional — helps us build a better product for you</p>
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="wl-role" className="block text-sm font-medium text-white/70 mb-1.5">I am a...</label>
                    <select
                      id="wl-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="wl-input"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: role ? '#F1F5F9' : '#64748B', appearance: 'none' }}
                    >
                      <option value="">Select one</option>
                      {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Use case */}
                  <div>
                    <label htmlFor="wl-usecase" className="block text-sm font-medium text-white/70 mb-1.5">I&apos;d use Meetra mostly for...</label>
                    <select
                      id="wl-usecase"
                      value={useCase}
                      onChange={(e) => setUseCase(e.target.value)}
                      className="wl-input"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: useCase ? '#F1F5F9' : '#64748B', appearance: 'none' }}
                    >
                      <option value="">Select one</option>
                      {useCases.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  {/* Frustration */}
                  <div>
                    <label htmlFor="wl-frustration" className="block text-sm font-medium text-white/70 mb-1.5">
                      Biggest frustration with networking at events?
                    </label>
                    <textarea
                      id="wl-frustration"
                      value={frustration}
                      onChange={(e) => setFrustration(e.target.value.slice(0, 280))}
                      className="wl-input"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#F1F5F9', resize: 'none' }}
                      rows={3}
                      placeholder="e.g., I never know who to approach..."
                    />
                    <p className="text-right text-xs text-white/20 mt-1">{frustration.length}/280</p>
                  </div>

                  {/* Willingness to pay */}
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-2.5">Would you pay for a tool that solves this?</p>
                    <div className="flex flex-wrap gap-2">
                      {payOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setWillPay(willPay === opt ? '' : opt)}
                          className="px-3 py-1.5 text-sm rounded-full border transition-all duration-200"
                          style={{
                            borderColor: willPay === opt ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)',
                            background: willPay === opt ? 'rgba(59,130,246,0.12)' : 'transparent',
                            color: willPay === opt ? '#93C5FD' : 'rgba(255,255,255,0.35)',
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-white text-[#0F172A] rounded-full py-4 text-sm font-medium hover:bg-white/95 transition-all hover:shadow-2xl hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-[#0F172A]/30 border-t-[#0F172A] rounded-full animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Request an invite'
                    )}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
