export const dynamic = 'force-dynamic';

import HeroIntro from './components/HeroIntro';
import FloatingLogo from './components/FloatingLogo';
import ProblemStatement from './components/ProblemStatement';

export default function WaitlistPage() {
  return (
    <main>
      <FloatingLogo />
      <HeroIntro />
      {/* Spacer so there's scroll room for the logo to travel */}
      <div className="bg-[#0A0F1C]" style={{ height: '60vh' }} />
      <ProblemStatement />
    </main>
  );
}
