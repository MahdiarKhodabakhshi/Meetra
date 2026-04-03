'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const events = [
  {
    title: 'Founder Dinner',
    location: 'San Francisco',
    date: 'Apr 10',
    day: 'Thu',
    time: '7 PM',
    attendees: 24,
    tag: 'Startup',
  },
  {
    title: 'AI Summit 2025',
    location: 'New York',
    date: 'Apr 18',
    day: 'Fri',
    time: '9 AM',
    attendees: 340,
    tag: 'Tech',
  },
  {
    title: 'Design Week',
    location: 'London',
    date: 'Apr 21',
    day: 'Mon',
    time: '10 AM',
    attendees: 180,
    tag: 'Design',
  },
  {
    title: 'VC Mixer',
    location: 'Austin',
    date: 'Apr 23',
    day: 'Wed',
    time: '6:30 PM',
    attendees: 60,
    tag: 'Investing',
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function EventCardStack() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="w-full">
      {/* Table header */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_120px_100px_80px_72px] gap-4 px-6 pb-4 text-[11px] font-medium tracking-[0.15em] uppercase text-[#94A3B8]">
        <span>Event</span>
        <span>Location</span>
        <span>Date</span>
        <span>Guests</span>
        <span />
      </div>

      <div className="border-t border-[#E2E8F0]">
        {events.map((event, i) => (
          <motion.div
            key={event.title}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: i * 0.08, ease }}
          >
            {/* Desktop row */}
            <div className="group hidden sm:grid sm:grid-cols-[1fr_120px_100px_80px_72px] gap-4 items-center px-6 py-5 border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors duration-200 cursor-pointer">
              <div className="flex items-center gap-4 min-w-0">
                <h3 className="font-[family-name:var(--font-playfair)] text-[17px] font-medium text-[#0F172A] tracking-tight truncate">
                  {event.title}
                </h3>
                <span className="shrink-0 text-[10px] font-medium tracking-[0.1em] uppercase text-[#94A3B8] border border-[#E2E8F0] rounded px-2 py-0.5">
                  {event.tag}
                </span>
              </div>
              <span className="text-[13px] text-[#64748B]">{event.location}</span>
              <span className="text-[13px] text-[#64748B]">
                {event.day}, {event.date}
              </span>
              <span className="text-[13px] text-[#64748B] tabular-nums">{event.attendees}</span>
              <span className="text-[12px] text-[#94A3B8] text-right group-hover:text-[#3B82F6] transition-colors">
                View →
              </span>
            </div>

            {/* Mobile card */}
            <div className="sm:hidden px-4 py-5 border-b border-[#F1F5F9] active:bg-[#F8FAFC] transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-[family-name:var(--font-playfair)] text-base font-medium text-[#0F172A] tracking-tight truncate">
                      {event.title}
                    </h3>
                    <span className="shrink-0 text-[9px] font-medium tracking-[0.1em] uppercase text-[#94A3B8] border border-[#E2E8F0] rounded px-1.5 py-px">
                      {event.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-[#64748B]">
                    {event.location} · {event.day}, {event.date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] text-[#64748B]">{event.time}</p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">{event.attendees} guests</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
