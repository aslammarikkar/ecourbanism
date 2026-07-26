export interface SimulationWeights {
  solarHeatFactor: number;
  outdoorHeatFactor: number;
  occupancyHeatFactor: number;
  treeShadeCoolingFactor: number;
  greenRoofCoolingFactor: number;
  livingWallCoolingFactor: number;
  evapotranspirationFactor: number;
  ventilationCoolingFactor: number;
  hvacCoolingFactor: number;
}

/**
 * Prototype assumptions for demonstrating understandable relationships only.
 * These values are not scientifically validated and must be calibrated using
 * measured building, plant, weather and occupant data before real decisions.
 */
export const SIMULATION_WEIGHTS: SimulationWeights = {
  solarHeatFactor: 1.15,
  outdoorHeatFactor: 0.62,
  occupancyHeatFactor: 0.018,
  treeShadeCoolingFactor: 0.12,
  greenRoofCoolingFactor: 0.009,
  livingWallCoolingFactor: 0.007,
  evapotranspirationFactor: 0.65,
  ventilationCoolingFactor: 0.035,
  hvacCoolingFactor: 0.72,
};

export const MODE_DEFAULTS = {
  baseline: { trees: 0, roof: 0, wall: 0, indoor: 4, smart: false },
  vegetation: { trees: 8, roof: 70, wall: 45, indoor: 18, smart: false },
  ai: { trees: 2, roof: 0, wall: 0, indoor: 4, smart: true },
  integrated: { trees: 8, roof: 70, wall: 45, indoor: 18, smart: true },
} as const;
