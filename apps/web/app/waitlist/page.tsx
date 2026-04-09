'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import HeroIntro from './components/HeroIntro';
import ProblemStatement from './components/ProblemStatement';
import ChanceBridge from './components/ChanceBridge';
import WaitlistCTA from './components/WaitlistCTA';
import WaitlistFooter from './components/WaitlistFooter';

export default function WaitlistPage() {
  const [heroReady, setHeroReady] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <main>
      <HeroIntro onHeroReady={() => setHeroReady(true)} />
      <ProblemStatement sectionRef={sectionRef} heroReady={heroReady} />
      <ChanceBridge />
      <WaitlistCTA />
      <WaitlistFooter />
    </main>
  );
}
