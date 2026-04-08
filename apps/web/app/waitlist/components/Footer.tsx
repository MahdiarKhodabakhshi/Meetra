export default function Footer() {
  return (
    <footer className="px-6 py-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-sm text-[var(--wl-text-muted)]">
          &copy; {new Date().getFullYear()} Meetra. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm text-[var(--wl-text-muted)]">
          <a href="#" className="hover:text-[var(--wl-text)] transition-colors">
            Twitter
          </a>
          <a href="#" className="hover:text-[var(--wl-text)] transition-colors">
            LinkedIn
          </a>
          <a href="mailto:hello@meetra.app" className="hover:text-[var(--wl-text)] transition-colors">
            hello@meetra.app
          </a>
        </div>
      </div>
      <p className="text-center text-xs text-[var(--wl-text-muted)] opacity-40 mt-8 max-w-[1200px] mx-auto">
        Built with conviction that networking should reward relevance, not just confidence.
      </p>
    </footer>
  );
}
