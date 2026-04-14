'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import HeroIntro from './components/HeroIntro';
import ProblemStatement from './components/ProblemStatement';
import HowItWorks from './components/HowItWorks';
import WaitlistCTA from './components/WaitlistCTA';
import WaitlistFooter from './components/WaitlistFooter';

export default function WaitlistPage() {
  const [heroReady, setHeroReady] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <main>
      <HeroIntro onHeroReady={() => setHeroReady(true)} />
      <ProblemStatement sectionRef={sectionRef} heroReady={heroReady} />
      <HowItWorks />
      <WaitlistCTA />
      <WaitlistFooter />
    </main>
  );
}
