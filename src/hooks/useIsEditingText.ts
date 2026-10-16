import { useSyncExternalStore } from 'react';

/** Input types that open the on-screen keyboard. */
const TEXT_INPUT_TYPES = new Set(['text', 'tel', 'email', 'search', 'url', 'number', 'password']);

function isTextField(element: Element | null): boolean {
  if (element instanceof HTMLTextAreaElement) return true;
  return element instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(element.type);
}

function subscribe(onChange: () => void): () => void {
  document.addEventListener('focusin', onChange);
  document.addEventListener('focusout', onChange);
  return () => {
    document.removeEventListener('focusin', onChange);
    document.removeEventListener('focusout', onChange);
  };
}

/**
 * True while a text field has focus, i.e. while a phone shows its on-screen keyboard. Fixed bottom
 * bars use it to step aside: above the keyboard they would cover the field being typed in.
 */
export function useIsEditingText(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isTextField(document.activeElement),
    () => false,
  );
}
