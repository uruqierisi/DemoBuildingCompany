/**
 * SVGO config for brand assets downloaded from pozhegubrothers.com.
 * Conservative on purpose: output must render identically to the originals in public/brand/original/.
 */
export default {
  multipass: true,
  floatPrecision: 4,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Keep colour values exactly as authored (no #FFFFFF → #fff or name conversions).
          convertColors: false,
        },
      },
    },
  ],
};
