export const MAIN_CONTENT_ID = 'permbajtja';

export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="fixed top-3 left-3 z-50 -translate-y-24 rounded-xs bg-ink px-4 py-3 text-small font-medium text-white transition-transform focus-visible:translate-y-0"
    >
      Kalo te përmbajtja
    </a>
  );
}
