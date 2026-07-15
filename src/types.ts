export interface Neighbourhood {id:string;name:string;latitude:number;longitude:number;surfaceTemperature:number;airTemperature:number;canopyCoverage:number;population:number;vulnerablePopulationPercentage:number;imperviousSurfacePercentage:number;availableLand:number;availableRoofArea:number;waterAvailability:'low'|'medium'|'high';heatRiskScore:number;vulnerabilityScore:number;priorityScore:number;humidity:number;solarExposure:string;wind:number;soilMoisture:number;}
export interface CoolingIntervention {id:string;name:string;cooling:string;costLevel:string;waterDemand:string;landRequirement:string;maintenance:string;timeToBenefit:string;suitable:string;limitations:string;}
export interface AgentRecommendation {name:string;status:string;inputs:string;finding:string;confidence:number;action:string;}
export interface ResourceConstraint {budget:number;water:number;land:number;workers:number;period:number;coverage:number;}
export interface ScenarioResult {id:string;name:string;tag:string;color:string;trees:number;roof:number;park:number;shade:number;cooling:number;cost:number;water:number;land:number;people:number;energy:number;carbon:number;maintenance:number;equity:number;time:string;}
export interface SensorReading {name:string;value:string;status:string;}
export interface MaintenanceAlert {title:string;location:string;severity:'high'|'medium'|'low';time:string;}
export interface Stakeholder {group:string;members:string[];icon:string;}
