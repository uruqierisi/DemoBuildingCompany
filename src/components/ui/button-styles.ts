import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'dark' | 'outline' | 'outline-inverse';
/** `fluid` is `md` on phones and tablets, `lg` from 1024px. */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'fluid';

const BASE =
  'group/button inline-flex shrink-0 items-center justify-center gap-3 rounded-xs font-medium whitespace-nowrap ' +
  'transition-[background-color,color,border-color,transform] active:translate-y-px ' +
  'disabled:pointer-events-none disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  // Ink text on orange: white fails WCAG AA on #F7941D.
  primary: 'bg-accent text-ink hover:bg-accent-hover',
  dark: 'bg-ink text-white hover:bg-ink-soft',
  outline: 'border border-line-strong text-ink hover:border-ink hover:bg-ink hover:text-paper',
  'outline-inverse': 'border border-line-inverse text-white hover:border-white hover:bg-white hover:text-ink',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-small',
  md: 'h-12 px-5 text-small',
  lg: 'h-14 px-7 text-body',
  fluid: 'h-12 px-5 text-small lg:h-14 lg:px-7 lg:text-body',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

/** Classes for an arrow icon that nudges forward when its button is hovered. */
export const buttonArrowClasses = 'transition-transform duration-300 group-hover/button:translate-x-1';
