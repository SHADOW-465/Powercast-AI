// Coefficients for Savitzky-Golay filter (window=11, poly=2)
const SG_COEFFS = [
  -0.08391608391608402,
  0.020979020979021153,
  0.1025641025641029,
  0.16083916083916136,
  0.1958041958041964,
  0.20745920745920807,
  0.1958041958041964,
  0.16083916083916133,
  0.1025641025641029,
  0.020979020979021094,
  -0.08391608391608407
];

/**
 * Applies Savitzky-Golay filter to a 1D array of numbers.
 * Uses padding at boundaries to maintain array length (reflect or nearest).
 * Here we use simple 'nearest' padding for simplicity, or we can just truncate.
 * Better to replicate edge values to avoid artifacts.
 */
export function savitzkyGolaySmooth(data: number[]): number[] {
  const n = data.length;
  const m = SG_COEFFS.length;
  const halfM = Math.floor(m / 2);
  const smoothed = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < m; j++) {
      const offset = j - halfM;
      let dataIndex = i + offset;

      // Handle boundary conditions: replicate edge values
      if (dataIndex < 0) dataIndex = 0;
      if (dataIndex >= n) dataIndex = n - 1;

      sum += data[dataIndex] * SG_COEFFS[j];
    }
    smoothed[i] = sum;
  }
  return smoothed;
}

/**
 * Normalizes data to [0, 1] range.
 */
export function normalizeData(data: number[]): { normalized: number[], min: number, max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const v of data) {
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const range = max - min || 1; // Avoid division by zero
  const normalized = data.map(v => (v - min) / range);

  return { normalized, min, max };
}

/**
 * Denormalizes data from [0, 1] range back to original scale.
 */
export function denormalizeData(data: number[], min: number, max: number): number[] {
  const range = max - min;
  return data.map(v => v * range + min);
}
