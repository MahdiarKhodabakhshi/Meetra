'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabase } from '@/lib/supabase';

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

const payOptions = [
  'Yes, definitely',
  'Maybe, depends on price',
  'Probably not',
  'Not sure yet',
];

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
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address';
    }
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
          console.error('Supabase insert error:', error);
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

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const shareText = encodeURIComponent(
    'I just joined the waitlist for Meetra \u2014 an AI tool that helps you meet the right people at events. Check it out:'
  );
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';

  return (
    <section
      id="waitlist-form"
      className="relative px-6 py-24 sm:py-32 lg:py-40"
      style={{
        background:
          'linear-gradient(180deg, transparent 0%, rgba(79, 70, 229, 0.04) 50%, transparent 100%)',
      }}
    >
      <div className="max-w-xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="wl-micro-label mb-4 text-center"
        >
          EARLY ACCESS
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="wl-section-headline text-center mb-3"
        >
          Be the first to try Meetra.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-[var(--wl-text-muted)] mb-10 text-sm sm:text-base"
        >
          We&rsquo;re building something new. Join the waitlist to get early access and help shape
          the product.
        </motion.p>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="wl-glass-card p-8 sm:p-10 text-center"
            >
              {/* Animated check */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'rgba(34, 197, 94, 0.15)' }}
              >
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                >
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

              <h3 className="text-xl font-bold text-[var(--wl-text)] mb-2">You&rsquo;re in!</h3>
              <p className="text-sm text-[var(--wl-text-muted)] mb-6">
                Thanks for joining the Meetra waitlist. We&rsquo;ll reach out soon with early access
                details.
              </p>

              <p className="text-xs text-[var(--wl-text-muted)] mb-4">
                Want to help more? Share Meetra with someone who needs better networking.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={copyLink}
                  className="px-4 py-2 text-sm rounded-lg border transition-colors"
                  style={{
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: 'var(--wl-text-muted)',
                  }}
                >
                  Copy Link
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm rounded-lg border transition-colors"
                  style={{
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: 'var(--wl-text-muted)',
                  }}
                >
                  Share on X
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm rounded-lg border transition-colors"
                  style={{
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: 'var(--wl-text-muted)',
                  }}
                >
                  Share on LinkedIn
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.15 }}
              onSubmit={handleSubmit}
              className="wl-glass-card p-6 sm:p-8 space-y-5"
              noValidate
            >
              {/* Duplicate email message */}
              {duplicateEmail && (
                <div
                  className="rounded-lg p-4 text-sm"
                  style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#A78BFA' }}
                >
                  You&rsquo;re already on the list! We&rsquo;ll be in touch soon.
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="wl-name" className="block text-sm font-medium text-[var(--wl-text)] mb-1.5">
                  Full Name <span className="text-[var(--wl-error)]">*</span>
                </label>
                <input
                  id="wl-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`wl-input ${errors.name ? 'wl-input-error' : ''}`}
                  placeholder="Jane Smith"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'wl-name-err' : undefined}
                />
                {errors.name && (
                  <p id="wl-name-err" className="mt-1 text-xs text-[var(--wl-error)]">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="wl-email" className="block text-sm font-medium text-[var(--wl-text)] mb-1.5">
                  Email <span className="text-[var(--wl-error)]">*</span>
                </label>
                <input
                  id="wl-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`wl-input ${errors.email ? 'wl-input-error' : ''}`}
                  placeholder="jane@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'wl-email-err' : undefined}
                />
                {errors.email && (
                  <p id="wl-email-err" className="mt-1 text-xs text-[var(--wl-error)]">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="pt-2">
                <p className="text-xs text-[var(--wl-text-muted)] opacity-60">
                  Optional — helps us build a better product for you
                </p>
              </div>

              {/* Role */}
              <div>
                <label htmlFor="wl-role" className="block text-sm font-medium text-[var(--wl-text)] mb-1.5">
                  I am a...
                </label>
                <select
                  id="wl-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="wl-input"
                  style={{ appearance: 'none' }}
                >
                  <option value="">Select one</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Use case */}
              <div>
                <label htmlFor="wl-usecase" className="block text-sm font-medium text-[var(--wl-text)] mb-1.5">
                  I&rsquo;d use Meetra mostly for...
                </label>
                <select
                  id="wl-usecase"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="wl-input"
                  style={{ appearance: 'none' }}
                >
                  <option value="">Select one</option>
                  {useCases.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frustration */}
              <div>
                <label htmlFor="wl-frustration" className="block text-sm font-medium text-[var(--wl-text)] mb-1.5">
                  What&rsquo;s your biggest frustration with networking at events?
                </label>
                <textarea
                  id="wl-frustration"
                  value={frustration}
                  onChange={(e) => setFrustration(e.target.value.slice(0, 280))}
                  className="wl-input"
                  rows={3}
                  placeholder="e.g., I never know who to approach, I waste time on irrelevant conversations..."
                  style={{ resize: 'none' }}
                />
                <p className="text-right text-xs text-[var(--wl-text-muted)] opacity-40 mt-1">
                  {frustration.length}/280
                </p>
              </div>

              {/* Willingness to pay */}
              <div>
                <p className="block text-sm font-medium text-[var(--wl-text)] mb-2.5">
                  Would you pay for a tool that solves this?
                </p>
                <div className="flex flex-wrap gap-2">
                  {payOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setWillPay(willPay === opt ? '' : opt)}
                      className="px-3 py-1.5 text-sm rounded-lg border transition-all duration-200"
                      style={{
                        borderColor:
                          willPay === opt ? '#7C3AED' : 'rgba(255,255,255,0.08)',
                        background:
                          willPay === opt ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                        color:
                          willPay === opt ? '#A78BFA' : 'var(--wl-text-muted)',
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
                className="wl-btn-gradient w-full flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    />
                    Joining...
                  </>
                ) : (
                  'Join the Waitlist'
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
