import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './waitlist.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Meetra — Meet the Right People at Every Event',
  description:
    'AI-powered networking that tells you who to talk to, why they matter, and what to say. Join the waitlist.',
  keywords: [
    'networking',
    'events',
    'AI matching',
    'professional connections',
    'career fairs',
    'conferences',
    'waitlist',
  ],
  openGraph: {
    title: 'Meetra — Meet the Right People at Every Event',
    description:
      'AI-powered networking that tells you who to talk to, why they matter, and what to say. Join the waitlist.',
    type: 'website',
    siteName: 'Meetra',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meetra — Meet the Right People at Every Event',
    description:
      'AI-powered networking that tells you who to talk to, why they matter, and what to say. Join the waitlist.',
  },
};

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} wl-root`}>
      {children}
    </div>
  );
}
