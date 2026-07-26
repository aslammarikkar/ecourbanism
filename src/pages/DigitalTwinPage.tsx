import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add,
  ArrowForward,
  AutoAwesomeOutlined,
  Close,
  ExpandMore,
  ParkOutlined,
  Refresh,
  ScienceOutlined,
  SensorsOutlined,
  ThermostatOutlined,
  WaterDropOutlined,
} from "@mui/icons-material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { initialSensors, initialZones } from "../data/digitalTwinMockData";
import { MODE_DEFAULTS } from "../config/simulationAssumptions";
import { runDigitalTwinSimulation } from "../utils/runDigitalTwinSimulation";
import type {
  BuildingZone,
  DigitalTwinScenario,
  SimulationMode,
  SimulationResults,
  TwinSensor,
  VegetationIntervention,
} from "../types/digitalTwin";
import "./digitalTwin.css";

const makeVegetation = (mode: SimulationMode): VegetationIntervention[] => {
  const d = MODE_DEFAULTS[mode];
  return [
    ...(d.trees
      ? [
          {
            id: "trees",
            type: "tree" as const,
            location: "West and courtyard",
            quantity: d.trees,
            canopyCoverage: d.trees * 4,
            soilMoisture: 48,
            healthScore: 86,
            waterDemand: d.trees * 0.12,
            maintenanceDemand: d.trees * 0.1,
            estimatedCoolingContribution: d.trees * 0.1,
          },
        ]
      : []),
    ...(d.roof
      ? [
          {
            id: "roof",
            type: "green-roof" as const,
            location: "Flat roof",
            quantity: d.roof,
            soilMoisture: 44,
            healthScore: 84,
            waterDemand: d.roof * 0.018,
            maintenanceDemand: 1.2,
            estimatedCoolingContribution: d.roof * 0.009,
          },
        ]
      : []),
    ...(d.wall
      ? [
          {
            id: "wall",
            type: "living-wall" as const,
            location: "West façade",
            quantity: d.wall,
            soilMoisture: 46,
            healthScore: 82,
            waterDemand: d.wall * 0.025,
            maintenanceDemand: 1.4,
            estimatedCoolingContribution: d.wall * 0.007,
          },
        ]
      : []),
    {
      id: "indoor",
      type: "indoor-plant",
      location: "Four thermal zones",
      quantity: d.indoor,
      soilMoisture: 52,
      healthScore: 88,
      waterDemand: d.indoor * 0.015,
      maintenanceDemand: d.indoor * 0.025,
      estimatedCoolingContribution: Math.min(0.22, d.indoor * 0.009),
    },
  ];
};
const makeScenario = (
  mode: SimulationMode = "baseline",
): DigitalTwinScenario => ({
  id: crypto.randomUUID(),
  name: {
    baseline: "Baseline",
    vegetation: "Vegetation Strategy",
    ai: "AI Control Strategy",
    integrated: "Integrated Strategy",
  }[mode],
  mode,
  weather: {
    outdoorTemperature: 38,
    humidity: 42,
    solarIntensity: "high",
    windSpeed: 2.5,
    windDirection: "west",
    heatwaveSeverity: "severe",
    timeOfDay: 15,
    cloudCoverage: 15,
    rainProbability: 10,
  },
  buildingControls: {
    occupants: 70,
    equipmentLoad: 65,
    windowOpening: 10,
    blindPosition: 40,
    ventilationLevel: 35,
    hvacSetpoint: 24,
    hvacMode: mode === "ai" || mode === "integrated" ? "smart" : "conventional",
    roofInsulation: 55,
    facadeReflectivity: 35,
  },
  vegetation: makeVegetation(mode),
  resourceConstraints: {
    budget: 500000,
    dailyWaterLimit: 8,
    energyLimit: 120,
    maintenanceCapacity: 6,
    rainwaterAvailable: 3,
  },
});
const riskColor = {
  low: "#438AC9",
  moderate: "#43A875",
  high: "#E8923A",
  critical: "#D84A4A",
};

function TwinCanvas({
  zones,
  vegetation,
  sensors,
  showSensors,
  onSelect,
}: {
  zones: BuildingZone[];
  vegetation: VegetationIntervention[];
  sensors: TwinSensor[];
  showSensors: string[];
  onSelect: (x: {
    name: string;
    condition: string;
    reading: string;
    assumption: string;
  }) => void;
}) {
  const has = (id: string) => vegetation.some((v) => v.id === id);
  return (
    <Card className="twin-canvas-card">
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h6">Virtual site model</Typography>
            <Typography variant="caption" color="text.secondary">
              Clickable 2.5D prototype · values are illustrative
            </Typography>
          </Box>
          <Chip
            icon={<ThermostatOutlined />}
            label="Heat overlay active"
            color="warning"
          />
        </Stack>
        <Box
          className="twin-site"
          aria-label="Interactive simplified two-storey building digital twin"
        >
          <Box
            className={`twin-roof ${has("roof") ? "greened" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() =>
              onSelect({
                name: "Flat roof",
                condition: has("roof")
                  ? "70% green-roof coverage"
                  : "Dark conventional roof",
                reading: `Surface estimate ${Math.max(...zones.map((z) => z.surfaceTemperature)).toFixed(1)}°C`,
                assumption:
                  "Green-roof cooling depends on substrate, plant health, water and insulation; calibration required.",
              })
            }
          >
            <b>{has("roof") ? "GREEN ROOF" : "FLAT ROOF"}</b>
            <span>Weather station</span>
          </Box>
          <Box className="building-grid">
            {zones.map((z) => (
              <button
                key={z.id}
                className="thermal-zone"
                style={
                  { "--heat": riskColor[z.heatRisk] } as React.CSSProperties
                }
                onClick={() =>
                  onSelect({
                    name: z.name,
                    condition: `${z.heatRisk} heat risk · ${z.hvacState}`,
                    reading: `${z.indoorTemperature}°C · ${z.humidity}% RH · comfort ${z.comfortScore}`,
                    assumption: z.description,
                  })
                }
              >
                <b>{z.id.toUpperCase()}</b>
                <strong>{z.indoorTemperature}°C</strong>
                <small>
                  {z.heatRisk} · {z.occupancy} people
                </small>
                <i>{z.windowState}</i>
              </button>
            ))}
          </Box>
          <button
            className={`living-wall ${has("wall") ? "active" : ""}`}
            onClick={() =>
              onSelect({
                name: "West living wall",
                condition: has("wall")
                  ? "Vegetated and irrigated"
                  : "Available placement zone",
                reading: has("wall") ? "82% plant health" : "No active reading",
                assumption:
                  "Illustrative façade shading; water and maintenance costs remain visible.",
              })
            }
          >
            Living wall
          </button>
          <Box className="street">STREET · PERMEABLE PAVEMENT</Box>
          <Box className="courtyard">
            {has("trees") &&
              Array.from(
                { length: Math.min(6, MODE_DEFAULTS.integrated.trees) },
                (_, i) => (
                  <button
                    key={i}
                    className="tree"
                    aria-label={`Tree placement ${i + 1}`}
                    onClick={() =>
                      onSelect({
                        name: "Courtyard / west tree",
                        condition: "Healthy medium canopy",
                        reading: "48% soil moisture",
                        assumption:
                          "West-facing trees receive stronger illustrative afternoon shading weight.",
                      })
                    }
                  >
                    ♣
                  </button>
                ),
              )}
            <span>COURTYARD</span>
          </Box>
          <button
            className="hvac"
            onClick={() =>
              onSelect({
                name: "HVAC system",
                condition: zones[0].hvacState,
                reading: `${zones.reduce((a, z) => a + z.hvacEnergy, 0).toFixed(1)} kWh zone demand`,
                assumption:
                  "Lower setpoints increase illustrative energy demand; facility approval remains required.",
              })
            }
          >
            HVAC
          </button>
          <button
            className="water-tank"
            onClick={() =>
              onSelect({
                name: "Irrigation & rainwater tank",
                condition: "Resource-aware schedule",
                reading: "3 m³ available rainwater",
                assumption:
                  "Smart irrigation cannot exceed configured water constraints.",
              })
            }
          >
            <WaterDropOutlined /> TANK
          </button>
          {sensors
            .filter(
              (s) =>
                showSensors.includes("all") || showSensors.includes(s.category),
            )
            .map((s) => (
              <button
                className="sensor-dot"
                style={
                  { left: `${s.x}%`, top: `${s.y}%` } as React.CSSProperties
                }
                key={s.id}
                aria-label={s.name}
                onClick={() =>
                  onSelect({
                    name: s.name,
                    condition: `${s.status} · quality ${s.quality}%`,
                    reading: `${s.reading} ${s.unit}`,
                    assumption:
                      "Simulated sensor reading · last updated moments ago · not connected to real IoT.",
                  })
                }
              >
                <SensorsOutlined />
              </button>
            ))}
        </Box>
        <Box className="heat-legend">
          {Object.entries(riskColor).map(([x, c]) => (
            <span key={x}>
              <i style={{ background: c }} />
              {x}
            </span>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function ControlPanel({
  scenario,
  setScenario,
  onAdd,
}: {
  scenario: DigitalTwinScenario;
  setScenario: React.Dispatch<React.SetStateAction<DigitalTwinScenario>>;
  onAdd: () => void;
}) {
  const w = scenario.weather,
    b = scenario.buildingControls,
    r = scenario.resourceConstraints;
  const patch = <K extends keyof DigitalTwinScenario>(
    k: K,
    v: DigitalTwinScenario[K],
  ) => setScenario((s) => ({ ...s, [k]: v }));
  return (
    <Box className="control-panel">
      <Typography variant="h6">Simulation controls</Typography>
      <FormControl fullWidth size="small" sx={{ mt: 2 }}>
        <InputLabel>Simulation mode</InputLabel>
        <Select
          value={scenario.mode}
          label="Simulation mode"
          onChange={(e) => {
            const next = makeScenario(e.target.value as SimulationMode);
            setScenario(next);
          }}
        >
          {["baseline", "vegetation", "ai", "integrated"].map((x) => (
            <MenuItem value={x} key={x}>
              {makeScenario(x as SimulationMode).name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <b>Weather</b>
        </AccordionSummary>
        <AccordionDetails>
          <Control
            label="Outdoor temperature"
            value={w.outdoorTemperature}
            min={20}
            max={45}
            unit="°C"
            onChange={(v) => patch("weather", { ...w, outdoorTemperature: v })}
          />
          <Control
            label="Relative humidity"
            value={w.humidity}
            min={20}
            max={90}
            unit="%"
            onChange={(v) => patch("weather", { ...w, humidity: v })}
          />
          <Control
            label="Wind speed"
            value={w.windSpeed}
            min={0}
            max={12}
            step={0.5}
            unit="m/s"
            onChange={(v) => patch("weather", { ...w, windSpeed: v })}
          />
          <Control
            label="Time of day"
            value={w.timeOfDay}
            min={0}
            max={23}
            unit=":00"
            onChange={(v) => patch("weather", { ...w, timeOfDay: v })}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Solar intensity</InputLabel>
            <Select
              value={w.solarIntensity}
              label="Solar intensity"
              onChange={(e) =>
                patch("weather", {
                  ...w,
                  solarIntensity: e.target.value as typeof w.solarIntensity,
                })
              }
            >
              {["low", "medium", "high"].map((x) => (
                <MenuItem value={x} key={x}>
                  {x}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <b>Building & occupants</b>
        </AccordionSummary>
        <AccordionDetails>
          <Control
            label="Occupants"
            value={b.occupants}
            min={0}
            max={120}
            unit=" people"
            onChange={(v) => patch("buildingControls", { ...b, occupants: v })}
          />
          <Control
            label="Equipment load"
            value={b.equipmentLoad}
            min={0}
            max={100}
            unit="%"
            onChange={(v) =>
              patch("buildingControls", { ...b, equipmentLoad: v })
            }
          />
          <Control
            label="Window opening"
            value={b.windowOpening}
            min={0}
            max={100}
            unit="%"
            onChange={(v) =>
              patch("buildingControls", { ...b, windowOpening: v })
            }
          />
          <Control
            label="External blinds closed"
            value={b.blindPosition}
            min={0}
            max={100}
            unit="%"
            onChange={(v) =>
              patch("buildingControls", { ...b, blindPosition: v })
            }
          />
          <Control
            label="HVAC setpoint"
            value={b.hvacSetpoint}
            min={20}
            max={29}
            unit="°C"
            onChange={(v) =>
              patch("buildingControls", { ...b, hvacSetpoint: v })
            }
          />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <b>Resources & vegetation</b>
        </AccordionSummary>
        <AccordionDetails>
          <Control
            label="Daily water limit"
            value={r.dailyWaterLimit}
            min={1}
            max={20}
            unit=" m³"
            onChange={(v) =>
              patch("resourceConstraints", { ...r, dailyWaterLimit: v })
            }
          />
          <Control
            label="Energy limit"
            value={r.energyLimit}
            min={40}
            max={180}
            unit=" kWh"
            onChange={(v) =>
              patch("resourceConstraints", { ...r, energyLimit: v })
            }
          />
          <Control
            label="Maintenance capacity"
            value={r.maintenanceCapacity}
            min={1}
            max={12}
            unit=" FTE"
            onChange={(v) =>
              patch("resourceConstraints", { ...r, maintenanceCapacity: v })
            }
          />
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Add />}
            onClick={onAdd}
          >
            Add intervention
          </Button>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
function Control({
  label,
  value,
  min,
  max,
  unit,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <Box mb={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">{label}</Typography>
        <b>
          {value}
          {unit}
        </b>
      </Stack>
      <Slider
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, v) => onChange(v as number)}
      />
    </Box>
  );
}
function ResultPanel({ r }: { r: SimulationResults }) {
  return (
    <Box>
      <Typography variant="h6">Live results</Typography>
      <Box className="twin-kpis">
        {[
          ["Average indoor", `${r.averageIndoorTemperature}°C`],
          ["Peak indoor", `${r.peakTemperature}°C`],
          ["Cooling estimate", `−${r.estimatedTemperatureReduction}°C`],
          ["HVAC energy", `${r.energyConsumption} kWh`],
          ["Irrigation", `${r.waterConsumption} m³`],
          ["Comfort", `${r.comfortScore}/100`],
          ["Plant health", `${r.plantHealth}%`],
          ["Operating cost", `€${r.operatingCost}/day`],
        ].map((x) => (
          <Card key={x[0]}>
            <CardContent>
              <small>Prototype estimate</small>
              <Typography variant="caption">{x[0]}</Typography>
              <Typography variant="h6">{x[1]}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Alert
        severity={r.overallScore > 70 ? "success" : "warning"}
        sx={{ mt: 2 }}
      >
        Overall balance score: <b>{r.overallScore}/100</b>
      </Alert>
    </Box>
  );
}

export default function DigitalTwinPage() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const tablet = useMediaQuery(theme.breakpoints.down("md"));
  const [scenario, setScenario] = useState(makeScenario("integrated"));
  const [results, setResults] = useState(() =>
    runDigitalTwinSimulation(scenario),
  );
  const [sensors, setSensors] = useState(initialSensors);
  const [showSensors, setShowSensors] = useState<string[]>(["all"]);
  const [selected, setSelected] = useState<{
    name: string;
    condition: string;
    reading: string;
    assumption: string;
  } | null>(null);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState<
    (DigitalTwinScenario & { results: SimulationResults })[]
  >([]);
  const [addOpen, setAddOpen] = useState(false);
  const [compare, setCompare] = useState(false);
  const run = () => {
    setRunning(true);
    requestAnimationFrame(() =>
      setTimeout(() => {
        const r = runDigitalTwinSimulation(scenario);
        setResults(r);
        setScenario((s) => ({ ...s, results: r }));
        setSaved((v) =>
          [
            ...v.filter((x) => x.name !== scenario.name),
            { ...scenario, results: r },
          ].slice(-4),
        );
        setRunning(false);
      }, 450),
    );
  };
  const reset = () => {
    const s = makeScenario("baseline");
    setScenario(s);
    setResults(runDigitalTwinSimulation(s));
    setSaved([]);
  };
  const add = (type: VegetationIntervention["type"]) => {
    const id =
      type === "green-roof"
        ? "roof"
        : type === "living-wall"
          ? "wall"
          : type === "tree"
            ? "trees"
            : `x${Date.now()}`;
    setScenario((s) => ({
      ...s,
      vegetation: [
        ...s.vegetation.filter((v) => v.id !== id),
        {
          id,
          type,
          location:
            type === "tree"
              ? "West / courtyard"
              : type === "green-roof"
                ? "Flat roof"
                : type === "living-wall"
                  ? "West façade"
                  : "Indoor zones",
          quantity: type === "tree" ? 4 : type === "indoor-plant" ? 8 : 45,
          soilMoisture: 48,
          healthScore: 85,
          waterDemand: type === "tree" ? 0.5 : 1,
          maintenanceDemand: 1,
          estimatedCoolingContribution: type === "indoor-plant" ? 0.08 : 0.4,
        },
      ],
    }));
    setAddOpen(false);
  };
  const newSensors = () => {
    setSensors((v) =>
      v.map((s) => ({
        ...s,
        reading: +(
          s.reading +
          (Math.random() - 0.5) * (s.category === "temperature" ? 1.4 : 6)
        ).toFixed(1),
        history: [...s.history.slice(-3), s.reading],
      })),
    );
    setSelected({
      name: "Digital Twin state updated",
      condition: "New mock readings passed validation",
      reading: "Temperature, moisture, occupancy and resource readings changed",
      assumption:
        "Real twins update from connected sensors; this demonstration generates local mock values only.",
    });
  };
  const presets: ({
    name: string;
    occupants?: number;
    water?: number;
    setpoint?: number;
  } & Partial<DigitalTwinScenario["weather"]>)[] = [
    {
      name: "Severe Heatwave",
      outdoorTemperature: 39,
      solarIntensity: "high",
      windSpeed: 1,
      occupants: 90,
    },
    { name: "Water Shortage", outdoorTemperature: 37, water: 2 },
    { name: "High Occupancy Day", occupants: 115 },
    { name: "Energy Constraint", setpoint: 27 },
    {
      name: "Balanced Summer Day",
      outdoorTemperature: 30,
      solarIntensity: "medium",
      occupants: 55,
    },
  ];
  const zones = results.zoneResults || initialZones;
  const insight = useMemo(
    () => ({
      finding:
        zones[0].heatRisk === "critical"
          ? "West-facing office remains critical during afternoon solar exposure."
          : "Integrated controls reduce, but do not eliminate, west-zone heat risk.",
      effective: scenario.vegetation.some((v) => v.id === "trees")
        ? "West-facing trees plus pre-peak blinds"
        : "External shading and resource-aware HVAC",
      conflict:
        results.waterConsumption > scenario.resourceConstraints.dailyWaterLimit
          ? "Vegetation demand exceeds the water limit."
          : "Cooling benefit must be balanced against energy, water and maintenance.",
      confidence: Math.round(68 + Math.min(18, saved.length * 4)),
    }),
    [zones, scenario, results, saved],
  );
  return (
    <Box className="digital-twin-page">
      <Box className="twin-hero">
        <Box>
          <Typography className="eyebrow">
            OPTICOOL · DIGITAL TWIN DEMO
          </Typography>
          <Typography variant="h3">
            Interactive Building Digital Twin
          </Typography>
          <Typography variant="h6">
            Explore how plants, weather, occupant behaviour and building
            controls influence urban cooling performance.
          </Typography>
          <Typography>
            The virtual model represents one building, its vegetation,
            surrounding microclimate and technical systems. Change variables and
            compare illustrative effects on temperature, energy, water and
            comfort.
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} mt={2}>
            {[
              "Prototype Simulation",
              "Mock Sensor Data",
              "Real-World Validation Required",
            ].map((x) => (
              <Chip key={x} label={x} />
            ))}
          </Stack>
        </Box>
        <Stack gap={1.2}>
          <Button variant="contained" onClick={run} disabled={running}>
            {running ? (
              <>
                <CircularProgress size={18} color="inherit" /> Simulating 24
                hours…
              </>
            ) : (
              "Run Simulation"
            )}
          </Button>
          <Button variant="outlined" onClick={reset}>
            Reset Twin
          </Button>
          <Button variant="outlined" onClick={() => setCompare(!compare)}>
            Compare Scenarios
          </Button>
          <Button href="#how-it-works">View Methodology</Button>
        </Stack>
      </Box>
      <Alert severity="info">
        Prototype simulation using transparent illustrative assumptions. Results
        are not scientifically validated predictions and require empirical
        calibration.
      </Alert>
      <Box className="preset-row">
        {presets.map((p) => (
          <Button
            key={p.name}
            size="small"
            variant="outlined"
            onClick={() => {
              const {
                name: _name,
                occupants,
                water,
                setpoint,
                ...weatherPatch
              } = p;
              setScenario((s) => ({
                ...s,
                weather: { ...s.weather, ...weatherPatch },
                buildingControls: {
                  ...s.buildingControls,
                  occupants: occupants ?? s.buildingControls.occupants,
                  hvacSetpoint: setpoint ?? s.buildingControls.hvacSetpoint,
                },
                resourceConstraints: {
                  ...s.resourceConstraints,
                  dailyWaterLimit:
                    water ?? s.resourceConstraints.dailyWaterLimit,
                },
              }));
            }}
          >
            {p.name}
          </Button>
        ))}
      </Box>
      <Box className="twin-main">
        {tablet && (
          <Box className="twin-center">
            <TwinCanvas
              zones={zones}
              vegetation={scenario.vegetation}
              sensors={sensors}
              showSensors={showSensors}
              onSelect={setSelected}
            />
          </Box>
        )}
        <Card className="twin-controls">
          <CardContent>
            {mobile ? (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography fontWeight={750}>
                    Open simulation controls
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ControlPanel
                    scenario={scenario}
                    setScenario={setScenario}
                    onAdd={() => setAddOpen(true)}
                  />
                </AccordionDetails>
              </Accordion>
            ) : (
              <ControlPanel
                scenario={scenario}
                setScenario={setScenario}
                onAdd={() => setAddOpen(true)}
              />
            )}
          </CardContent>
        </Card>
        {!tablet && (
          <Box className="twin-center">
            <TwinCanvas
              zones={zones}
              vegetation={scenario.vegetation}
              sensors={sensors}
              showSensors={showSensors}
              onSelect={setSelected}
            />
          </Box>
        )}
        <Card className="twin-results">
          <CardContent>
            <ResultPanel r={results} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2">Sensor layer</Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
              {["all", "temperature", "plant", "building", "resource"].map(
                (x) => (
                  <Chip
                    key={x}
                    clickable
                    label={x}
                    color={showSensors.includes(x) ? "primary" : "default"}
                    variant={showSensors.includes(x) ? "filled" : "outlined"}
                    onClick={() =>
                      setShowSensors((v) =>
                        x === "all"
                          ? ["all"]
                          : v.includes(x)
                            ? v.filter((y) => y !== x && y !== "all")
                            : [...v.filter((y) => y !== "all"), x],
                      )
                    }
                  />
                ),
              )}
            </Stack>
            <Button
              fullWidth
              sx={{ mt: 2 }}
              variant="outlined"
              startIcon={<Refresh />}
              onClick={newSensors}
            >
              Simulate New Sensor Data
            </Button>
          </CardContent>
        </Card>
      </Box>
      <Card className="insight-card">
        <CardContent>
          <Chip
            icon={<AutoAwesomeOutlined />}
            label="RULE-BASED PROTOTYPE EXPLANATION"
          />
          <Typography variant="h5" mt={2}>
            Simulated Digital Twin Insight
          </Typography>
          <Box className="insight-grid">
            <Box>
              <small>Main finding</small>
              <b>{insight.finding}</b>
            </Box>
            <Box>
              <small>Highest-risk zone</small>
              <b>
                {
                  [...zones].sort(
                    (a, b) => b.indoorTemperature - a.indoorTemperature,
                  )[0].name
                }
              </b>
            </Box>
            <Box>
              <small>Most effective intervention</small>
              <b>{insight.effective}</b>
            </Box>
            <Box>
              <small>Resource conflict</small>
              <b>{insight.conflict}</b>
            </Box>
            <Box>
              <small>Recommended adjustment</small>
              <b>Close blinds before peak heat; preserve human override.</b>
            </Box>
            <Box>
              <small>Confidence</small>
              <b>{insight.confidence}% · requires calibration</b>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Box className="twin-charts">
        <Chart title="24-hour temperature profile">
          <LineChart data={results.hourlyTemperatures}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="hour" interval={3} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="outdoor" stroke="#D84A4A" />
            <Line dataKey="baseline" stroke="#E8923A" />
            <Line dataKey="intervention" stroke="#6952D5" strokeWidth={3} />
            <Line dataKey="comfort" stroke="#2F9D70" strokeDasharray="4 4" />
          </LineChart>
        </Chart>
        <Chart title="Zone comfort scores">
          <BarChart
            data={zones.map((z) => ({
              name: `Zone ${z.id.toUpperCase()}`,
              comfort: z.comfortScore,
              energy: z.hvacEnergy,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="comfort" fill="#2F9D70" />
            <Bar dataKey="energy" fill="#6952D5" />
          </BarChart>
        </Chart>
        <Chart title="Strategy energy comparison">
          <BarChart
            data={["baseline", "vegetation", "ai", "integrated"].map((m) => {
              const s = makeScenario(m as SimulationMode);
              return {
                name: s.name.split(" ")[0],
                energy: runDigitalTwinSimulation(s).energyConsumption,
              };
            })}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="energy" fill="#E8923A" />
          </BarChart>
        </Chart>
        <Chart title="Water demand and limits">
          <BarChart
            data={[
              { name: "Irrigation", value: results.waterConsumption },
              {
                name: "Rainwater",
                value: scenario.resourceConstraints.rainwaterAvailable,
              },
              {
                name: "Daily limit",
                value: scenario.resourceConstraints.dailyWaterLimit,
              },
              {
                name: "Municipal",
                value: Math.max(
                  0,
                  results.waterConsumption -
                    scenario.resourceConstraints.rainwaterAvailable,
                ),
              },
            ]}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#438AC9" />
          </BarChart>
        </Chart>
      </Box>
      {compare && (
        <Card sx={{ mt: 2.5 }}>
          <CardContent>
            <Typography variant="h5">Saved scenario comparison</Typography>
            <Typography color="text.secondary">
              Up to four scenarios are saved when you run the simulation.
            </Typography>
            {saved.length ? (
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {[
                        "Scenario",
                        "Vegetation",
                        "Peak",
                        "Reduction",
                        "Energy",
                        "Water",
                        "Comfort",
                        "Cost",
                        "Maintenance",
                        "Score",
                      ].map((x) => (
                        <TableCell key={x}>{x}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {saved.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <b>{s.name}</b>
                        </TableCell>
                        <TableCell>
                          {s.vegetation.map((v) => v.type).join(", ")}
                        </TableCell>
                        <TableCell>{s.results.peakTemperature}°C</TableCell>
                        <TableCell>
                          −{s.results.estimatedTemperatureReduction}°C
                        </TableCell>
                        <TableCell>{s.results.energyConsumption} kWh</TableCell>
                        <TableCell>{s.results.waterConsumption} m³</TableCell>
                        <TableCell>{s.results.comfortScore}</TableCell>
                        <TableCell>€{s.results.operatingCost}</TableCell>
                        <TableCell>{s.results.maintenanceDemand}</TableCell>
                        <TableCell>
                          <Chip label={s.results.overallScore} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                Run at least one scenario to begin comparison.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      <Box className="baseline-split">
        <Card>
          <CardContent>
            <Typography variant="h5">Baseline Building</Typography>
            <Typography color="text.secondary">
              No additional greenery · conventional operation
            </Typography>
            <Typography variant="h3" color="error" mt={2}>
              {
                runDigitalTwinSimulation(makeScenario("baseline"))
                  .averageIndoorTemperature
              }
              °C
            </Typography>
            <Typography>
              Higher heat risk ·{" "}
              {
                runDigitalTwinSimulation(makeScenario("baseline"))
                  .energyConsumption
              }{" "}
              kWh · comfort{" "}
              {runDigitalTwinSimulation(makeScenario("baseline")).comfortScore}
            </Typography>
          </CardContent>
        </Card>
        <Card className="intervention-building">
          <CardContent>
            <Typography variant="h5">Intervention Building</Typography>
            <Typography color="text.secondary">
              Selected vegetation · resource-aware smart controls
            </Typography>
            <Typography variant="h3" color="success.main" mt={2}>
              {results.averageIndoorTemperature}°C
            </Typography>
            <Typography>
              Updated heat zones · {results.energyConsumption} kWh · comfort{" "}
              {results.comfortScore}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Card id="how-it-works" sx={{ mt: 2.5 }}>
        <CardContent>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h5">How the Digital Twin Works</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {[
                "Sensors and surveys provide data about the real environment.",
                "The twin represents the building, plants, weather and technical systems.",
                "Agent-Based Modelling can later represent occupant and AI-agent behaviour.",
                "Scenario simulation changes variables and compares strategies.",
                "Selected strategies can be tested in a Living Lab.",
                "Experimental measurements can improve the twin.",
              ].map((x, i) => (
                <Stack direction="row" gap={1} mt={1} key={x}>
                  <Chip size="small" label={i + 1} />
                  <Typography>{x}</Typography>
                </Stack>
              ))}
              <Alert severity="warning" sx={{ mt: 2 }}>
                The digital twin does not collect data itself. Sensors, surveys
                and building systems collect evidence used to update the virtual
                model.
              </Alert>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
      <Box className="sensor-workflow">
        {[
          "Sensors",
          "Data Validation",
          "Twin Update",
          "Simulation",
          "Decision Support",
          "Physical Intervention",
          "New Measurements",
        ].map((x, i) => (
          <Box key={x}>
            <Chip label={x} />
            {i < 6 && <ArrowForward />}
          </Box>
        ))}
      </Box>
      <Card className="fund-twin">
        <CardContent>
          <Typography variant="h4">Why Fund a Digital Twin Pilot?</Typography>
          <Box className="fund-points">
            {[
              "Tests interventions before expensive construction",
              "Compares multiple cooling strategies",
              "Makes energy and water trade-offs visible",
              "Identifies high-risk building zones",
              "Supports stakeholder communication",
              "Creates testable Living-Lab hypotheses",
              "Builds a pathway to evidence-based deployment",
            ].map((x) => (
              <Typography key={x}>✓ {x}</Typography>
            ))}
          </Box>
          <blockquote>
            “The prototype demonstrates the decision process. Funding enables
            sensor installation, model calibration, scientific validation and
            real-building experimentation.”
          </blockquote>
        </CardContent>
      </Card>
      <Drawer
        anchor="bottom"
        open={!!selected}
        onClose={() => setSelected(null)}
        PaperProps={{
          sx: { borderRadius: "20px 20px 0 0", maxHeight: "75vh" },
        }}
      >
        <Box sx={{ p: 3, overflowY: "auto" }}>
          <IconButton
            sx={{ float: "right" }}
            onClick={() => setSelected(null)}
            aria-label="Close element details"
          >
            <Close />
          </IconButton>
          <Typography className="eyebrow">
            SELECTED DIGITAL TWIN ELEMENT
          </Typography>
          <Typography variant="h5">{selected?.name}</Typography>
          <Typography mt={2}>
            <b>Current condition:</b> {selected?.condition}
          </Typography>
          <Typography mt={1}>
            <b>Sensor reading:</b> {selected?.reading}
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            {selected?.assumption}
          </Alert>
        </Box>
      </Drawer>
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        fullScreen={mobile}
      >
        <DialogTitle>Add vegetation intervention</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Choose a feasible predefined placement. Estimates include water and
            maintenance demand.
          </Typography>
          <Box className="add-options">
            {[
              ["tree", "West-facing trees"],
              ["green-roof", "Green roof"],
              ["living-wall", "Living wall"],
              ["indoor-plant", "Indoor plants"],
              ["shaded-area", "Shaded pedestrian area"],
            ].map((x) => (
              <Button
                variant="outlined"
                key={x[0]}
                startIcon={<ParkOutlined />}
                onClick={() => add(x[0] as VegetationIntervention["type"])}
              >
                {x[1]}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
function Chart({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Box
          height={280}
          width="100%"
          role="img"
          aria-label={`${title}, illustrative prototype chart`}
        >
          <ResponsiveContainer>{children}</ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
