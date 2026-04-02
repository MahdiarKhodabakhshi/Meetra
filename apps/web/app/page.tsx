import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#0F172A]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#F1F5F9]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold tracking-tight">
            Meetra
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-[#0F172A] text-white px-4 py-2 rounded-full hover:bg-[#1E293B] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl font-medium leading-[1.1] tracking-tight">
            Where meaningful
            <br />
            connections begin
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[#64748B] max-w-xl mx-auto leading-relaxed">
            Discover curated events, RSVP with ease, and meet the people who
            matter — all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto text-center bg-[#3B82F6] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#2563EB] transition-colors"
            >
              Join Meetra — it&apos;s free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-center border border-[#E2E8F0] text-[#0F172A] px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-[#F8FAFC]">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-medium text-center tracking-tight">
            Simple by design
          </h2>
          <p className="mt-3 text-center text-[#64748B] text-base max-w-lg mx-auto">
            Three steps to your next great connection.
          </p>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                <span className="text-[#3B82F6] text-lg font-semibold">1</span>
              </div>
              <h3 className="mt-5 text-base font-semibold">Browse events</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                Explore a curated selection of events that match your interests and schedule.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                <span className="text-[#3B82F6] text-lg font-semibold">2</span>
              </div>
              <h3 className="mt-5 text-base font-semibold">RSVP instantly</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                Reserve your spot in seconds. No complicated forms, no friction.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                <span className="text-[#3B82F6] text-lg font-semibold">3</span>
              </div>
              <h3 className="mt-5 text-base font-semibold">Meet your match</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                Get paired with like-minded attendees before the event even starts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-medium text-center tracking-tight">
            Built for real connections
          </h2>
          <p className="mt-3 text-center text-[#64748B] text-base max-w-lg mx-auto">
            Everything you need, nothing you don&apos;t.
          </p>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#F1F5F9] bg-white p-8 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold">Event-first approach</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                Every connection starts with a shared experience. Browse events that align with what you care about.
              </p>
            </div>

            <div className="rounded-2xl border border-[#F1F5F9] bg-white p-8 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold">Smart matching</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                Our matching pairs you with attendees who share your background and interests before the event.
              </p>
            </div>

            <div className="rounded-2xl border border-[#F1F5F9] bg-white p-8 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold">Safe and private</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                Your data stays yours. We only share what you choose, when you choose.
              </p>
            </div>

            <div className="rounded-2xl border border-[#F1F5F9] bg-white p-8 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold">Effortless experience</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                From sign-up to showing up — everything is designed to feel easy and intuitive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 px-6 bg-[#F8FAFC]">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-20">
            <div>
              <p className="font-[family-name:var(--font-playfair)] text-4xl font-semibold">500+</p>
              <p className="mt-1 text-sm text-[#64748B]">Events hosted</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-[#E2E8F0]" />
            <div>
              <p className="font-[family-name:var(--font-playfair)] text-4xl font-semibold">10k+</p>
              <p className="mt-1 text-sm text-[#64748B]">Connections made</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-[#E2E8F0]" />
            <div>
              <p className="font-[family-name:var(--font-playfair)] text-4xl font-semibold">98%</p>
              <p className="mt-1 text-sm text-[#64748B]">Would attend again</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-medium tracking-tight">
            Ready to meet someone new?
          </h2>
          <p className="mt-4 text-[#64748B] text-base max-w-md mx-auto">
            Join a community that values real conversations over small talk.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-block bg-[#3B82F6] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#2563EB] transition-colors"
            >
              Create your free account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F1F5F9] py-10 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-[family-name:var(--font-playfair)] text-sm font-medium">
            Meetra
          </span>
          <p className="text-xs text-[#94A3B8]">
            &copy; {new Date().getFullYear()} Meetra. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[#94A3B8]">
            <a href="#" className="hover:text-[#64748B] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#64748B] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
