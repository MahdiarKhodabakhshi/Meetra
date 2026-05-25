'use client';

export const dynamic = 'force-dynamic';

import HeroIntro from './components/HeroIntro';
import PinnedReveal from './components/PinnedReveal';
import WaitlistCTA from './components/WaitlistCTA';
import WaitlistFooter from './components/WaitlistFooter';

export default function WaitlistPage() {
  return (
    <main>
      <HeroIntro />
      <PinnedReveal />
      <WaitlistCTA />
      <WaitlistFooter />
    </main>
  );
}
