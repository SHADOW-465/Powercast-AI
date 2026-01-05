
import { savitzkyGolaySmooth } from './signalProcessing';
import { calculateUnitCommitment, suggestMaintenance } from './decisionLogic';

// --- Test 1: Savitzky-Golay ---
// Simple impulse or step to see if it smooths
const noisyData = [10, 10, 11, 10, 9, 15, 10, 10, 10, 10, 10, 10, 10];
// SG should flatten that spike at index 5 somewhat
const smoothed = savitzkyGolaySmooth(noisyData);
console.log("Original:", noisyData);
console.log("Smoothed:", smoothed.map(n => Number(n.toFixed(2))));

// --- Test 2: Unit Commitment ---
const load = [100, 150, 280, 500];
const timestamps = ["T1", "T2", "T3", "T4"];
const units = [
    { id: '1', name: 'Base', capacityMW: 300 },
    { id: '2', name: 'Peaker', capacityMW: 250 }
];

const commitment = calculateUnitCommitment(load, timestamps, units);
console.log("Commitment:", JSON.stringify(commitment, null, 2));

// --- Test 3: Maintenance ---
const maintenanceLoad = [500, 500, 100, 100, 100, 100, 500]; // Middle is low
const maintTimestamps = ["00", "01", "02", "03", "04", "05", "06"];
const suggestions = suggestMaintenance(maintenanceLoad, maintTimestamps, 0.5, 3);
console.log("Maintenance:", JSON.stringify(suggestions, null, 2));
