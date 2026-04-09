'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import HeroIntro from './components/HeroIntro';
import FloatingLogo from './components/FloatingLogo';
import ProblemStatement from './components/ProblemStatement';

export default function WaitlistPage() {
  const [logoVisible, setLogoVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const meetGapRef = useRef<HTMLSpanElement>(null);

  return (
    <main>
      <FloatingLogo visible={logoVisible} meetGapRef={meetGapRef} sectionRef={sectionRef} />
      <HeroIntro onHeroReady={() => setLogoVisible(true)} />
      <ProblemStatement sectionRef={sectionRef} meetGapRef={meetGapRef} />

      {/* Test footer */}
      <section className="bg-[#0A0F1C] border-t border-white/10 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-[family-name:var(--font-playfair)] text-2xl text-white/30">
            More sections coming soon.
          </p>
          <div className="mt-12 h-[60vh]" />
          <footer className="border-t border-white/5 pt-8">
            <p className="text-sm text-white/20">
              &copy; {new Date().getFullYear()} Meetra. All rights reserved.
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
