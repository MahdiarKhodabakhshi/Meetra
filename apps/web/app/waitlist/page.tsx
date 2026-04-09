export const dynamic = 'force-dynamic';

import HeroIntro from './components/HeroIntro';
import FloatingLogo from './components/FloatingLogo';
import ProblemStatement from './components/ProblemStatement';

export default function WaitlistPage() {
  return (
    <main>
      <FloatingLogo />
      <HeroIntro />
      <ProblemStatement />
    </main>
  );
}
