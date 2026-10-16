import type { SVGProps } from 'react';

/**
 * One thin line-icon set, drawn on a 24px grid with a 1.25 stroke and square caps.
 * Icons are decorative by default; pair them with visible text or an aria-label on the control.
 */
const PATHS = {
  'arrow-right': 'M4 12h15M13.5 6.5 19 12l-5.5 5.5',
  'arrow-left': 'M20 12H5M10.5 6.5 5 12l5.5 5.5',
  'arrow-up-right': 'M7 17 17 7M8.5 7H17v8.5',
  phone:
    'M5.5 4h3l1.5 4-2 1.3a10.5 10.5 0 0 0 6.7 6.7L16 14l4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 4 5.6 1.5 1.5 0 0 1 5.5 4Z',
  mail: 'M3.5 5.5h17v13h-17zM3.5 6.5 12 13l8.5-6.5',
  chat: 'M20.5 11.5a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.4-4.4a8.5 8.5 0 1 1 15.6-4.6ZM8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01',
  menu: 'M3.5 9h17M3.5 15h17',
  close: 'M5.5 5.5l13 13M18.5 5.5l-13 13',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  pin: 'M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0c0 5 6.5 11 6.5 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  check: 'M5 12.5 9.5 17 19 7.5',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  readonly name: IconName;
  readonly size?: number;
}

export function Icon({ name, size = 20, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
