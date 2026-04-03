'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const events = [
  {
    title: 'Founder Dinner',
    location: 'San Francisco, CA',
    date: 'Thu, Apr 10',
    time: '7:00 PM',
    attendees: 24,
    tag: 'Startup',
    color: '#EFF6FF',
    accent: '#3B82F6',
  },
  {
    title: 'AI Summit 2025',
    location: 'New York, NY',
    date: 'Fri, Apr 18',
    time: '9:00 AM',
    attendees: 340,
    tag: 'Tech',
    color: '#F8FAFC',
    accent: '#2563EB',
  },
  {
    title: 'Design Week',
    location: 'London, UK',
    date: 'Mon, Apr 21',
    time: '10:00 AM',
    attendees: 180,
    tag: 'Design',
    color: '#EFF6FF',
    accent: '#3B82F6',
  },
  {
    title: 'VC Mixer',
    location: 'Austin, TX',
    date: 'Wed, Apr 23',
    time: '6:30 PM',
    attendees: 60,
    tag: 'Investing',
    color: '#F1F5F9',
    accent: '#1E40AF',
  },
];

// Each card offset in the stack
const stackOffsets = [
  { x: 0, y: 0, z: 0, rotate: 0 },
  { x: -18, y: 14, z: -40, rotate: -5 },
  { x: 16, y: 26, z: -80, rotate: 4 },
  { x: -8, y: 40, z: -120, rotate: -2 },
];

function EventCard({
  event,
  offset,
  index,
  mouseX,
  mouseY,
}: {
  event: typeof events[0];
  offset: typeof stackOffsets[0];
  index: number;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
}) {
  const rotateY = useTransform(mouseX, [-1, 1], [`${offset.rotate - 8}deg`, `${offset.rotate + 8}deg`]);
  const rotateX = useTransform(mouseY, [-1, 1], ['6deg', '-6deg']);

  return (
    <motion.div
      style={{
        position: 'absolute',
        rotateY,
        rotateX,
        translateX: offset.x,
        translateY: offset.y,
        translateZ: offset.z,
        transformStyle: 'preserve-3d',
        zIndex: events.length - index,
      }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="w-[300px] sm:w-[340px]"
    >
      <div
        className="rounded-2xl border border-white/60 shadow-2xl shadow-black/10 overflow-hidden"
        style={{ background: event.color }}
      >
        {/* Card header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <span
              className="text-[11px] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full"
              style={{ background: `${event.accent}18`, color: event.accent }}
            >
              {event.tag}
            </span>
            <span className="text-[11px] text-[#94A3B8]">{event.date}</span>
          </div>
          <h3 className="mt-4 font-[family-name:var(--font-playfair)] text-xl font-medium text-[#0F172A] tracking-tight">
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-[#64748B]">{event.location}</p>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-black/5" />

        {/* Card footer */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Stacked avatar circles */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{
                  background: `hsl(${210 + i * 40}, 70%, 65%)`,
                  marginLeft: i > 0 ? '-8px' : '0',
                  zIndex: 3 - i,
                  position: 'relative',
                }}
              />
            ))}
            <span className="ml-2 text-xs text-[#64748B]">{event.attendees} attending</span>
          </div>
          <span className="text-xs font-medium text-[#0F172A]">{event.time}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function EventCardStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { stiffness: 80, damping: 20 });
  const mouseY = useSpring(rawY, { stiffness: 80, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full flex items-center justify-center"
      style={{ perspective: '1200px', height: '420px' }}
    >
      <div style={{ transformStyle: 'preserve-3d', position: 'relative', width: '340px', height: '200px' }}>
        {events.map((event, i) => (
          <EventCard
            key={event.title}
            event={event}
            offset={stackOffsets[i]}
            index={i}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        ))}
      </div>
    </div>
  );
}
