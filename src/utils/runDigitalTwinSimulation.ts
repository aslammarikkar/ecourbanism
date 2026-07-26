import {
  MODE_DEFAULTS,
  SIMULATION_WEIGHTS as W,
} from "../config/simulationAssumptions";
import { initialZones } from "../data/digitalTwinMockData";
import type {
  DigitalTwinScenario,
  HeatRisk,
  SimulationResults,
} from "../types/digitalTwin";

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const risk = (t: number): HeatRisk =>
  t >= 34 ? "critical" : t >= 31 ? "high" : t >= 27 ? "moderate" : "low";

export function runDigitalTwinSimulation(
  s: DigitalTwinScenario,
): SimulationResults {
  const mode = MODE_DEFAULTS[s.mode];
  const health = s.vegetation.length
    ? s.vegetation.reduce((a, v) => a + v.healthScore, 0) / s.vegetation.length
    : 78;
  const soil = s.vegetation.length
    ? s.vegetation.reduce((a, v) => a + v.soilMoisture, 0) / s.vegetation.length
    : 45;
  const plantEfficiency = clamp((health / 100) * (soil / 45), 0.25, 1);
  const treeCooling = mode.trees * W.treeShadeCoolingFactor * plantEfficiency;
  const roofCooling = mode.roof * W.greenRoofCoolingFactor * plantEfficiency;
  const wallCooling = mode.wall * W.livingWallCoolingFactor * plantEfficiency;
  const indoorCooling = Math.min(0.22, mode.indoor * 0.009);
  const passiveCooling =
    treeCooling + roofCooling + wallCooling + indoorCooling;
  const solar =
    { low: 0.25, medium: 0.7, high: 1 }[s.weather.solarIntensity] *
    W.solarHeatFactor;
  const occupantHeat = s.buildingControls.occupants * W.occupancyHeatFactor;
  const outdoorDelta = s.weather.outdoorTemperature - 26;
  const ventilationHelpful =
    s.weather.outdoorTemperature < 30
      ? s.buildingControls.ventilationLevel * W.ventilationCoolingFactor
      : -s.buildingControls.windowOpening * 0.006;
  const hvacEffort =
    s.buildingControls.hvacMode === "off"
      ? 0
      : (30 - s.buildingControls.hvacSetpoint) * W.hvacCoolingFactor;
  const smartBonus = mode.smart ? 0.55 : 0;
  const average = clamp(
    26 +
      outdoorDelta * W.outdoorHeatFactor +
      solar +
      occupantHeat -
      passiveCooling -
      ventilationHelpful -
      hvacEffort -
      smartBonus,
    20,
    39,
  );
  const zoneResults = initialZones.map((z, i) => {
    const orientation =
      i === 0 && s.weather.timeOfDay >= 13
        ? 1.15
        : i === 1 && s.weather.timeOfDay < 12
          ? 0.65
          : i === 2
            ? s.buildingControls.occupants * 0.015
            : 0;
    const temp = clamp(
      average +
        orientation +
        (i === 0 ? solar * 0.45 : 0) -
        (i === 3 ? treeCooling * 0.25 : 0),
      19,
      41,
    );
    const comfort = clamp(
      100 - Math.abs(temp - 24) * 8 - s.weather.humidity * 0.05,
      15,
      98,
    );
    return {
      ...z,
      indoorTemperature: +temp.toFixed(1),
      surfaceTemperature: +(temp + 3.2 + solar).toFixed(1),
      humidity: s.weather.humidity,
      occupancy: Math.round(
        s.buildingControls.occupants * [0.18, 0.17, 0.43, 0.22][i],
      ),
      comfortScore: Math.round(comfort),
      hvacEnergy: +((temp - s.buildingControls.hvacSetpoint) * 3.2).toFixed(1),
      heatRisk: risk(temp),
      hvacState:
        s.buildingControls.hvacMode === "smart"
          ? "AI-assisted"
          : "Conventional",
      windowState: `${s.buildingControls.windowOpening}% open`,
    };
  });
  const hours = Array.from({ length: 24 }, (_, h) => {
    const curve = Math.sin(((h - 7) / 24) * Math.PI * 2);
    const outdoor = s.weather.outdoorTemperature - 6 + Math.max(0, curve) * 8;
    const baseline = 27 + (outdoor - 26) * 0.64 + Math.max(0, curve) * 1.8;
    return {
      hour: `${String(h).padStart(2, "0")}:00`,
      outdoor: +outdoor.toFixed(1),
      baseline: +baseline.toFixed(1),
      intervention: +(baseline - passiveCooling - smartBonus).toFixed(1),
      comfort: 26,
    };
  });
  const energy = clamp(
    104 -
      (s.buildingControls.hvacSetpoint - 21) * 4 -
      passiveCooling * 7 -
      (mode.smart ? 16 : 0) +
      s.buildingControls.occupants * 0.3,
    20,
    150,
  );
  const water = Math.max(
    0,
    mode.trees * 0.12 +
      mode.roof * 0.018 +
      mode.wall * 0.025 +
      mode.indoor * 0.015 -
      (mode.smart ? 0.8 : 0),
  );
  const comfort = Math.round(
    zoneResults.reduce((a, z) => a + z.comfortScore, 0) / 4,
  );
  const maintenance = +(
    mode.trees * 0.12 +
    mode.roof * 0.018 +
    mode.wall * 0.03 +
    mode.indoor * 0.025
  ).toFixed(1);
  const reduction = Math.max(0, passiveCooling + smartBonus);
  return {
    hourlyTemperatures: hours,
    zoneResults,
    peakTemperature: Math.max(...zoneResults.map((z) => z.indoorTemperature)),
    averageIndoorTemperature: +average.toFixed(1),
    estimatedTemperatureReduction: +reduction.toFixed(1),
    energyConsumption: +energy.toFixed(1),
    waterConsumption: +water.toFixed(1),
    comfortScore: comfort,
    maintenanceDemand: maintenance,
    overallScore: Math.round(
      clamp(comfort - energy * 0.18 - water * 1.4 + 50, 0, 100),
    ),
    operatingCost: Math.round(energy * 0.34 + water * 2.1),
    plantHealth: Math.round(health),
  };
}
