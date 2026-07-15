import { useState } from "react";
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
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowDownward,
  ArrowForward,
  Autorenew,
  CheckCircle,
  Close,
  ExpandMore,
  ScienceOutlined,
  WarningAmber,
} from "@mui/icons-material";
import "./methodology.css";

interface ResearchStage {
  number: number;
  name: string;
  purpose: string;
  input: string;
  output: string;
  question: string;
  uncertainty: string;
  connector: string;
  inputs: string[];
  processes: string[];
  outputs: string[];
  validation: string;
  failure: string;
}
interface Gate {
  name: string;
  question: string;
  fallbacks: string[];
}
const stages: ResearchStage[] = [
  {
    number: 1,
    name: "Data Collection",
    purpose:
      "Collect real-world evidence about the environment, building, vegetation, resources and human behaviour.",
    input: "Site, sensors, surveys and observations",
    output: "Baseline environmental, building, plant and behaviour datasets",
    question:
      "What are the actual environmental, operational and behavioural conditions of the selected site?",
    uncertainty: "Data and baseline uncertainty",
    connector: "Measured conditions and stakeholder observations",
    inputs: [
      "Indoor/outdoor temperature, humidity, solar exposure and wind",
      "Energy, water, soil moisture and plant health",
      "Occupancy, windows, thermostats and comfort preferences",
      "Facility interviews, maintenance surveys and stakeholder workshops",
    ],
    processes: [
      "Install and quality-check sensors",
      "Run comfort surveys and interviews",
      "Observe behaviour and maintenance",
      "Document resources and stakeholder requirements",
    ],
    outputs: [
      "Baseline environmental dataset",
      "Building- and plant-performance datasets",
      "Occupant-behaviour dataset",
      "Resource availability and stakeholder requirements",
    ],
    validation:
      "Completeness, accuracy, frequency, consent and baseline coverage are sufficient.",
    failure:
      "Without Data Collection, models rely on unsupported assumptions and generic data.",
  },
  {
    number: 2,
    name: "Digital Twin",
    purpose:
      "Create a virtual representation of the physical building, vegetation, microclimate and technical systems.",
    input: "Collected measurements, geometry and system information",
    output: "Virtual environment and physical system states",
    question:
      "How does the physical building and plant system behave under existing conditions?",
    uncertainty: "Physical and environmental uncertainty",
    connector: "Virtual representation of the real environment",
    inputs: [
      "Building geometry, materials and room layout",
      "HVAC, ventilation and irrigation configuration",
      "Plant locations and characteristics",
      "Weather, temperature, energy, water and occupancy data",
    ],
    processes: [
      "Reproduce baseline conditions and heat transfer",
      "Model radiation, shade and ventilation",
      "Estimate evapotranspiration and irrigation",
      "Represent room- and building-level microclimates",
    ],
    outputs: [
      "Virtual building environment",
      "Simulated temperature and plant-cooling potential",
      "Energy and water conditions",
      "Spatial constraints and system states",
    ],
    validation:
      "The model reproduces measured baseline conditions within an agreed error range.",
    failure:
      "Without the Digital Twin, there is no realistic representation of the building, microclimate or plant systems.",
  },
  {
    number: 3,
    name: "Agent-Based Modelling",
    purpose:
      "Represent autonomous human, plant, management, technical and AI agents interacting inside the Digital Twin.",
    input: "Virtual environment, observations and behaviour assumptions",
    output: "Interaction rules, behaviours, conflicts and consequences",
    question:
      "How do occupants, plants, technical systems and AI agents influence one another?",
    uncertainty: "Behavioural, interaction and operational uncertainty",
    connector: "Agent behaviours, interactions and decision rules",
    inputs: [
      "Occupant archetypes and comfort preferences",
      "Facility-manager and maintenance decisions",
      "Plant, soil and vegetation responses",
      "HVAC, irrigation, comfort, prediction, optimisation and safety agents",
    ],
    processes: [
      "Model window, thermostat and blind decisions",
      "Represent plant response to light, heat and moisture",
      "Model manager approval and manual override",
      "Balance comfort, energy, water and maintenance",
    ],
    outputs: [
      "Occupant and plant response patterns",
      "AI-control decisions and behavioural assumptions",
      "Comfort and resource conflicts",
      "Energy and water consequences",
    ],
    validation:
      "Agent behaviour is plausible against observations, surveys and expert knowledge.",
    failure:
      "Without ABM, human behaviour, plant responses and AI-agent interactions are ignored.",
  },
  {
    number: 4,
    name: "Scenario Simulation",
    purpose:
      "Test the combined Digital Twin and ABM by changing variables and comparing cooling strategies.",
    input: "Physical model plus agent behaviours and constraints",
    output: "Prioritised strategies and experimental hypotheses",
    question:
      "Which combination of plants, AI control, HVAC, ventilation and resources performs best under different conditions?",
    uncertainty: "Scenario, design and strategy uncertainty",
    connector: "Prioritised strategies and experimental hypotheses",
    inputs: [
      "Plant quantity, species, placement, roofs and walls",
      "Water, HVAC, windows, shade and occupancy",
      "Weather and heatwave severity",
      "Energy, water, budget, maintenance and comfort limits",
    ],
    processes: [
      "Compare baseline and plant-based strategies",
      "Test AI-control and integrated strategies",
      "Stress-test resource-constrained heatwaves",
      "Compare temperature, comfort, cost, equity and resilience",
    ],
    outputs: [
      "Best- and high-risk scenarios",
      "Selected intervention package",
      "Experimental variables and expected outcomes",
      "Sensors, success criteria and safety constraints",
    ],
    validation:
      "The selected scenario is feasible, safe, equitable and worth limited physical testing.",
    failure:
      "Without Scenario Simulation, alternatives cannot be compared safely and inexpensively before investment.",
  },
  {
    number: 5,
    name: "Living-Lab Experiment",
    purpose:
      "Test the selected strategy safely in a real environment at limited scale.",
    input: "Prioritised intervention and experimental protocol",
    output: "Empirical measurements and implementation evidence",
    question:
      "Does the selected strategy work safely, efficiently and acceptably in a real building?",
    uncertainty: "Real-world performance and implementation uncertainty",
    connector: "Empirical measurements and real-world evidence",
    inputs: [
      "One classroom, office, test room, library room or chamber",
      "Baseline, plant-only, AI-only and combined conditions",
      "Required sensors, safety limits and consent process",
    ],
    processes: [
      "Establish baseline and controlled conditions",
      "Measure temperature, energy, water and plant health",
      "Gather comfort, acceptance and override data",
      "Compare predicted and measured outcomes",
    ],
    outputs: [
      "Real-world and model-validation data",
      "Plant survival, energy and water evidence",
      "Comfort and acceptance findings",
      "Failures, unexpected interactions and lessons",
    ],
    validation:
      "Measured cooling, comfort, water, energy and safety outcomes justify learning—not universal claims.",
    failure:
      "Without a Living Lab, the work remains theoretical and provides no real-world performance evidence.",
  },
  {
    number: 6,
    name: "Repeat Data Collection",
    purpose:
      "Measure experimental outcomes and use prediction errors to improve models and strategies.",
    input: "New measurements, feedback, failures and overrides",
    output: "Calibrated Digital Twin and ABM with revised strategies",
    question:
      "How should models improve using differences between simulated and real-world performance?",
    uncertainty: "Model validity and learning uncertainty",
    connector: "Updated data, calibrated models and improved strategies",
    inputs: [
      "Temperature, humidity, energy, water and soil moisture",
      "Plant health, occupancy and comfort feedback",
      "Maintenance feedback, failures and overrides",
      "Stakeholder observations",
    ],
    processes: [
      "Compare predicted and measured outcomes",
      "Update thermal, ventilation, plant, energy and water parameters",
      "Revise occupant, manager, plant and AI-agent rules",
      "Design a revised scenario and next validation cycle",
    ],
    outputs: [
      "Improved Digital Twin and ABM",
      "More accurate scenarios and revised intervention",
      "New hypotheses and scaling evidence",
    ],
    validation:
      "Prediction errors are explained, changes are documented, and evidence supports another cycle or cautious scaling.",
    failure:
      "Without repeated data collection, prediction errors cannot calibrate models or improve future decisions.",
  },
];
const gates: Gate[] = [
  {
    name: "Gate 1 · Data readiness",
    question:
      "Is the data sufficient and reliable enough to build a baseline model?",
    fallbacks: [
      "Add sensors",
      "Improve surveys",
      "Extend collection",
      "Correct quality problems",
    ],
  },
  {
    name: "Gate 2 · Digital Twin accuracy",
    question:
      "Does the twin reproduce measured baseline conditions accurately enough?",
    fallbacks: [
      "Recalibrate parameters",
      "Improve plant models",
      "Review sensors",
      "Update boundaries",
    ],
  },
  {
    name: "Gate 3 · Agent plausibility",
    question:
      "Are agent behaviours supported by observations, surveys or expertise?",
    fallbacks: [
      "Revise rules",
      "Conduct interviews",
      "Add agent types",
      "Improve assumptions",
    ],
  },
  {
    name: "Gate 4 · Scenario suitability",
    question:
      "Is the selected scenario feasible, safe and worth physical testing?",
    fallbacks: [
      "Modify variables",
      "Reduce resource demand",
      "Improve safety",
      "Simulate again",
    ],
  },
  {
    name: "Gate 5 · Living-Lab performance",
    question:
      "Does the intervention meet expected cooling, comfort, water and energy outcomes?",
    fallbacks: [
      "Identify errors",
      "Collect evidence",
      "Recalibrate models",
      "Revise scenario",
    ],
  },
  {
    name: "Gate 6 · Scaling readiness",
    question:
      "Is evidence strong enough for a larger building or additional site?",
    fallbacks: [
      "Repeat cycle",
      "Improve intervention",
      "Extend experiment",
      "Resolve risks",
    ],
  },
];
const evidence = [
  "Observed evidence",
  "Modelled physical evidence",
  "Behavioural & interaction evidence",
  "Comparative scenario evidence",
  "Experimental evidence",
  "Calibrated & transferable knowledge",
];

export default function ConnectedMethodology() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const tablet = useMediaQuery(theme.breakpoints.down("md"));
  const [selected, setSelected] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const stage = stages[selected];
  const select = (i: number) => {
    setSelected(i);
    if (tablet) setDetailOpen(true);
  };
  const detail = (
    <Box className="stage-detail">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box>
          <Typography className="eyebrow">
            STAGE {stage.number} · {stage.uncertainty}
          </Typography>
          <Typography variant="h5">{stage.name}</Typography>
        </Box>
        {tablet && (
          <IconButton
            aria-label="Close stage details"
            onClick={() => setDetailOpen(false)}
          >
            <Close />
          </IconButton>
        )}
      </Stack>
      <Typography color="text.secondary" mt={1}>
        {stage.purpose}
      </Typography>
      <Alert severity="info" sx={{ my: 2 }}>
        <b>Research question:</b> {stage.question}
      </Alert>
      {[
        ["Inputs", stage.inputs],
        ["Processes", stage.processes],
        ["Outputs", stage.outputs],
      ].map(([title, items]) => (
        <Accordion
          key={title as string}
          defaultExpanded={title === "Outputs"}
          disableGutters
          elevation={0}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <b>{title as string}</b>
          </AccordionSummary>
          <AccordionDetails>
            {(items as string[]).map((x) => (
              <Typography variant="body2" key={x}>
                • {x}
              </Typography>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
      <Box className="validation-box">
        <CheckCircle color="success" />
        <span>
          <b>Validation criterion</b>
          {stage.validation}
        </span>
      </Box>
      <Box className="failure-box">
        <WarningAmber color="warning" />
        <span>
          <b>If this stage were removed</b>
          {stage.failure}
        </span>
      </Box>
    </Box>
  );
  return (
    <section id="methods" className="connected-methodology">
      <Box className="research-title">
        <Typography className="eyebrow">
          02 · CONNECTED RESEARCH METHODOLOGY
        </Typography>
        <Typography variant="h4">
          Connected Research and Validation Cycle
        </Typography>
        <Typography color="text.secondary">
          From real-world observations to simulation, experimentation and
          continuous model improvement
        </Typography>
      </Box>
      <Typography className="method-intro">
        The methodology begins with environmental, building, plant and
        human-behaviour evidence. It constructs a Digital Twin, adds interacting
        agents, tests alternative strategies, validates the strongest option in
        a small Living Lab, then uses new measurements and stakeholder feedback
        to recalibrate the models and begin the next cycle.
      </Typography>
      <Alert severity="info" icon={<Autorenew />} className="cycle-alert">
        <b>Continuous evidence-building loop:</b> calibration, validation and
        continuous learning repeat across multiple research cycles.
      </Alert>
      <Box className="cycle-layout">
        <Box>
          <Box className="cycle-diagram">
            {stages.map((s, i) => (
              <Box
                key={s.name}
                className={`cycle-item ${selected === i ? "selected" : "dimmed"}`}
              >
                <Button
                  onClick={() => select(i)}
                  aria-label={`Open stage ${s.number}: ${s.name}`}
                >
                  <span className="stage-number">{s.number}</span>
                  <span>
                    <b>{s.name}</b>
                    <small>{s.purpose}</small>
                    <em>{s.uncertainty}</em>
                  </span>
                </Button>
                {i < stages.length - 1 && (
                  <Box
                    className={`flow-connector ${selected === i || selected === i + 1 ? "active" : ""}`}
                  >
                    <span>{s.connector}</span>
                    {mobile ? <ArrowDownward /> : <ArrowForward />}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
          <Box className="feedback-loop">
            <Autorenew />
            <Box>
              <b>Calibration, validation and continuous learning</b>
              <span>
                Repeat Data Collection feeds updated evidence back to both the
                Digital Twin and Agent-Based Model.
              </span>
            </Box>
          </Box>
        </Box>
        {!tablet && (
          <Card className="desktop-stage-detail">
            <CardContent>{detail}</CardContent>
          </Card>
        )}
      </Box>
      <Drawer
        anchor="bottom"
        open={tablet && detailOpen}
        onClose={() => setDetailOpen(false)}
        PaperProps={{
          sx: { borderRadius: "20px 20px 0 0", maxHeight: "88vh" },
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 }, overflowY: "auto" }}>{detail}</Box>
      </Drawer>
      <Box className="concept-callout">
        <ScienceOutlined />
        <Typography>
          “The <b>Digital Twin</b> models where interactions occur.{" "}
          <b>Agent-Based Modelling</b> represents who or what interacts and how
          they behave. <b>Scenario Simulation</b> tests what happens when
          conditions and decisions change. The <b>Living Lab</b> determines
          whether simulated results occur in reality.”
        </Typography>
      </Box>
      <Typography variant="h5" mt={4}>
        Evidence progression
      </Typography>
      <Box className="evidence-ladder">
        {evidence.map((x, i) => (
          <Box key={x}>
            <span>0{i + 1}</span>
            <b>{x}</b>
            <small>{stages[i].name}</small>
          </Box>
        ))}
      </Box>
      <Typography color="text.secondary" mt={1.5}>
        No stage alone is sufficient. Data without modelling cannot explore
        future scenarios; modelling without experimentation cannot demonstrate
        real-world performance; experimentation without repeated collection
        cannot improve accuracy or support reliable scaling.
      </Typography>
      <Typography variant="h5" mt={4}>
        Stage-gate decisions
      </Typography>
      <Box className="gate-grid">
        {gates.map((g) => (
          <Accordion key={g.name}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Stack direction="row" gap={1} alignItems="center">
                <Chip size="small" label="GO / REVISE" color="warning" />
                <b>{g.name}</b>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Typography fontWeight={700}>{g.question}</Typography>
              <Typography variant="caption" color="text.secondary">
                IF NO
              </Typography>
              <Box className="fallback-list">
                {g.fallbacks.map((x) => (
                  <Chip key={x} label={x} variant="outlined" />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Accordion className="classroom-example">
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box>
            <Chip
              label="Illustrative research process — no real results claimed"
              color="primary"
              variant="outlined"
            />
            <Typography variant="h5" mt={1}>
              Example: Cooling an overheating university classroom
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box className="example-grid">
            {[
              [
                "Initial Data Collection",
                "Sensors find high afternoon heat, west-facing solar gain, HVAC demand, low comfort and limited plants.",
              ],
              [
                "Digital Twin",
                "Represents room geometry, windows, materials, HVAC, sunlight, plant locations and airflow.",
              ],
              [
                "Agent-Based Modelling",
                "Students, lecturer, manager, plants, HVAC, irrigation and comfort agents interact.",
              ],
              [
                "Scenario Simulation",
                "Compares baseline, plants, shade, ventilation, AI-assisted HVAC, combined and limited-water cases.",
              ],
              [
                "Living-Lab Experiment",
                "Installs the strongest strategy in one classroom and measures temperature, energy, water, plant health, comfort and overrides.",
              ],
              [
                "Repeat Data Collection",
                "Compares prediction with measurement and updates physical parameters, behaviour rules, plant estimates and AI decisions.",
              ],
            ].map((x) => (
              <Card key={x[0]}>
                <CardContent>
                  <Typography fontWeight={750}>{x[0]}</Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {x[1]}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
      <Card className="funding-risk">
        <CardContent>
          <Chip icon={<Autorenew />} label="ITERATIVE EVIDENCE PATHWAY" />
          <Typography variant="h4" mt={2}>
            Why This Research Cycle Reduces Funding Risk
          </Typography>
          <Typography mt={1}>
            The methodology moves progressively from observation to modelling,
            scenario testing and limited real-world validation. Data grounds the
            models; the Digital Twin and ABM explore options before investment;
            simulation identifies safer candidates; the Living Lab tests only
            the most promising intervention; and repeated measurement determines
            whether larger deployment is justified.
          </Typography>
          <Box className="benefit-grid">
            {[
              "Prevents investment in poorly tested interventions",
              "Reduces expensive physical experiments",
              "Produces measurable and reproducible evidence",
              "Creates a pathway from prototype to scale",
            ].map((x) => (
              <Box key={x}>
                <CheckCircle />
                {x}
              </Box>
            ))}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption">
            Collected measurement · Survey response · Model assumption ·
            Simulated scenario · Experimental measurement · Calibrated model ·
            Requires further validation
          </Typography>
        </CardContent>
      </Card>
    </section>
  );
}
