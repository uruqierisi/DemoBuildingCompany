import publicAssets from 'virtual:public-assets';

/** True when the file exists under /public/renders or /public/brand. */
export function hasPublicAsset(src: string): boolean {
  return publicAssets.has(src);
}
