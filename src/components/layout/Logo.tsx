import { SITE } from '@/config/site';
import { hasPublicAsset } from '@/lib/assets';
import { cn } from '@/lib/cn';

interface LogoProps {
  /** On an ink ground (hero, footer, open menu): the white-wordmark lockup. */
  readonly isInverse?: boolean;
  readonly className?: string;
}

/** The Arrita Ndërtim lockup from /public/brand; a labelled outline box until the file exists. */
export function Logo({ isInverse = false, className }: LogoProps) {
  const logo = isInverse ? SITE.logo.inverse : SITE.logo.default;
  const sizeClasses = 'h-9 w-auto lg:h-11';

  if (hasPublicAsset(logo.src)) {
    return (
      <img
        src={logo.src}
        alt={SITE.company}
        width={logo.width}
        height={logo.height}
        decoding="async"
        className={cn(sizeClasses, className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={SITE.company}
      style={{ aspectRatio: `${logo.width} / ${logo.height}` }}
      className={cn(
        'flex items-center justify-center border border-dashed border-current px-2',
        sizeClasses,
        className,
      )}
    >
      <span aria-hidden="true" className="font-mono text-[0.625rem] leading-none opacity-80">
        {logo.src}
      </span>
    </span>
  );
}
