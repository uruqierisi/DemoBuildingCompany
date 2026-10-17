/**
 * SVGO config for hand-optimising SVGs (e.g. `npx svgo -i file.svg`). The generated brand assets in
 * public/brand/ are already minimal and do not need it.
 * Conservative on purpose: output must render identically to the input.
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
