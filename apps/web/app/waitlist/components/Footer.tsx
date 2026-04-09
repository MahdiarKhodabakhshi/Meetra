export default function Footer() {
  return (
    <footer className="border-t border-[#F1F5F9] py-12 px-6 sm:px-10 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-[family-name:var(--font-playfair)] text-base font-semibold text-[#0F172A]">
              Meetra
            </span>
            <span className="text-[11px] text-[#CBD5E1]">·</span>
            <span className="text-[11px] text-[#94A3B8]">Event-first networking</span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            &copy; {new Date().getFullYear()} Meetra. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-xs text-[#94A3B8]">
            <a href="#" className="hover:text-[#64748B] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#64748B] transition-colors">Terms</a>
            <a href="mailto:hello@meetra.app" className="hover:text-[#64748B] transition-colors">
              hello@meetra.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
