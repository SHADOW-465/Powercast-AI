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

export interface MaintenanceWindowConfig {
  id: string;
  start: string;
  end: string;
  reason: string;
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
 * 1. Calculate renewable contribution first (Solar, Wind, Hydro).
 * 2. Fill deficit with Non-Renewable (Thermal, Nuclear) based on Emission Factor first, then Marginal Cost.
 * 3. Output recommendations for units to turn OFF.
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

    // 1. Separate Units
    const renewableUnits = units.filter(u => u.isRenewable);

    // Non-Renewable Sort Logic:
    // Primary: Emission Factor (Ascending - lowest emissions first)
    // Secondary: Marginal Cost (Ascending - cheapest first)
    const nonRenewableUnits = units.filter(u => !u.isRenewable)
      .sort((a, b) => {
          if (a.emissionFactor !== b.emissionFactor) {
              return a.emissionFactor - b.emissionFactor;
          }
          return a.marginalCost - b.marginalCost;
      });

    // 2. Dispatch Renewables (Must Run)
    // In this simulation, we assume if it's ON in config, it contributes.
    // Ideally we would scale this by weather factor, but for now we assume 'available capacity'
    // is what's provided or we assume full capacity for simplicity if 'ON'.
    let renewableCapacity = 0;
    for (const unit of renewableUnits) {
      // Logic: Renewables are "Must Take" if status is ON.
      // If status is OFF manually, we don't use it.
      if (unit.status === 'ON') {
          currentCapacity += unit.capacityMW;
          renewableCapacity += unit.capacityMW;
          unitsOn.push(unit.name);
      } else {
          unitsOff.push(unit.name);
      }
    }

    // 3. Dispatch Non-Renewables to fill Deficit
    for (const unit of nonRenewableUnits) {
      if (unit.status === 'OFF') {
          // If manually OFF, keep OFF
          unitsOff.push(unit.name);
          continue;
      }

      if (currentCapacity < target) {
        // We need this unit
        currentCapacity += unit.capacityMW;
        unitsOn.push(unit.name);
      } else {
        // We have enough power, shed this thermal/nuclear unit
        unitsOff.push(unit.name);
      }
    }

    // Metrics
    const renewablePercentage = currentCapacity > 0 ? (renewableCapacity / currentCapacity) * 100 : 0;

    // Calculate environmental impact (kg CO2)
    const environmentalImpact = unitsOn.reduce((acc, name) => {
      const unit = units.find(u => u.name === name);
      if (!unit) return acc;
      return acc + (unit.capacityMW * unit.emissionFactor);
    }, 0);

    return {
      timeIndex: idx,
      timestamp: timestamps[idx] || `T+${idx}`,
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
          let sum = 0;
          for (let k = currentStartIdx; k < i; k++) sum += load[k];
          const avg = sum / duration;

          suggestions.push({
            startTimestamp: timestamps[currentStartIdx] || `T+${currentStartIdx}`,
            endTimestamp: timestamps[i - 1] || `T+${i-1}`,
            avgLoad: avg,
            reason: `Load < ${(thresholdPercent * 100).toFixed(0)}% of peak`
          });
        }
        currentStartIdx = null;
      }
    }
  }

  // Flush end
  if (currentStartIdx !== null) {
      const i = load.length;
      const duration = i - currentStartIdx;
       if (duration >= minDurationHours) {
          let sum = 0;
          for (let k = currentStartIdx; k < i; k++) sum += load[k];
          const avg = sum / duration;

          suggestions.push({
            startTimestamp: timestamps[currentStartIdx] || `T+${currentStartIdx}`,
            endTimestamp: timestamps[i - 1] || `T+${i-1}`,
            avgLoad: avg,
            reason: `Load < ${(thresholdPercent * 100).toFixed(0)}% of peak`
          });
        }
  }

  return suggestions;
}
