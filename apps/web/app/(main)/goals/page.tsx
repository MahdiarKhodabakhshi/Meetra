'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';

const goalExamples = [
  {
    emoji: '💼',
    title: 'Find a job',
    description: 'Connect with hiring managers, recruiters, and people at companies you want to work for.',
  },
  {
    emoji: '🤝',
    title: 'Find a co-founder',
    description: 'Meet potential co-founders with complementary skills, shared vision, and startup experience.',
  },
  {
    emoji: '📈',
    title: 'Grow my business',
    description: 'Identify potential clients, partners, investors, or advisors who can accelerate your growth.',
  },
  {
    emoji: '🎓',
    title: 'Learn & explore',
    description: 'Connect with experts and practitioners in fields you want to learn about or transition into.',
  },
  {
    emoji: '🌐',
    title: 'Expand my network',
    description: 'Meet diverse professionals outside your usual circle to broaden your perspective and opportunities.',
  },
  {
    emoji: '💡',
    title: 'Validate an idea',
    description: 'Find domain experts and potential users to get honest feedback on your concept or product.',
  },
];

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Networking Goals</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Define what you want from networking and we'll prioritize matches that move you forward.
        </p>
      </div>

      {/* Coming soon hero */}
      <Card className="p-8 sm:p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          Goal-driven matching is coming soon
        </h2>
        <p className="text-[var(--muted)] max-w-lg mx-auto mb-8 leading-relaxed">
          Soon you'll be able to set specific networking goals for each event. Meetra will then
          re-rank your matches to prioritize people who can help you achieve those goals — whether
          you're job hunting, fundraising, or exploring a new field.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/events">
            <Button>Browse events</Button>
          </Link>
          <Link href="/profile">
            <Button variant="secondary">Complete your profile</Button>
          </Link>
        </div>
      </Card>

      {/* Goal type previews */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Goal types you'll be able to set
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goalExamples.map((goal) => (
            <Card key={goal.title} className="p-5 opacity-75">
              <div className="text-2xl mb-3">{goal.emoji}</div>
              <h3 className="font-semibold text-[var(--foreground)] text-sm mb-1">{goal.title}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{goal.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
