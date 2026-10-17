/// <reference types="vite/client" />

declare module 'virtual:public-assets' {
  /** Absolute public paths of files present in /public/renders and /public/brand. */
  const assets: ReadonlySet<string>;
  export default assets;
}

interface ImportMetaEnv {
  /** Optional WhatsApp number for the lead-form hand-off; unset hides every WhatsApp action. */
  readonly VITE_WHATSAPP_NUMBER?: string;
}

/** Build-time demo flag (VITE_DEMO_MODE, on unless "false"); see build/site-meta-plugin.ts. */
declare const __DEMO_MODE__: boolean;
