export type HeatRisk = "low" | "moderate" | "high" | "critical";
export type SimulationMode = "baseline" | "vegetation" | "ai" | "integrated";

export interface BuildingZone {
  id: string;
  name: string;
  orientation: "north" | "south" | "east" | "west";
  indoorTemperature: number;
  surfaceTemperature: number;
  humidity: number;
  occupancy: number;
  comfortScore: number;
  hvacEnergy: number;
  heatRisk: HeatRisk;
  hvacState: string;
  windowState: string;
  description: string;
}

export interface VegetationIntervention {
  id: string;
  type: "tree" | "green-roof" | "living-wall" | "indoor-plant" | "shaded-area";
  location: string;
  quantity: number;
  canopyCoverage?: number;
  soilMoisture: number;
  healthScore: number;
  waterDemand: number;
  maintenanceDemand: number;
  estimatedCoolingContribution: number;
}

export interface WeatherConditions {
  outdoorTemperature: number;
  humidity: number;
  solarIntensity: "low" | "medium" | "high";
  windSpeed: number;
  windDirection: string;
  heatwaveSeverity: "normal" | "moderate" | "severe" | "extreme";
  timeOfDay: number;
  cloudCoverage: number;
  rainProbability: number;
}

export interface BuildingControlSettings {
  occupants: number;
  equipmentLoad: number;
  windowOpening: number;
  blindPosition: number;
  ventilationLevel: number;
  hvacSetpoint: number;
  hvacMode: "off" | "conventional" | "smart";
  roofInsulation: number;
  facadeReflectivity: number;
}

export interface ResourceConstraints {
  budget: number;
  dailyWaterLimit: number;
  energyLimit: number;
  maintenanceCapacity: number;
  rainwaterAvailable: number;
}

export interface HourlyTemperature {
  hour: string;
  outdoor: number;
  baseline: number;
  intervention: number;
  comfort: number;
}

export interface SimulationResults {
  hourlyTemperatures: HourlyTemperature[];
  zoneResults: BuildingZone[];
  peakTemperature: number;
  averageIndoorTemperature: number;
  estimatedTemperatureReduction: number;
  energyConsumption: number;
  waterConsumption: number;
  comfortScore: number;
  maintenanceDemand: number;
  overallScore: number;
  operatingCost: number;
  plantHealth: number;
}

export interface DigitalTwinScenario {
  id: string;
  name: string;
  mode: SimulationMode;
  weather: WeatherConditions;
  buildingControls: BuildingControlSettings;
  vegetation: VegetationIntervention[];
  resourceConstraints: ResourceConstraints;
  results?: SimulationResults;
}

export interface TwinSensor {
  id: string;
  name: string;
  category: "temperature" | "plant" | "building" | "resource";
  reading: number;
  unit: string;
  status: string;
  quality: number;
  x: number;
  y: number;
  history: number[];
}
