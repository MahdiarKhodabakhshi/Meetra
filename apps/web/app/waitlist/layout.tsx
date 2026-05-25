import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './waitlist.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Meetra · Know what to say. Land every conversation.',
  description:
    'Meetra is the AI layer for every conversation that matters. At events, in your inbox, in follow-ups, on your resume. Join the waitlist.',
  keywords: [
    'communication',
    'professional messaging',
    'follow-ups',
    'resume',
    'conversation AI',
    'networking',
    'events',
    'waitlist',
  ],
  openGraph: {
    title: 'Meetra · Know what to say. Land every conversation.',
    description:
      'Meetra is the AI layer for every conversation that matters. At events, in your inbox, in follow-ups, on your resume. Join the waitlist.',
    type: 'website',
    siteName: 'Meetra',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meetra · Know what to say. Land every conversation.',
    description:
      'Meetra is the AI layer for every conversation that matters. At events, in your inbox, in follow-ups, on your resume. Join the waitlist.',
  },
};

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${playfair.variable} wl-root`}>
      {children}
    </div>
  );
}





