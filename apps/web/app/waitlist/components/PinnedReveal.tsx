'use client';

import { useRef } from 'react';
import InteractiveHeadline from './InteractiveHeadline';
import AboutSection from './AboutSection';

/**
 * Section A pins to the viewport while Section B rises up from below
 * and covers it. A stays fully visible the whole time — no fade/scale.
 */
export default function PinnedReveal() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Sticky stage holding Section A */}
      <div className="sticky top-0 h-screen w-full overflow-hidden z-0">
        <InteractiveHeadline />
      </div>

      {/* Section B sits in normal flow at z-10. As the user scrolls,
          B rises into view and covers A. */}
      <div className="relative z-10">
        <AboutSection />
      </div>
    </div>
  );
}
