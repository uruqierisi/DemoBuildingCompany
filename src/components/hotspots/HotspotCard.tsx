import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';

interface HotspotCardProps {
  readonly title: ReactNode;
  readonly children?: ReactNode;
  /** Makes the whole card a link (touch users tap it to open). */
  readonly href?: string;
  readonly linkLabel?: string;
}

/** Tooltip card for hotspots: a title, detail lines and an optional "open" link. */
export function HotspotCard({ title, children, href, linkLabel }: HotspotCardProps) {
  const body = (
    <>
      <span className="block text-small font-medium">{title}</span>
      {children ? <span className="mt-1.5 block space-y-0.5 text-caption text-ink-muted">{children}</span> : null}
      {href && linkLabel ? (
        <span className="mt-3 flex items-center justify-between gap-6 border-t border-line pt-3 text-caption font-medium">
          {linkLabel}
          <Icon name="arrow-right" size={16} />
        </span>
      ) : null}
    </>
  );
  const classes = 'block min-w-48 max-w-72 rounded-xs bg-white px-4 py-3 text-ink shadow-[0_1px_0_rgb(22_21_19/0.08)]';
  return href ? (
    // Out of the tab order: keyboard users reach the same destination through the page's list.
    <Link to={href} tabIndex={-1} className={`${classes} outline-none`}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
