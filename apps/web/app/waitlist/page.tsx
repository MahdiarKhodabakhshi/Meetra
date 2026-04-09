'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import HeroIntro from './components/HeroIntro';
import FloatingLogo from './components/FloatingLogo';
import ProblemStatement from './components/ProblemStatement';

export default function WaitlistPage() {
  const [logoVisible, setLogoVisible] = useState(false);

  return (
    <main>
      <FloatingLogo visible={logoVisible} />
      <HeroIntro onHeroReady={() => setLogoVisible(true)} />
      <ProblemStatement />
    </main>
  );
}
