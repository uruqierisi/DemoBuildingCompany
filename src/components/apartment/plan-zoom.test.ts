import { describe, expect, it } from 'vitest';
import { clampZoom, MAX_ZOOM, MIN_ZOOM, stepAtOrAbove, stepZoom } from './plan-zoom';

describe('clampZoom', () => {
  it('keeps the zoom between the fitted plan and the maximum', () => {
    expect(clampZoom(0.4)).toBe(MIN_ZOOM);
    expect(clampZoom(1.73)).toBe(1.73);
    expect(clampZoom(7)).toBe(MAX_ZOOM);
  });
});

describe('stepZoom', () => {
  it('steps through the levels from a level', () => {
    expect(stepZoom(1, 1)).toBe(1.5);
    expect(stepZoom(2, 1)).toBe(3);
    expect(stepZoom(2, -1)).toBe(1.5);
  });

  it('steps to the neighbouring level from a pinched zoom between levels', () => {
    expect(stepZoom(1.73, 1)).toBe(2);
    expect(stepZoom(1.73, -1)).toBe(1.5);
  });

  it('treats a zoom just below a level as that level', () => {
    expect(stepZoom(1.499, 1)).toBe(2);
  });

  it('stays within the limits', () => {
    expect(stepZoom(MAX_ZOOM, 1)).toBe(MAX_ZOOM);
    expect(stepZoom(MIN_ZOOM, -1)).toBe(MIN_ZOOM);
  });
});

describe('stepAtOrAbove', () => {
  it('rounds a pinched zoom up to the next level for image sizing', () => {
    expect(stepAtOrAbove(1)).toBe(1);
    expect(stepAtOrAbove(1.2)).toBe(1.5);
    expect(stepAtOrAbove(2.5)).toBe(3);
  });
});
