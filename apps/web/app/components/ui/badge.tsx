'use client';

type Status =
  | 'draft'
  | 'published'
  | 'closed'
  | 'cancelled'
  | 'joined'
  | 'waitlisted'
  | 'failed'
  | 'parsed'
  | 'uploaded'
  | 'scanned';

const statusClass: Record<Status, string> = {
  draft: 'badge-draft',
  published: 'badge-published',
  closed: 'badge-closed',
  cancelled: 'badge-cancelled',
  joined: 'badge-joined',
  waitlisted: 'badge-waitlisted',
  failed: 'badge-cancelled',
  parsed: 'badge-published',
  uploaded: 'badge-draft',
  scanned: 'badge-waitlisted',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: Status;
  variant?: 'default' | Status;
}

export function Badge({
  status,
  variant = 'default',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const c =
    variant !== 'default' ? statusClass[variant] : status ? statusClass[status] : 'badge-draft';
  return (
    <span className={`badge ${c} ${className}`} {...props}>
      {children}
    </span>
  );
}
