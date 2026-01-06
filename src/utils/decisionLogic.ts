export interface GeneratorUnit {
  id: string;
  name: string;
  capacityMW: number;
  type: 'solar' | 'wind' | 'hydro' | 'thermal' | 'nuclear' | 'other';
  isRenewable: boolean;
  status: 'ON' | 'OFF';
  marginalCost: number;
  emissionFactor: number; // kg CO2 per MWh
}

export interface UnitCommitment {
  timeIndex: number;
  timestamp: string;
  loadMW: number;
  unitsOn: string[];
  unitsOff: string[];
  totalCapacityOn: number;
  surplus: number;
  renewablePercentage: number;
  environmentalImpact: number; // estimated aggregate emission
}

export interface MaintenanceSuggestion {
  startTimestamp: string;
  endTimestamp: string;
  avgLoad: number;
  reason: string;
}

/**
 * Determines which generator units should be ON based on predicted load.
 * Strategy: Environmental Priority Dispatch.
 * 1. Calculate renewable contribution first.
 * 2. Fill deficit with non-renewables based on marginal cost/emissions.
 */
export function calculateUnitCommitment(
  predictedLoad: number[],
  timestamps: string[],
  units: GeneratorUnit[],
  reserveMargin: number = 0 // MW
): UnitCommitment[] {

  return predictedLoad.map((load, idx) => {
    let currentCapacity = 0;
    const unitsOn: string[] = [];
    const unitsOff: string[] = [];
    const target = load + reserveMargin;

    // First: Prioritize Renewables
    const renewableUnits = units.filter(u => u.isRenewable);
    const nonRenewableUnits = units.filter(u => !u.isRenewable)
      .sort((a, b) => a.marginalCost - b.marginalCost); // Dispatch based on cost/efficiency

    let renewableCapacity = 0;
    for (const unit of renewableUnits) {
      // Note: In real scenarios, solar/wind capacity is weather-dependent.
      // Here we assume availability is managed by the AI's forecast context.
      currentCapacity += unit.capacityMW;
      renewableCapacity += unit.capacityMW;
      unitsOn.push(unit.name);
    }

    // Second: Fill deficit with Non-Renewables
    for (const unit of nonRenewableUnits) {
      if (currentCapacity < target) {
        currentCapacity += unit.capacityMW;
        unitsOn.push(unit.name);
      } else {
        unitsOff.push(unit.name);
      }
    }

    const renewablePercentage = (renewableCapacity / (currentCapacity || 1)) * 100;

    // Calculate environmental impact (very simplified estimate)
    const environmentalImpact = unitsOn.reduce((acc, name) => {
      const unit = units.find(u => u.name === name);
      if (!unit) return acc;
      // In a real grid, output per unit is shared. Here we estimate impact 
      // based on capacity share relative to load.
      const estimatedOutput = (unit.capacityMW / currentCapacity) * load;
      return acc + (estimatedOutput * unit.emissionFactor);
    }, 0);

    return {
      timeIndex: idx,
      timestamp: timestamps[idx],
      loadMW: load,
      unitsOn,
      unitsOff,
      totalCapacityOn: currentCapacity,
      surplus: currentCapacity - load,
      renewablePercentage: Math.min(100, renewablePercentage),
      environmentalImpact
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
