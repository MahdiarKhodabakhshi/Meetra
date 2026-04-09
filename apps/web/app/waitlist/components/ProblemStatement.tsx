'use client';

import { type RefObject } from 'react';

interface Props {
  sectionRef: RefObject<HTMLDivElement | null>;
  docked: boolean;
}

export default function ProblemStatement({ sectionRef, docked }: Props) {
  return (
    <div ref={sectionRef} className="relative bg-[#0A0F1C]" style={{ height: '120vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="px-6 max-w-4xl text-center">
          <h2
            className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.2vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.3] transition-all duration-700"
            style={{
              filter: docked ? 'blur(0px)' : 'blur(8px)',
              opacity: docked ? 1 : 0.2,
            }}
          >
            <span className="text-white">
              {/* "Meet" is real text — visible when docked, invisible when floating logo is showing */}
              <span
                className="transition-opacity duration-500"
                style={{ opacity: docked ? 1 : 0 }}
              >
                Meet
              </span>
              <span>ing the right people</span>
            </span>
            <br />
            <span className="text-white/50">{`shouldn\u2019t be left to chance.`}</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
