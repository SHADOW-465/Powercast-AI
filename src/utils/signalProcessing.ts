/**
 * Signal Processing Utilities
 * Enhanced with Adaptive Signal Quality Controller
 */

export interface SignalQualityMetrics {
    snr: number;        // Signal to Noise Ratio
    volatility: number; // Coefficient of Variation (StdDev / Mean)
    trendStrength: number;
}

export interface SmoothingParams {
    windowSize: number;
    polyOrder: number;
}

/**
 * Calculates Signal-to-Noise Ratio (SNR) and Volatility Index
 */
export function analyzeSignalQuality(data: number[]): SignalQualityMetrics {
    if (data.length === 0) return { snr: 0, volatility: 0, trendStrength: 0 };

    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;

    // Variance and StdDev
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Estimate Noise by differencing (high frequency component)
    let noiseSum = 0;
    for (let i = 1; i < n; i++) {
        noiseSum += Math.abs(data[i] - data[i - 1]);
    }
    const estimatedNoiseLevel = noiseSum / (n - 1);

    // SNR: Signal Power / Noise Power (Approximation)
    // Here we use Mean / NoiseLevel as a proxy for grid signals
    const snr = estimatedNoiseLevel === 0 ? 100 : mean / estimatedNoiseLevel;

    // Volatility: Coefficient of Variation
    const volatility = mean === 0 ? 0 : stdDev / mean;

    return {
        snr,
        volatility,
        trendStrength: 0 // Placeholder for more advanced autocorrelation
    };
}

/**
 * Heuristic logic to select optimal Savitzky-Golay parameters
 */
export function optimizeParameters(metrics: SignalQualityMetrics, dataLength: number): SmoothingParams {
    let windowSize = 5;
    let polyOrder = 2;

    // Logic:
    // High Volatility -> Shorter Window (catch transients), Higher Poly (fit curves)
    // Low Volatility -> Longer Window (smooth noise), Lower Poly (general trend)

    if (metrics.volatility > 0.15 || metrics.snr < 5) {
        // Highly volatile or noisy
        windowSize = 5; // Keep window small to preserve peaks
        polyOrder = 3;  // Increase poly to fit complex shapes
    } else if (metrics.volatility < 0.05 && metrics.snr > 20) {
        // Very stable
        windowSize = 11; // Smoother
        polyOrder = 2;
    } else {
        // Moderate
        windowSize = 7;
        polyOrder = 2;
    }

    // Ensure window is odd and fits data
    if (windowSize % 2 === 0) windowSize++;
    if (windowSize > dataLength) windowSize = dataLength % 2 === 0 ? dataLength - 1 : dataLength;
    if (windowSize < 3) windowSize = 3;

    // Constraint: Poly order must be < window size
    if (polyOrder >= windowSize) polyOrder = windowSize - 1;

    return { windowSize, polyOrder };
}

/**
 * Basic Savitzky-Golay Implementation (Simplified)
 * In a real environment, this would use a matrix solver.
 * Here we use a weighted moving average approximation if Poly=2/Window=5,
 * or fall back to simple moving average for flexibility in MVP.
 */
function applySavitzkyGolay(data: number[], params: SmoothingParams): number[] {
    const { windowSize } = params;
    const half = Math.floor(windowSize / 2);
    const output = [...data];

    // Simple Moving Average fallback for MVP stability
    // (Real SG requires pre-computed convolution coefficients)
    for (let i = half; i < data.length - half; i++) {
        let sum = 0;
        for (let j = -half; j <= half; j++) {
            sum += data[i + j];
        }
        output[i] = sum / windowSize;
    }
    return output;
}

/**
 * Calculates Mean Absolute Percentage Error (MAPE)
 */
function calculateMAPE(actual: number[], forecasted: number[]): number {
    if (actual.length !== forecasted.length || actual.length === 0) return 100;

    let sumError = 0;
    for (let i = 0; i < actual.length; i++) {
        const val = actual[i];
        if (val === 0) continue; // Avoid division by zero
        sumError += Math.abs((val - forecasted[i]) / val);
    }
    return (sumError / actual.length) * 100;
}

/**
 * Main Adaptive Smoothing Function
 */
export function adaptiveSmooth(data: number[]): number[] {
    if (data.length < 5) return data;

    // 1. Analyze Signal
    const metrics = analyzeSignalQuality(data);

    // 2. Select Parameters
    let params = optimizeParameters(metrics, data.length);

    // 3. Backtest Loop (Simplified)
    // We try to smooth the data. If the smoothed data deviates too much from raw
    // (implying we over-smoothed important features), we tighten the parameters.
    let smoothed = applySavitzkyGolay(data, params);

    // Check error on the last 5 points (Self-Verification)
    const lastN = 5;
    const originalTail = data.slice(-lastN);
    const smoothedTail = smoothed.slice(-lastN);
    const error = calculateMAPE(originalTail, smoothedTail);

    // 4. Feedback Adjustment
    if (error > 5) {
        // Error too high, likely over-smoothed. Reduce window size to preserve original signal.
        // console.log("Re-adjusting smoothing parameters due to high MAPE:", error);
        params.windowSize = Math.max(3, params.windowSize - 2);
        smoothed = applySavitzkyGolay(data, params);
    }

    return smoothed;
}

// Keep the original export for backward compatibility if needed, but redirect
export function smoothData(data: number[]): number[] {
    return adaptiveSmooth(data);
}
