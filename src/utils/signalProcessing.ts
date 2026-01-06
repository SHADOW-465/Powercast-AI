/**
 * Adaptive Signal Quality Controller
 * Implements noise analysis, dynamic smoothing, and adaptive lookback.
 */

/**
 * Calculates Signal-to-Noise Ratio (SNR) and Volatility Index.
 */
export function analyzeSignalQuality(data: number[]): { snr: number; volatility: number } {
  if (data.length < 2) return { snr: 0, volatility: 0 };

  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const stdDev = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / data.length);

  // Calculate residual noise (high-frequency components)
  let noiseSum = 0;
  for (let i = 1; i < data.length; i++) {
    noiseSum += Math.abs(data[i] - data[i - 1]);
  }
  const avgNoise = noiseSum / (data.length - 1);

  const snr = stdDev / (avgNoise || 1);
  const volatility = avgNoise / (mean || 1);

  return { snr, volatility };
}

/**
 * Detects seasonality using Autocorrelation for a given lag.
 */
export function detectSeasonality(data: number[]): number {
  const lags = [24, 48, 168]; // Common power grid periods
  let bestLag = 24;
  let maxCorr = -1;

  const mean = data.reduce((a, b) => a + b, 0) / data.length;

  lags.forEach(lag => {
    if (data.length <= lag * 2) return;

    let num = 0;
    let den = 0;

    for (let i = 0; i < data.length - lag; i++) {
      num += (data[i] - mean) * (data[i + lag] - mean);
    }
    for (let i = 0; i < data.length; i++) {
      den += Math.pow(data[i] - mean, 2);
    }

    const corr = num / (den || 1);
    if (corr > maxCorr) {
      maxCorr = corr;
      bestLag = lag;
    }
  });

  return maxCorr > 0.4 ? bestLag : 24; // Default to 24 if no strong seasonality
}

/**
 * Generates Savitzky-Golay coefficients for given N (window) and d (polynomial degree).
 * Simplified implementation for academic demonstration.
 */
export function getSGCoefficients(windowSize: number, degree: number): number[] {
  // Precomputed common coefficients for efficiency in demo
  // In a production environment, this would involve solving the least-squares matrix.
  const coeffsMap: any = {
    "5,2": [-0.086, 0.343, 0.486, 0.343, -0.086],
    "7,2": [-0.095, 0.143, 0.286, 0.333, 0.286, 0.143, -0.095],
    "9,2": [-0.091, 0.061, 0.169, 0.234, 0.255, 0.234, 0.169, 0.061, -0.091],
    "11,2": [-0.084, 0.021, 0.103, 0.161, 0.196, 0.207, 0.196, 0.161, 0.103, 0.021, -0.084],
    "11,4": [0.042, -0.105, -0.021, 0.140, 0.234, 0.266, 0.234, 0.140, -0.021, -0.105, 0.042]
  };

  const key = `${windowSize},${degree}`;
  return coeffsMap[key] || coeffsMap["11,2"];
}

/**
 * Dynamic Savitzky-Golay filter.
 */
export function savitzkyGolaySmooth(data: number[], windowSize: number = 11, degree: number = 2): number[] {
  const n = data.length;
  const coeffs = getSGCoefficients(windowSize, degree);
  const m = coeffs.length;
  const halfM = Math.floor(m / 2);
  const smoothed = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < m; j++) {
      let dataIndex = i + (j - halfM);
      if (dataIndex < 0) dataIndex = 0;
      if (dataIndex >= n) dataIndex = n - 1;
      sum += data[dataIndex] * coeffs[j];
    }
    smoothed[i] = sum;
  }
  return smoothed;
}

/**
 * Calculates Mean Absolute Percentage Error (MAPE).
 */
export function calculateMAPE(actual: number[], predicted: number[]): number {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== 0) {
      sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
      count++;
    }
  }
  return count > 0 ? (sum / count) * 100 : 0;
}

/**
 * Optimizes parameters using a lightweight backtest.
 */
export function backtestAndOptimize(data: number[]): { windowSize: number; degree: number; lookback: number } {
  const stats = analyzeSignalQuality(data);
  const period = detectSeasonality(data);

  // Initial heuristic selection
  let windowSize = 11;
  let degree = 2;

  if (stats.volatility > 0.05) {
    degree = 4; // Higher degree for volatile signals to preserve peaks
    windowSize = 9; // Shorter window to track transients
  } else if (stats.snr < 5) {
    windowSize = 13; // Longer window for high noise
  }

  // Backtest loop
  const backtestSize = 5;
  if (data.length > backtestSize) {
    const testSegment = data.slice(-backtestSize);
    const smoothed = savitzkyGolaySmooth(data, windowSize, degree).slice(-backtestSize);
    const mape = calculateMAPE(testSegment, smoothed);

    if (mape > 5) {
      // Re-adjust: try a more conservative smoothing if error is high
      windowSize = 7;
      degree = 2;
    }
  }

  // Adaptive Lookback: return multiple of detected period
  let lookback = period * 2; // Default 2 periods
  if (data.length >= period * 7) lookback = period * 7; // Up to a week if available

  return { windowSize, degree, lookback };
}

/**
 * Normalization utilities.
 */
export function normalizeData(data: number[]): { normalized: number[], min: number, max: number } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return { normalized: data.map(v => (v - min) / range), min, max };
}

export function denormalizeData(data: number[], min: number, max: number): number[] {
  const range = max - min;
  return data.map(v => v * range + min);
}
