export const dynamic = 'force-dynamic';

import HeroIntro from './components/HeroIntro';
import ProblemStatement from './components/ProblemStatement';

export default function WaitlistPage() {
  return (
    <main>
      <HeroIntro />
      <ProblemStatement />
    </main>
  );
}
