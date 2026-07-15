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
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  MobileStepper,
  Stack,
  Step,
  StepButton,
  Stepper,
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
  AccountTreeOutlined,
  ArrowForward,
  AutoAwesomeOutlined,
  CheckCircle,
  Close,
  ExpandMore,
  GroupsOutlined,
  ParkOutlined,
  ScienceOutlined,
  WarningAmber,
  WaterDropOutlined,
} from "@mui/icons-material";
import {
  Background,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./research.css";
import ConnectedMethodology from "./ConnectedMethodology";

type Method = {
  name: string;
  purpose: string;
  question: string;
  inputs: string[];
  activities: string[];
  outputs: string[];
  limitations: string;
  readiness: string;
};
type Strategy = {
  id: string;
  name: string;
  cost: number;
  water: number;
  cooling: number;
  energy: number;
  people: number;
  maintenance: number;
  equity: number;
  biodiversity: number;
};
type Phase = {
  name: string;
  duration: string;
  method: string;
  stakeholders: string;
  data: string;
  risk: string;
  output: string;
  readiness: string;
  activities: string[];
  deliverables: string[];
};
const layers = [
  {
    name: "Physical environment",
    color: "#2F9D70",
    items: [
      "Building",
      "Green roof",
      "Living wall",
      "Indoor plants",
      "Outdoor trees",
      "Soil and growing medium",
      "Weather conditions",
      "Occupants",
      "HVAC and ventilation",
      "Irrigation system",
    ],
  },
  {
    name: "Data collection",
    color: "#438AC9",
    items: [
      "Indoor temperature sensors",
      "Outdoor temperature sensors",
      "Humidity sensors",
      "Soil-moisture sensors",
      "Energy meters",
      "Water-flow sensors",
      "Plant-health sensors",
      "Occupancy sensors",
      "Weather data",
      "Occupant comfort feedback",
    ],
  },
  {
    name: "Research models",
    color: "#8C72E8",
    items: [
      "Building digital twin",
      "Plant and evapotranspiration model",
      "Microclimate model",
      "Agent-based occupant model",
      "Energy-consumption model",
      "Water-use model",
      "Heat-risk model",
    ],
  },
  {
    name: "AI and decision agents",
    color: "#E8923A",
    items: [
      "Heat Prediction Agent",
      "Occupant Comfort Agent",
      "Plant Cooling Agent",
      "Smart Irrigation Agent",
      "HVAC Control Agent",
      "Resource Optimisation Agent",
      "Safety and Constraint Agent",
      "Evaluation Agent",
    ],
  },
  {
    name: "Outputs and decisions",
    color: "#6952D5",
    items: [
      "Cooling strategy recommendations",
      "HVAC control decisions",
      "Irrigation schedules",
      "Plant-placement recommendations",
      "Occupant comfort forecasts",
      "Energy and water trade-offs",
      "Heat-risk reduction",
      "Funding and policy evidence",
      "Building retrofit recommendations",
    ],
  },
];
const methods: Method[] = [
  {
    name: "Digital Twin",
    purpose:
      "Simulate interactions between building, plants, weather, indoor conditions, energy and water.",
    question:
      "Which combined configurations offer robust cooling within resource limits?",
    inputs: [
      "Building geometry",
      "Materials and HVAC",
      "Plant type and leaf area",
      "Weather and occupancy",
      "Energy and water use",
    ],
    activities: [
      "Simulate indoor and outdoor temperatures",
      "Test plant placement",
      "Compare roofs, walls and indoor plants",
      "Estimate evapotranspiration",
      "Compare ventilation and HVAC",
    ],
    outputs: [
      "Virtual building representation",
      "Cooling estimates",
      "Energy and water forecasts",
      "Risk scenarios",
    ],
    limitations:
      "Model accuracy depends on calibration and locally measured plant performance.",
    readiness: "Simulation foundation",
  },
  {
    name: "Agent-Based Modelling",
    purpose:
      "Represent occupants, managers and AI controllers as autonomous decision-makers.",
    question: "How do comfort, fairness and automated control interact?",
    inputs: [
      "Occupant archetypes",
      "Comfort preferences",
      "Room schedules",
      "Control rules",
    ],
    activities: [
      "Model window, blind and thermostat choices",
      "Simulate discomfort reporting",
      "Test acceptance or rejection of AI advice",
      "Explore conflicting goals",
    ],
    outputs: [
      "Behaviour patterns",
      "Energy consequences",
      "Fairness findings",
      "Strategy robustness",
    ],
    limitations:
      "Human behaviour is diverse and cannot be fully represented by archetypes.",
    readiness: "Behavioural simulation",
  },
  {
    name: "Participatory Simulation and Game",
    purpose:
      "Let stakeholders decide under water, energy, space and funding constraints.",
    question: "Which trade-offs are legitimate, acceptable and implementable?",
    inputs: [
      "Resource limits",
      "Site options",
      "Stakeholder priorities",
      "Equity criteria",
    ],
    activities: [
      "Run decision games",
      "Compare intervention portfolios",
      "Discuss conflict points",
      "Co-design scenarios",
    ],
    outputs: [
      "Stakeholder priorities",
      "Accepted trade-offs",
      "Preferred strategies",
      "Policy recommendations",
    ],
    limitations:
      "Workshop outcomes depend on representation and facilitation quality.",
    readiness: "Stakeholder co-design",
  },
  {
    name: "Living-Lab Experiment",
    purpose: "Test the system in a real or controlled building environment.",
    question:
      "Do measured outcomes support the simulated cooling and resource estimates?",
    inputs: [
      "Baseline room",
      "Sensors",
      "Selected plant systems",
      "Control protocol",
    ],
    activities: [
      "Install sensors",
      "Establish baseline",
      "Run assisted strategies",
      "Collect comfort feedback",
      "Compare operation modes",
    ],
    outputs: [
      "Cooling evidence",
      "Energy and water measures",
      "Plant survival data",
      "Model validation",
    ],
    limitations:
      "Short pilots may not capture seasonal or long-term maintenance effects.",
    readiness: "Real-world validation",
  },
];
const phases: Phase[] = [
  "Problem and Site Definition",
  "Baseline Data Collection",
  "Digital Twin Development",
  "Agent-Based Modelling",
  "Participatory Co-Design",
  "Living-Lab Pilot",
  "Evaluation and Scaling",
].map((name, i) => ({
  name,
  duration: [
    "3 months",
    "6 months",
    "8 months",
    "6 months",
    "4 months",
    "12 months",
    "5 months",
  ][i],
  method: [
    "Scoping",
    "Field study",
    "Digital twin",
    "ABM",
    "Participatory research",
    "Experiment",
    "Evaluation",
  ][i],
  stakeholders: [
    "Municipality + occupants",
    "Engineers + occupants",
    "Modellers + engineers",
    "Behaviour researchers",
    "All stakeholder groups",
    "Facility team + researchers",
    "Partners + policymakers",
  ][i],
  data: [
    "Site and demographic",
    "Environmental and operational",
    "Geometry, plant, climate",
    "Behaviour and comfort",
    "Priorities and constraints",
    "Measured outcomes",
    "All validated datasets",
  ][i],
  risk: [
    "Scope ambiguity",
    "Missing data",
    "Calibration error",
    "Behaviour assumptions",
    "Unequal representation",
    "Site disruption",
    "Limited transferability",
  ][i],
  output: [
    "Research protocol",
    "Baseline dataset",
    "Validated baseline twin",
    "Agent interaction results",
    "Co-designed interventions",
    "Pilot evidence",
    "Replication toolkit",
  ][i],
  readiness: `TRL ${Math.min(2 + i, 7)}`,
  activities: [
    "Define research boundary",
    "Collect and validate inputs",
    "Review assumptions and constraints",
  ],
  deliverables: [
    "Phase evidence pack",
    "Decision gate report",
    "Updated risk register",
  ],
}));
const strategies: Strategy[] = [
  {
    id: "trees",
    name: "Plant street trees",
    cost: 90000,
    water: 900,
    cooling: 0.5,
    energy: 1,
    people: 240,
    maintenance: 1,
    equity: 8,
    biodiversity: 9,
  },
  {
    id: "indoor",
    name: "Add indoor plants",
    cost: 18000,
    water: 80,
    cooling: 0.1,
    energy: 0,
    people: 90,
    maintenance: 1,
    equity: 3,
    biodiversity: 3,
  },
  {
    id: "roof",
    name: "Install green roof",
    cost: 145000,
    water: 650,
    cooling: 0.6,
    energy: 5,
    people: 180,
    maintenance: 1,
    equity: 5,
    biodiversity: 8,
  },
  {
    id: "wall",
    name: "Install green wall",
    cost: 95000,
    water: 500,
    cooling: 0.3,
    energy: 2,
    people: 100,
    maintenance: 2,
    equity: 3,
    biodiversity: 6,
  },
  {
    id: "irrigation",
    name: "Add smart irrigation",
    cost: 32000,
    water: -500,
    cooling: 0.15,
    energy: 0,
    people: 100,
    maintenance: 1,
    equity: 2,
    biodiversity: 4,
  },
  {
    id: "rain",
    name: "Use rainwater harvesting",
    cost: 48000,
    water: -900,
    cooling: 0.1,
    energy: 0,
    people: 120,
    maintenance: 1,
    equity: 3,
    biodiversity: 5,
  },
  {
    id: "vent",
    name: "Improve natural ventilation",
    cost: 65000,
    water: 0,
    cooling: 0.4,
    energy: 7,
    people: 200,
    maintenance: 0,
    equity: 6,
    biodiversity: 0,
  },
  {
    id: "shade",
    name: "Install external shading",
    cost: 55000,
    water: 0,
    cooling: 0.5,
    energy: 5,
    people: 220,
    maintenance: 0,
    equity: 7,
    biodiversity: 0,
  },
  {
    id: "hvac",
    name: "Upgrade HVAC controls",
    cost: 80000,
    water: 0,
    cooling: 0.45,
    energy: 9,
    people: 300,
    maintenance: 1,
    equity: 4,
    biodiversity: 0,
  },
  {
    id: "occupancy",
    name: "Add occupancy sensors",
    cost: 24000,
    water: 0,
    cooling: 0.1,
    energy: 4,
    people: 300,
    maintenance: 0,
    equity: 2,
    biodiversity: 0,
  },
  {
    id: "public",
    name: "Create shaded public area",
    cost: 110000,
    water: 100,
    cooling: 0.5,
    energy: 0,
    people: 380,
    maintenance: 1,
    equity: 10,
    biodiversity: 3,
  },
  {
    id: "protect",
    name: "Protect vulnerable rooms first",
    cost: 35000,
    water: 0,
    cooling: 0.25,
    energy: 2,
    people: 80,
    maintenance: 0,
    equity: 12,
    biodiversity: 0,
  },
];

function FlowNode({
  data,
}: {
  data: { label: string; color: string; detail: string };
}) {
  return (
    <div className="research-node" style={{ borderColor: data.color }}>
      <Handle type="target" position={Position.Left} />
      <span style={{ background: data.color }} />
      <b>{data.label}</b>
      <small>{data.detail}</small>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
const nodeTypes = { research: FlowNode };
function SectionTitle({
  kicker,
  title,
  desc,
}: {
  kicker: string;
  title: string;
  desc?: string;
}) {
  return (
    <Box className="research-title">
      <Typography className="eyebrow">{kicker}</Typography>
      <Typography variant="h4">{title}</Typography>
      {desc && <Typography color="text.secondary">{desc}</Typography>}
    </Box>
  );
}
function Tag() {
  return (
    <Chip
      size="small"
      label="Proposed research design"
      color="primary"
      variant="outlined"
    />
  );
}

export default function ResearchBlueprint() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selected, setSelected] = useState<{
    label: string;
    detail: string;
  } | null>(null);
  const [phase, setPhase] = useState(0);
  const [chosen, setChosen] = useState<string[]>([]);
  const nodes = useMemo<Node[]>(
    () =>
      layers.map((l, i) => ({
        id: `l${i}`,
        type: "research",
        position: { x: i * 285, y: 60 + (i % 2) * 125 },
        data: {
          label: l.name,
          color: l.color,
          detail: l.items.slice(0, 3).join(" · "),
        },
      })),
    [],
  );
  const edges = useMemo<Edge[]>(
    () =>
      layers.slice(0, -1).map((_, i) => ({
        id: `e${i}`,
        source: `l${i}`,
        target: `l${i + 1}`,
        animated: true,
        style: { stroke: "#8170D2", strokeWidth: 2 },
      })),
    [],
  );
  const totals = chosen
    .map((id) => strategies.find((s) => s.id === id)!)
    .reduce(
      (a, s) => ({
        cost: a.cost + s.cost,
        water: a.water + s.water,
        cooling: a.cooling + s.cooling,
        energy: a.energy + s.energy,
        people: a.people + s.people,
        maintenance: a.maintenance + s.maintenance,
        equity: a.equity + s.equity,
      }),
      {
        cost: 0,
        water: 0,
        cooling: 0,
        energy: 0,
        people: 0,
        maintenance: 0,
        equity: 0,
      },
    );
  const overBudget = totals.cost > 500000,
    overWater = totals.water > 5000,
    overCare = totals.maintenance > 4;
  return (
    <Box className="research-page">
      <Box className="research-hero">
        <Chip label="Funding-ready research pathway" />
        <Typography variant="h2">
          From Digital Simulation to Real-World Urban Cooling
        </Typography>
        <Typography variant="h6">
          A research blueprint combining digital twins, agent-based modelling,
          participatory simulation and living-lab experimentation.
        </Typography>
        <Typography>
          AI FOR ECOURBANISM will be developed through a staged programme
          connecting environmental sensing, plant physiology, occupant
          behaviour, AI control, stakeholder decisions and real-world building
          performance.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
          <Button variant="contained" href="#blueprint">
            Explore Research Blueprint
          </Button>
          <Button variant="outlined" href="#outcomes">
            View Expected Outcomes
          </Button>
        </Stack>
        <small>
          Prototype methodology — final experimental design requires ethics,
          technical and domain-expert approval.
        </small>
      </Box>
      <Box className="section-nav">
        {[
          ["Blueprint", "#blueprint"],
          ["Methods", "#methods"],
          ["Phases", "#phases"],
          ["Data", "#data"],
          ["Challenge", "#game"],
          ["Living lab", "#experiment"],
          ["Funding", "#funding"],
          ["Risks", "#risks"],
        ].map((x) => (
          <Button size="small" href={x[1]} key={x[0]}>
            {x[0]}
          </Button>
        ))}
      </Box>
      <section id="blueprint">
        <SectionTitle
          kicker="01 · SYSTEM ARCHITECTURE"
          title="Interactive research blueprint"
          desc="Trace evidence from physical systems through sensing, modelling and controlled decisions."
        />
        <Tag />
        {desktop ? (
          <Card className="flow-card">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              onNodeClick={(_, n) =>
                setSelected(n.data as { label: string; detail: string })
              }
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </Card>
        ) : (
          <Box className="mobile-layers">
            {layers.map((l, i) => (
              <Box key={l.name}>
                <Card
                  onClick={() =>
                    setSelected({ label: l.name, detail: l.items.join(" · ") })
                  }
                >
                  <CardContent>
                    <Stack direction="row" gap={1.5} alignItems="center">
                      <span style={{ background: l.color }} />
                      <Box>
                        <Typography fontWeight={750}>{l.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {l.items.slice(0, 3).join(" · ")} + more
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
                {i < layers.length - 1 && <ArrowForward />}
              </Box>
            ))}
          </Box>
        )}
        <Box className="legend">
          {layers.map((l) => (
            <span key={l.name}>
              <i style={{ background: l.color }} />
              {l.name}
            </span>
          ))}
        </Box>
        <Drawer
          anchor={mobile ? "bottom" : "right"}
          open={!!selected}
          onClose={() => setSelected(null)}
          PaperProps={{
            sx: {
              width: mobile ? "100%" : 360,
              maxHeight: "80vh",
              p: 3,
              borderRadius: mobile ? "20px 20px 0 0" : 0,
            },
          }}
        >
          <IconButton
            aria-label="Close node details"
            onClick={() => setSelected(null)}
            sx={{ alignSelf: "flex-end" }}
          >
            <Close />
          </IconButton>
          <Typography variant="h5">{selected?.label}</Typography>
          <Typography color="text.secondary" mt={1}>
            {selected?.detail}
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Inputs and outputs are proposed and require validation during the
            research programme.
          </Alert>
        </Drawer>
      </section>

      <ConnectedMethodology />

      <section id="phases">
        <SectionTitle
          kicker="03 · DELIVERY PATHWAY"
          title="Seven provisional research phases"
          desc="Illustrative durations; each phase closes with an evidence-based decision gate."
        />
        {desktop ? (
          <Stepper activeStep={phase} alternativeLabel>
            {phases.map((p, i) => (
              <Step key={p.name}>
                <StepButton onClick={() => setPhase(i)}>{p.name}</StepButton>
              </Step>
            ))}
          </Stepper>
        ) : (
          <MobileStepper
            variant="progress"
            steps={7}
            position="static"
            activeStep={phase}
            nextButton={
              <Button onClick={() => setPhase((x) => Math.min(6, x + 1))}>
                Next
              </Button>
            }
            backButton={
              <Button onClick={() => setPhase((x) => Math.max(0, x - 1))}>
                Back
              </Button>
            }
          />
        )}
        <Card className="phase-detail">
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              gap={1}
            >
              <Box>
                <Typography className="eyebrow">
                  PHASE {phase + 1} · {phases[phase].duration} PROVISIONAL
                </Typography>
                <Typography variant="h5">{phases[phase].name}</Typography>
              </Box>
              <Chip label={phases[phase].readiness} />
            </Stack>
            <Box className="phase-grid">
              {[
                ["Method", phases[phase].method],
                ["Responsible", phases[phase].stakeholders],
                ["Required data", phases[phase].data],
                ["Main risk", phases[phase].risk],
                ["Expected output", phases[phase].output],
              ].map((x) => (
                <Box key={x[0]}>
                  <small>{x[0]}</small>
                  <b>{x[1]}</b>
                </Box>
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography>
              <b>Activities:</b> {phases[phase].activities.join(" · ")}
            </Typography>
            <Typography>
              <b>Deliverables:</b> {phases[phase].deliverables.join(" · ")}
            </Typography>
          </CardContent>
        </Card>
      </section>

      <section id="data">
        <SectionTitle
          kicker="04 · DATA ARCHITECTURE"
          title="Available evidence and critical gaps"
        />
        <Box className="data-grid">
          {[
            [
              "High availability",
              [
                "Indoor/outdoor temperature",
                "Humidity and weather",
                "Energy consumption",
                "Building geometry",
                "HVAC operations",
                "Satellite imagery",
              ],
            ],
            [
              "Requires local sensing",
              [
                "Soil moisture",
                "Irrigation and water flow",
                "Plant health and leaf temperature",
                "CO₂ and occupancy",
                "Window and blind state",
              ],
            ],
            [
              "Current evidence gap",
              [
                "Indoor evapotranspiration",
                "Plant health–cooling interaction",
                "Individual comfort behaviour",
                "Long-term maintenance",
                "Combined plant–building–occupant data",
              ],
            ],
          ].map((x, i) => (
            <Card key={x[0] as string}>
              <CardContent>
                <Chip
                  label={x[0] as string}
                  color={i === 0 ? "success" : i === 1 ? "warning" : "error"}
                />
                {(x[1] as string[]).map((y) => (
                  <Typography mt={1} key={y}>
                    • {y}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          ))}
        </Box>
        <Box className="pipeline">
          {[
            "Weather + building + plant + occupant + resources",
            "Data validation",
            "Digital twin",
            "ABM",
            "AI control",
            "Experimental results",
            "Research evidence",
          ].map((x, i) => (
            <Box key={x}>
              <span>{x}</span>
              {i < 6 && <ArrowForward />}
            </Box>
          ))}
        </Box>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "Data source",
                  "Example variables",
                  "Method",
                  "Availability",
                  "Privacy",
                  "Cost",
                  "Research value",
                ].map((x) => (
                  <TableCell key={x}>{x}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                [
                  "Building management",
                  "Temperature, HVAC",
                  "Secure export",
                  "High",
                  "Low",
                  "Low",
                  "High",
                ],
                [
                  "Occupant study",
                  "Comfort, behaviour",
                  "Consent-based survey",
                  "Medium",
                  "High",
                  "Medium",
                  "High",
                ],
                [
                  "Plant sensors",
                  "Moisture, leaf health",
                  "Local sensing",
                  "Low",
                  "Low",
                  "Medium",
                  "High",
                ],
                [
                  "Weather service",
                  "Radiation, wind",
                  "Open dataset",
                  "High",
                  "Low",
                  "Low",
                  "Medium",
                ],
              ].map((r) => (
                <TableRow key={r[0]}>
                  {r.map((x) => (
                    <TableCell key={x}>{x}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

      <section id="game">
        <SectionTitle
          kicker="05 · PARTICIPATORY SIMULATION"
          title="Urban Cooling Challenge"
          desc="Act as a planner: build a portfolio within budget, water and maintenance limits."
        />
        <Alert severity="info">
          Illustrative research-game assumptions · No scientific outcomes
          claimed.
        </Alert>
        <Box className="game-layout">
          <Card>
            <CardContent>
              <Typography variant="h6">Available strategies</Typography>
              <Box className="strategy-list">
                {strategies.map((s) => (
                  <Button
                    key={s.id}
                    variant={chosen.includes(s.id) ? "contained" : "outlined"}
                    color={chosen.includes(s.id) ? "primary" : "inherit"}
                    onClick={() =>
                      setChosen((v) =>
                        v.includes(s.id)
                          ? v.filter((x) => x !== s.id)
                          : [...v, s.id],
                      )
                    }
                  >
                    <span>
                      {s.name}
                      <small>
                        €{(s.cost / 1000).toFixed(0)}k ·{" "}
                        {s.water <= 0 ? "saves " : ""}
                        {Math.abs(s.water)} m³ · {s.cooling}°C
                      </small>
                    </span>
                    <CheckCircle />
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
          <Box>
            <Box className="game-kpis">
              {[
                [
                  "Budget remaining",
                  `€${Math.max(0, 500000 - totals.cost).toLocaleString()}`,
                ],
                [
                  "Water remaining",
                  `${Math.max(0, 5000 - totals.water).toLocaleString()} m³`,
                ],
                ["Cooling estimate", `−${totals.cooling.toFixed(1)}°C`],
                ["Energy savings", `${totals.energy}%`],
                ["People benefiting", totals.people.toLocaleString()],
                ["Equity score", `${Math.min(100, totals.equity)}/100`],
                ["Maintenance burden", `${totals.maintenance}/4 FTE`],
                [
                  "Plant survival",
                  `${Math.max(55, 92 - totals.water / 250).toFixed(0)}%`,
                ],
              ].map((x) => (
                <Card key={x[0]}>
                  <CardContent>
                    <small>{x[0]}</small>
                    <Typography variant="h6">{x[1]}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
            {(overBudget || overWater || overCare) && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {[
                  overBudget && "Budget exceeded",
                  overWater && "Water budget exceeded",
                  overCare && "Maintenance capacity exceeded",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Alert>
            )}
            <Card sx={{ mt: 2, background: "#F1EEFF" }}>
              <CardContent>
                <Chip
                  icon={<AutoAwesomeOutlined />}
                  label="SIMULATED AI ASSESSMENT"
                />
                <Typography mt={2}>
                  <b>Best decision:</b>{" "}
                  {chosen.includes("protect")
                    ? "Vulnerable rooms explicitly prioritised."
                    : "Resource-diverse portfolio."}
                </Typography>
                <Typography>
                  <b>Main weakness:</b>{" "}
                  {totals.equity < 20
                    ? "Vulnerable occupants insufficiently protected."
                    : "Long-term maintenance evidence is limited."}
                </Typography>
                <Typography>
                  <b>Resource conflict:</b> Cooling versus water and maintenance
                  capacity.
                </Typography>
                <Typography>
                  <b>Suggested improvement:</b> Add rainwater harvesting and
                  protect vulnerable rooms first.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </section>

      <section id="experiment">
        <SectionTitle
          kicker="06 · LIVING-LAB DESIGN"
          title="Controlled comparison, then real-world validation"
        />
        <Alert severity="warning">
          Example experimental configuration — no real results claimed.
        </Alert>
        <Box className="zone-grid">
          {[
            [
              "Zone A · Baseline",
              [
                "Conventional HVAC",
                "No AI control",
                "Existing plants",
                "Standard irrigation",
                "Normal occupant behaviour",
              ],
            ],
            [
              "Zone B · Intervention",
              [
                "AI-assisted HVAC",
                "Smart irrigation",
                "Selected plant configuration",
                "Comfort feedback",
                "Automated shade or ventilation",
                "Plant and soil monitoring",
              ],
            ],
          ].map((z, i) => (
            <Card key={z[0] as string} className={i ? "intervention-zone" : ""}>
              <CardContent>
                <Typography variant="h5">{z[0] as string}</Typography>
                {(z[1] as string[]).map((x) => (
                  <Typography mt={1} key={x}>
                    • {x}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          ))}
        </Box>
        <Box className="variable-grid">
          {[
            [
              "Independent variables",
              "Plant quantity/species/placement",
              "Irrigation timing",
              "HVAC, ventilation and shade strategy",
            ],
            [
              "Dependent variables",
              "Temperature and humidity",
              "Energy and water",
              "Comfort and plant health",
              "Cooling duration",
            ],
            [
              "Control variables",
              "Room size and orientation",
              "Occupancy and equipment load",
              "Measurement period and weather",
            ],
          ].map((x) => (
            <Card key={x[0]}>
              <CardContent>
                <Typography variant="h6">{x[0]}</Typography>
                {x.slice(1).map((y) => (
                  <Typography key={y}>• {y}</Typography>
                ))}
              </CardContent>
            </Card>
          ))}
        </Box>
        <Card>
          <CardContent>
            <Typography variant="h6">
              Illustrative experiment comparison
            </Typography>
            <Box height={300}>
              <ResponsiveContainer>
                <BarChart
                  data={[
                    {
                      name: "Baseline",
                      cooling: 0,
                      energy: 100,
                      water: 10,
                      comfort: 62,
                    },
                    {
                      name: "Plant only",
                      cooling: 28,
                      energy: 94,
                      water: 65,
                      comfort: 72,
                    },
                    {
                      name: "AI only",
                      cooling: 35,
                      energy: 82,
                      water: 10,
                      comfort: 78,
                    },
                    {
                      name: "Combined",
                      cooling: 52,
                      energy: 74,
                      water: 48,
                      comfort: 86,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cooling" fill="#6952D5" />
                  <Bar dataKey="energy" fill="#E8923A" />
                  <Bar dataKey="water" fill="#438AC9" />
                  <Bar dataKey="comfort" fill="#2F9D70" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </section>

      <section>
        <SectionTitle
          kicker="07–08 · PARTICIPATION & CONTROL"
          title="Humans retain authority in a controlled multi-agent system"
        />
        <Box className="two-col">
          <Card>
            <CardContent>
              <Typography variant="h5">Participation cycle</Typography>
              <Box className="participation-cycle">
                {[
                  "Stakeholder input",
                  "Scenario design",
                  "Simulation",
                  "Review",
                  "Living-lab test",
                  "Feedback",
                  "Improved system",
                ].map((x) => (
                  <Chip key={x} label={x} />
                ))}
              </Box>
              <Typography color="text.secondary" mt={2}>
                Occupants, facility managers, designers, plant scientists,
                engineers, municipalities, health experts, developers,
                researchers, community representatives, policymakers and funders
                participate through workshops, feedback tools, interviews, focus
                groups, reviews and living labs.
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h5">AI agent responsibilities</Typography>
              {[
                "Heat Prediction → overheating forecast",
                "Occupant Comfort → comfort-risk estimate",
                "Plant Cooling → cooling-potential estimate",
                "Smart Irrigation → irrigation schedule",
                "HVAC Control → control recommendation",
                "Resource Optimisation → portfolio",
                "Safety & Constraint → limits and approvals",
                "Evaluation → drift and outcome review",
              ].map((x) => (
                <Typography mt={1} key={x}>
                  • {x}
                </Typography>
              ))}
              <Alert severity="warning" sx={{ mt: 2 }}>
                AI provides decision support. Facility managers and researchers
                retain authority over physical system changes.
              </Alert>
            </CardContent>
          </Card>
        </Box>
      </section>

      <section id="funding">
        <SectionTitle
          kicker="09 · FUNDING CASE"
          title="Why This Project Merits Funding"
        />
        <Box className="fund-grid">
          {[
            [
              "Addresses a growing climate challenge",
              "Connects heat, health, buildings and vulnerable populations.",
            ],
            [
              "Reduces energy-intensive cooling dependence",
              "Tests vegetation and AI as complements—not replacements—for HVAC.",
            ],
            [
              "Integrates fragmented research",
              "Links plant physiology, buildings, microclimate, behaviour and control.",
            ],
            [
              "Produces measurable evidence",
              "Measures temperature, energy, water, comfort, plant health, cost and equity.",
            ],
            [
              "Supports replication",
              "Delivers models, protocols, sensor framework, game and policy guidance.",
            ],
            [
              "Creates scalable value",
              "Supports cities, universities, housing, health, offices, schools and care.",
            ],
          ].map((x, i) => (
            <Card key={x[0]}>
              <CardContent>
                <span className="fund-number">0{i + 1}</span>
                <Typography variant="h6">{x[0]}</Typography>
                <Typography color="text.secondary">{x[1]}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
        <blockquote>
          “Funding will not support only a website. It will support an
          evidence-generating research infrastructure that connects simulation,
          stakeholder co-design, physical experimentation and scalable
          climate-adaptation decision support.”
        </blockquote>
      </section>

      <section id="outcomes">
        <SectionTitle
          kicker="10–11 · OUTPUTS & SUCCESS"
          title="Measurable programme value"
        />
        <Box className="output-grid">
          {[
            [
              "Scientific outputs",
              "Integrated framework",
              "Digital twin and ABM",
              "Experimental dataset",
              "Validated findings",
            ],
            [
              "Technical outputs",
              "AI FOR ECOURBANISM prototype",
              "Sensor framework",
              "Multi-agent control design",
              "Optimisation engine",
            ],
            [
              "Participatory outputs",
              "Simulation game",
              "Workshop toolkit",
              "Comfort interface",
              "Priority report",
            ],
            [
              "Policy & funding outputs",
              "Cost-benefit framework",
              "Retrofit guidance",
              "Replication roadmap",
              "Funding impact report",
            ],
          ].map((x) => (
            <Card key={x[0]}>
              <CardContent>
                <Typography variant="h6">{x[0]}</Typography>
                {x.slice(1).map((y) => (
                  <Typography key={y}>• {y}</Typography>
                ))}
              </CardContent>
            </Card>
          ))}
        </Box>
        <Typography variant="h5" mt={3}>
          Proposed project targets
        </Typography>
        <Box className="target-grid">
          {[
            ["Digital-twin accuracy", 82],
            ["Data completeness", 88],
            ["Occupant acceptance", 75],
            ["Plant survival", 90],
            ["Energy-saving target", 70],
            ["Pilot readiness", 65],
          ].map((x) => (
            <Card key={x[0] as string}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <b>{x[0] as string}</b>
                  <b>{x[1]}%</b>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={x[1] as number}
                  sx={{ mt: 2 }}
                />
                <small>Proposed project target · requires validation</small>
              </CardContent>
            </Card>
          ))}
        </Box>
      </section>

      <section id="risks">
        <SectionTitle
          kicker="12 · RESPONSIBLE DELIVERY"
          title="Risk register and mitigation"
        />
        <Box className="risk-cards">
          {[
            [
              "Insufficient integrated data",
              "High",
              "Begin with simulation; improve through measurements",
            ],
            [
              "Plant cooling lower than expected",
              "High",
              "Compare configurations; combine passive cooling",
            ],
            [
              "Excessive water demand",
              "High",
              "Smart irrigation, drought tolerance and harvesting",
            ],
            [
              "Occupants reject automation",
              "Medium",
              "Feedback, override and participatory design",
            ],
            ["Sensor failure", "Medium", "Redundancy and validation rules"],
            [
              "Digital twin inaccurate",
              "High",
              "Calibrate against baseline and experiments",
            ],
            [
              "Unsafe AI recommendations",
              "High",
              "Constraint agents, approval and fallbacks",
            ],
            [
              "Pilot site unavailable",
              "High",
              "Use a controlled experimental room",
            ],
            [
              "Privacy concerns",
              "Medium",
              "Minimise and anonymise personal data",
            ],
            [
              "High maintenance burden",
              "Medium",
              "Optimise against maintenance capacity",
            ],
          ].map((r) => (
            <Card key={r[0]}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <b>{r[0]}</b>
                  <Chip
                    size="small"
                    label={r[1]}
                    color={r[1] === "High" ? "error" : "warning"}
                  />
                </Stack>
                <Typography color="text.secondary" mt={1}>
                  {r[2]}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </section>

      <section>
        <SectionTitle
          kicker="13 · INVESTMENT PATHWAY"
          title="Four-stage funding roadmap"
        />
        <Box className="fund-roadmap">
          {[
            [
              "Concept & Simulation",
              "Digital twin, ABM, prototype and workshops",
              "Gate: credible baseline and research protocol",
            ],
            [
              "Sensor & Experimental Prototype",
              "Sensors, plant systems and controlled-room test",
              "Gate: safe, measurable prototype",
            ],
            [
              "Living-Lab Pilot",
              "Real building, recruitment and monitoring",
              "Gate: validated benefit and acceptance",
            ],
            [
              "Scaling & Replication",
              "Multi-site partners and policy integration",
              "Gate: transferable, affordable model",
            ],
          ].map((x, i) => (
            <Card key={x[0]}>
              <CardContent>
                <AvatarNumber n={i + 1} />
                <Typography variant="h6" mt={2}>
                  {x[0]}
                </Typography>
                <Typography>{x[1]}</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography color="text.secondary">{x[2]}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </section>
      <Button className="funding-sticky" variant="contained" href="#funding">
        View Funding Case
      </Button>
    </Box>
  );
}
function AvatarNumber({ n }: { n: number }) {
  return <Box className="avatar-number">{n}</Box>;
}
