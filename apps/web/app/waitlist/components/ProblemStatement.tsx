'use client';

/**
 * Section 2 — the sentence is already here, waiting for "Meet" to dock.
 * FloatingLogo flies down and aligns with the gap.
 */
export default function ProblemStatement() {
  return (
    <section
      id="problem"
      className="relative bg-[#0A0F1C] flex items-center justify-center"
      style={{ height: '100vh' }}
    >
      <div className="px-6 max-w-3xl">
        <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.2vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.25]">
          {/* Line 1: [Meet gap]ing the right people */}
          <span className="whitespace-nowrap">
            <span className="invisible">Meet</span>
            <span className="text-white">ing the right people</span>
          </span>
          <br />
          {/* Line 2 */}
          <span className="text-white/50">{`shouldn\u2019t be left to chance.`}</span>
        </h2>
      </div>
    </section>
  );
}
