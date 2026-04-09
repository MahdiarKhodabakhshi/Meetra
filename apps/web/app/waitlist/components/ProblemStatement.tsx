'use client';

/**
 * Section 2 — the sentence is already here, waiting for "Meet" to arrive.
 * "Meet" is handled by FloatingLogo — it flies down and docks into position.
 * We leave a gap where "Meet" will land.
 */
export default function ProblemStatement() {
  return (
    <section
      id="problem"
      className="relative bg-[#0A0F1C] flex items-center justify-center"
      style={{ height: '100vh' }}
    >
      <div className="text-center px-6 max-w-3xl">
        <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.2vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.2]">
          {/* Gap for "Meet" — FloatingLogo will dock here */}
          <span className="inline-block" style={{ width: '2.7em' }} />
          <span className="text-white">ing the right people</span>
          <br />
          <span className="text-white/50">{`shouldn\u2019t be left to chance.`}</span>
        </h2>
      </div>
    </section>
  );
}
