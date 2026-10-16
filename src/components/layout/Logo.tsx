import { SITE } from '@/config/site';
import { hasPublicAsset } from '@/lib/assets';
import { cn } from '@/lib/cn';

interface LogoProps {
  /**
   * The logo sits over a photograph (the hero render). Uses the white-wordmark copy, since the
   * slate wordmark can disappear into mid-tone imagery. Solid ink and paper grounds use the original.
   */
  readonly onImage?: boolean;
  readonly className?: string;
}

/** Official Pozhegu Brothers logo from /public/brand; a labelled outline box until the file exists. */
export function Logo({ onImage = false, className }: LogoProps) {
  const logo = onImage ? SITE.logo.onImage : SITE.logo.default;
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
