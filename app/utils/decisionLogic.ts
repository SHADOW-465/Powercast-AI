export interface GeneratorUnit {
  id: string;
  name: string;
  capacityMW: number;
}

export interface UnitCommitment {
  timeIndex: number;
  timestamp: string;
  loadMW: number;
  unitsOn: string[];
  unitsOff: string[];
  totalCapacityOn: number;
  surplus: number;
}

export interface MaintenanceSuggestion {
  startTimestamp: string;
  endTimestamp: string;
  avgLoad: number;
  reason: string;
}

/**
 * Determines which generator units should be ON based on predicted load.
 * Strategy: Turn on units until capacity > load + reserve (optional).
 * Here we use a simple greedy approach: Sort units by capacity (descending)
 * or order provided, and turn on enough to meet load.
 *
 * Note: Real unit commitment is optimization (MIP), here we use a rule-based heuristic
 * as per "Simple, Explainable" requirement.
 */
export function calculateUnitCommitment(
  predictedLoad: number[],
  timestamps: string[],
  units: GeneratorUnit[],
  reserveMargin: number = 0 // MW
): UnitCommitment[] {

  // Sort units? Let's assume user input order is preference order (base load first).
  // Or typically base load (cheaper/larger) first.
  // We will respect the order in the list.

  return predictedLoad.map((load, idx) => {
    let currentCapacity = 0;
    const unitsOn: string[] = [];
    const unitsOff: string[] = [];
    const target = load + reserveMargin;

    // Greedy allocation
    for (const unit of units) {
      if (currentCapacity < target) {
        currentCapacity += unit.capacityMW;
        unitsOn.push(unit.name);
      } else {
        unitsOff.push(unit.name);
      }
    }

    // If all units ON and still not enough, well, we tried. All are ON.

    return {
      timeIndex: idx,
      timestamp: timestamps[idx],
      loadMW: load,
      unitsOn,
      unitsOff,
      totalCapacityOn: currentCapacity,
      surplus: currentCapacity - load
    };
  });
}

/**
 * Identifies low-load periods suitable for maintenance.
 * Heuristic: Find contiguous periods where load is significantly lower than peak.
 * e.g., < 70% of peak load for at least N hours.
 */
export function suggestMaintenance(
  load: number[],
  timestamps: string[],
  thresholdPercent: number = 0.7,
  minDurationHours: number = 4
): MaintenanceSuggestion[] {
  if (load.length === 0) return [];

  const maxLoad = Math.max(...load);
  const threshold = maxLoad * thresholdPercent;

  const suggestions: MaintenanceSuggestion[] = [];
  let currentStartIdx: number | null = null;

  for (let i = 0; i < load.length; i++) {
    const isLow = load[i] < threshold;

    if (isLow) {
      if (currentStartIdx === null) {
        currentStartIdx = i;
      }
    } else {
      if (currentStartIdx !== null) {
        const duration = i - currentStartIdx;
        if (duration >= minDurationHours) {
          // Calculate avg load
          let sum = 0;
          for (let k = currentStartIdx; k < i; k++) sum += load[k];
          const avg = sum / duration;

          suggestions.push({
            startTimestamp: timestamps[currentStartIdx],
            endTimestamp: timestamps[i - 1],
            avgLoad: avg,
            reason: `Load < ${(thresholdPercent * 100).toFixed(0)}% of peak (${maxLoad.toFixed(1)} MW)`
          });
        }
        currentStartIdx = null;
      }
    }
  }

  // Check if ending in a low period
  if (currentStartIdx !== null) {
    const duration = load.length - currentStartIdx;
    if (duration >= minDurationHours) {
        let sum = 0;
        for (let k = currentStartIdx; k < load.length; k++) sum += load[k];
        const avg = sum / duration;

        suggestions.push({
          startTimestamp: timestamps[currentStartIdx],
          endTimestamp: timestamps[load.length - 1],
          avgLoad: avg,
          reason: `Load < ${(thresholdPercent * 100).toFixed(0)}% of peak`
        });
    }
  }

  return suggestions;
}
