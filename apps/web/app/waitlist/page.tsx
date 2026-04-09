'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import HeroIntro from './components/HeroIntro';
import ProblemStatement from './components/ProblemStatement';
import ValueProps from './components/ValueProps';
import HowItWorks from './components/HowItWorks';
import SocialProof from './components/SocialProof';
import WaitlistCTA from './components/WaitlistCTA';
import Testimonials from './components/Testimonials';
import WaitlistFooter from './components/WaitlistFooter';

export default function WaitlistPage() {
  const [heroReady, setHeroReady] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <main>
      <HeroIntro onHeroReady={() => setHeroReady(true)} />
      <ProblemStatement sectionRef={sectionRef} heroReady={heroReady} />
      <ValueProps />
      <HowItWorks />
      <SocialProof />
      <Testimonials />
      <WaitlistCTA />
      <WaitlistFooter />
    </main>
  );
}
