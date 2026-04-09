'use client';

/**
 * Section 2 — sentence waits for "Meet" to dock into it.
 * The invisible "Meet" holds space on the same line as "ing the right people".
 */
export default function ProblemStatement() {
  return (
    <section
      id="problem"
      className="relative bg-[#0A0F1C] flex items-center justify-center"
      style={{ height: '100vh' }}
    >
      <div className="px-6 max-w-4xl text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,4.2vw,3.5rem)] font-medium tracking-[-0.025em] leading-[1.3]">
          <span className="text-white">
            {/* Invisible "Meet" to hold space — FloatingLogo covers this */}
            <span className="invisible inline">Meet</span>
            {/* "ing the right people" on the same line */}
            <span>ing the right people</span>
          </span>
          <br />
          <span className="text-white/50">{`shouldn\u2019t be left to chance.`}</span>
        </h2>
      </div>
    </section>
  );
}
