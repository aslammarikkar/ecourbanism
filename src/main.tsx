import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, NavLink, Route, Routes } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import {
  AssessmentOutlined,
  AutoAwesomeOutlined,
  BalanceOutlined,
  Close,
  DashboardOutlined,
  DownloadOutlined,
  ExpandMore,
  GroupsOutlined,
  InfoOutlined,
  LandscapeOutlined,
  MapOutlined,
  Menu,
  MonitorHeartOutlined,
  Refresh,
  ScienceOutlined,
  ThermostatOutlined,
  WaterDropOutlined,
  ParkOutlined,
  ArrowForward,
  CheckCircle,
  WarningAmber,
  LocationOnOutlined,
} from "@mui/icons-material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import ResearchBlueprint from "./ResearchBlueprint";
import {
  agents,
  alerts,
  interventions,
  neighbourhoods,
  scenarios,
  sensors,
  stakeholders,
} from "./data";
import type { Neighbourhood } from "./types";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6952D5", dark: "#4935AC", light: "#EEEAFE" },
    secondary: { main: "#2F9D70" },
    background: { default: "#F5F6FA", paper: "#fff" },
    text: { primary: "#20202A", secondary: "#696977" },
    warning: { main: "#E8923A" },
    error: { main: "#D84A4A" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "Inter,Segoe UI,Arial,sans-serif",
    h4: { fontWeight: 750, letterSpacing: "-.04em" },
    h5: { fontWeight: 720, letterSpacing: "-.025em" },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 650 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E8E8EF",
          boxShadow: "0 4px 20px rgba(30,30,60,.045)",
        },
      },
    },
    MuiButton: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 650 } } },
  },
});
const drawerWidth = 272;
const nav = [
  ["Overview", "/", <DashboardOutlined />],
  ["Heat Map", "/map", <MapOutlined />],
  ["Area Assessment", "/assessment", <AssessmentOutlined />],
  ["AI Recommendations", "/recommendations", <AutoAwesomeOutlined />],
  ["Scenario Simulator", "/scenarios", <ScienceOutlined />],
  ["Resource Planning", "/resources", <BalanceOutlined />],
  ["Monitoring", "/monitoring", <MonitorHeartOutlined />],
  ["Stakeholders", "/stakeholders", <GroupsOutlined />],
  ["Project Information", "/project", <InfoOutlined />],
  ["Research Blueprint", "/research", <ScienceOutlined />],
] as const;
const tempTrend = [
  { t: "06:00", temp: 22, feel: 22 },
  { t: "09:00", temp: 27, feel: 29 },
  { t: "12:00", temp: 33, feel: 36 },
  { t: "15:00", temp: 37, feel: 41 },
  { t: "18:00", temp: 34, feel: 37 },
  { t: "21:00", temp: 28, feel: 29 },
];
const riskData = neighbourhoods.map((n) => ({
  name: n.name.split("-")[0],
  risk: n.heatRiskScore,
  vulnerability: n.vulnerabilityScore,
}));
const chartColors = [
  "#6952D5",
  "#2F9D70",
  "#8ECFAF",
  "#E8923A",
  "#D84A4A",
  "#B6A8F7",
];
function riskColor(v: number) {
  return v >= 85
    ? "#D84A4A"
    : v >= 70
      ? "#E8923A"
      : v >= 50
        ? "#E3B635"
        : "#43A875";
}
function RiskBadge({ score }: { score: number }) {
  const label =
    score >= 85
      ? "Critical"
      : score >= 70
        ? "High"
        : score >= 50
          ? "Moderate"
          : "Low";
  return (
    <Chip
      size="small"
      label={`${label} · ${score}`}
      sx={{ bgcolor: riskColor(score) + "18", color: riskColor(score) }}
    />
  );
}
function Disclaimer({
  children = "Prototype estimate · Simulated data · Expert validation required",
}: {
  children?: React.ReactNode;
}) {
  return (
    <Alert
      icon={<ScienceOutlined />}
      severity="info"
      sx={{
        bgcolor: "#F1EEFF",
        color: "#4E3BAA",
        "& .MuiAlert-icon": { color: "#6952D5" },
      }}
    >
      {children}
    </Alert>
  );
}
function PageHead({
  eyebrow,
  title,
  desc,
  action,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <Box className="page-head">
      <Box>
        <Typography className="eyebrow">{eyebrow}</Typography>
        <Typography variant="h4">{title}</Typography>
        <Typography color="text.secondary" mt={0.7}>
          {desc}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}
function Kpi({
  label,
  value,
  detail,
  icon,
  tone = "#6952D5",
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone?: string;
}) {
  return (
    <Card>
      <CardContent className="kpi">
        <Box className="iconbox" sx={{ bgcolor: tone + "15", color: tone }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" mt={0.5}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {detail}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card sx={{ minWidth: 0, overflow: "hidden" }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        <Box
          sx={{
            width: "100%",
            height: { xs: 240, sm: 270, md: 300 },
            mt: 2,
            minWidth: 0,
          }}
          role="img"
          aria-label={`${title}. ${subtitle ?? "Data visualisation"}`}
        >
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}
function Overview() {
  const [city, setCity] = useState("Mainz");
  const [busy, setBusy] = useState(false);
  const refresh = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 900);
  };
  return (
    <>
      <PageHead
        eyebrow="CITY INTELLIGENCE"
        title="Urban heat overview"
        desc="A decision snapshot for heat exposure, vulnerability and cooling capacity."
        action={
          <Button
            variant="outlined"
            href="/research"
            startIcon={<ScienceOutlined />}
          >
            Research blueprint
          </Button>
        }
      />
      <Card sx={{ mb: 2.5 }}>
        <CardContent className="toolbar">
          <FormControl size="small">
            <InputLabel>City</InputLabel>
            <Select
              value={city}
              label="City"
              onChange={(e) => setCity(e.target.value)}
            >
              {["Mainz", "Frankfurt", "Helsinki", "Colombo"].map((x) => (
                <MenuItem value={x} key={x}>
                  {x}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            type="date"
            label="Analysis date"
            defaultValue="2026-07-15"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl size="small">
            <InputLabel>Scenario</InputLabel>
            <Select defaultValue="Severe heatwave" label="Scenario">
              <MenuItem value="Typical summer">Typical summer</MenuItem>
              <MenuItem value="Severe heatwave">Severe heatwave</MenuItem>
              <MenuItem value="Extreme heatwave">Extreme heatwave</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={
              busy ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Refresh />
              )
            }
            onClick={refresh}
          >
            {busy ? "Refreshing…" : "Refresh analysis"}
          </Button>
        </CardContent>
      </Card>
      <Disclaimer>
        Simulated city analysis for {city}. This prototype is not connected to
        live sensors or predictive AI.
      </Disclaimer>
      <Box className="kpi-grid" mt={2.5}>
        <Kpi
          label="Average urban temperature"
          value="35.2°C"
          detail="+4.1°C vs rural edge"
          icon={<ThermostatOutlined />}
          tone="#D84A4A"
        />
        <Kpi
          label="Critical heat zones"
          value="5"
          detail="2 require immediate action"
          icon={<WarningAmber />}
          tone="#E8923A"
        />
        <Kpi
          label="Population exposed"
          value="42,680"
          detail="19% of city population"
          icon={<GroupsOutlined />}
        />
        <Kpi
          label="Tree-canopy coverage"
          value="18.7%"
          detail="Target: 30% by 2035"
          icon={<ParkOutlined />}
          tone="#2F9D70"
        />
        <Kpi
          label="Available cooling budget"
          value="€4.2M"
          detail="2026 programme"
          icon={<BalanceOutlined />}
        />
        <Kpi
          label="Water availability"
          value="28 ML"
          detail="Annual irrigation envelope"
          icon={<WaterDropOutlined />}
          tone="#438AC9"
        />
        <Kpi
          label="Cooling potential"
          value="−2.4°C"
          detail="Balanced scenario estimate"
          icon={<LandscapeOutlined />}
          tone="#2F9D70"
        />
        <Kpi
          label="Priority neighbourhoods"
          value="5"
          detail="Neustadt-West ranks first"
          icon={<LocationOnOutlined />}
          tone="#E8923A"
        />
      </Box>
      <Box className="chart-grid" mt={2.5}>
        <ChartCard
          title="Temperature through the day"
          subtitle="Severe heatwave scenario · °C"
        >
          <ResponsiveContainer>
            <LineChart data={tempTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="t" />
              <YAxis domain={[18, 44]} />
              <RTooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="temp"
                name="Air temperature"
                stroke="#6952D5"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="feel"
                name="Feels like"
                stroke="#E8923A"
                strokeWidth={2}
                strokeDasharray="5 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard
          title="Neighbourhood risk"
          subtitle="Heat and vulnerability indices"
        >
          <ResponsiveContainer>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <RTooltip />
              <Legend />
              <Bar
                dataKey="risk"
                name="Heat risk"
                fill="#E8703A"
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="vulnerability"
                name="Vulnerability"
                fill="#B6A8F7"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard
          title="Cooling intervention mix"
          subtitle="Recommended programme share"
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={[
                  { name: "Trees", value: 34 },
                  { name: "Green roofs", value: 21 },
                  { name: "Pocket parks", value: 17 },
                  { name: "Shade", value: 16 },
                  { name: "Water systems", value: 12 },
                ]}
                dataKey="value"
                innerRadius={62}
                outerRadius={92}
                paddingAngle={3}
              >
                {chartColors.map((c, i) => (
                  <Cell key={c} fill={c} />
                ))}
              </Pie>
              <RTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Resource allocation" subtitle="€4.2M programme">
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={[
                { n: "Trees", v: 1.35 },
                { n: "Roofs", v: 0.88 },
                { n: "Parks", v: 0.71 },
                { n: "Shade", v: 0.48 },
                { n: "Water", v: 0.39 },
                { n: "Engagement", v: 0.22 },
                { n: "Monitoring", v: 0.17 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" unit="M" />
              <YAxis type="category" dataKey="n" width={80} />
              <RTooltip />
              <Bar dataKey="v" fill="#6952D5" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Box>
      <Card className="summary-card">
        <CardContent>
          <Chip
            icon={<AutoAwesomeOutlined />}
            label="Simulated AI-generated summary"
            color="primary"
            variant="outlined"
          />
          <Typography variant="h5" mt={2} maxWidth={900}>
            Five neighbourhoods are experiencing severe heat exposure.
          </Typography>
          <Typography color="text.secondary" mt={1} maxWidth={900}>
            Neustadt-West has the highest combined heat and vulnerability score
            due to limited canopy, dense built surfaces, older residents and
            insufficient public shade. A balanced package could benefit about
            21,800 people.
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}

const facilityIcon = L.divIcon({
  className: "facility-marker",
  html: "<span>●</span>",
  iconSize: [22, 22],
});
function AreaPanel({ n }: { n: Neighbourhood }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography className="eyebrow">SELECTED AREA</Typography>
          <Typography variant="h5">{n.name}</Typography>
        </Box>
        <RiskBadge score={n.heatRiskScore} />
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Box className="details-grid">
        {[
          ["Surface temp", `${n.surfaceTemperature}°C`],
          ["Air temp", `${n.airTemperature}°C`],
          ["Tree canopy", `${n.canopyCoverage}%`],
          ["Population", n.population.toLocaleString()],
          ["Vulnerable residents", `${n.vulnerablePopulationPercentage}%`],
          ["Public land", `${n.availableLand.toLocaleString()} m²`],
          ["Water", n.waterAvailability],
          ["Priority score", `${n.priorityScore}/100`],
        ].map((x) => (
          <Box key={x[0]}>
            <Typography variant="caption" color="text.secondary">
              {x[0]}
            </Typography>
            <Typography fontWeight={700}>{x[1]}</Typography>
          </Box>
        ))}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2">
        Current cooling infrastructure
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        3 small parks · 11% shaded stops · 2 public fountains · fragmented
        street canopy
      </Typography>
      <Button fullWidth variant="contained" sx={{ mt: 2 }} href="/assessment">
        Open detailed assessment
      </Button>
    </Box>
  );
}
function HeatMap() {
  const compact = useMediaQuery(theme.breakpoints.down("md"));
  const [sel, setSel] = useState(neighbourhoods[0]);
  const [details, setDetails] = useState(false);
  const [layers, setLayers] = useState([
    "Surface temperature",
    "Public facilities",
  ]);
  const controls = (
    <Stack direction="row" flexWrap="wrap" gap={1}>
      {[
        "Surface temperature",
        "Tree canopy",
        "Population density",
        "Social vulnerability",
        "Public facilities",
        "Green infrastructure",
        "Recommendations",
      ].map((x) => (
        <Chip
          key={x}
          clickable
          variant={layers.includes(x) ? "filled" : "outlined"}
          color={layers.includes(x) ? "primary" : "default"}
          label={x}
          onClick={() =>
            setLayers((v) =>
              v.includes(x) ? v.filter((y) => y !== x) : [...v, x],
            )
          }
        />
      ))}
    </Stack>
  );
  return (
    <>
      <PageHead
        eyebrow="SPATIAL ANALYSIS"
        title="Interactive heat map"
        desc="Explore illustrative neighbourhood heat zones, vulnerability and cooling assets."
      />
      <Disclaimer>
        Map overlays and facility locations are realistic mock data for
        demonstration only.
      </Disclaimer>
      {compact && (
        <Accordion className="map-controls">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography fontWeight={700}>
              Map layers · {layers.length} visible
            </Typography>
          </AccordionSummary>
          <AccordionDetails>{controls}</AccordionDetails>
        </Accordion>
      )}
      <Box className="map-layout" mt={2.5}>
        <Card className="map-card">
          <MapContainer center={[50.001, 8.25]} zoom={13} scrollWheelZoom>
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {neighbourhoods.map((n) => (
              <Circle
                key={n.id}
                center={[n.latitude, n.longitude]}
                radius={500}
                pathOptions={{
                  color: riskColor(n.heatRiskScore),
                  fillColor: riskColor(n.heatRiskScore),
                  fillOpacity: 0.38,
                  weight: 3,
                }}
                eventHandlers={{
                  click: () => {
                    setSel(n);
                    if (compact) setDetails(true);
                  },
                }}
              >
                <Popup>
                  <b>{n.name}</b>
                  <br />
                  {n.surfaceTemperature}°C surface · risk {n.heatRiskScore}
                </Popup>
              </Circle>
            ))}
            {[
              [50.009, 8.249, "School"],
              [50.002, 8.258, "Hospital"],
              [49.996, 8.269, "Care centre"],
              [50.018, 8.229, "Park"],
              [50.005, 8.277, "Transit stop"],
            ].map((m, i) => (
              <Marker
                key={i}
                position={[m[0] as number, m[1] as number]}
                icon={facilityIcon}
              >
                <Popup>{m[2]}</Popup>
              </Marker>
            ))}
          </MapContainer>
          <Box className="map-legend">
            <b>Heat risk</b>
            {[
              ["Low", "#43A875"],
              ["Moderate", "#E3B635"],
              ["High", "#E8923A"],
              ["Critical", "#D84A4A"],
            ].map((x) => (
              <span key={x[0]}>
                <i style={{ background: x[1] }} />
                {x[0]}
              </span>
            ))}
          </Box>
        </Card>
        {!compact && (
          <Card>
            <CardContent>
              <Typography variant="subtitle2" mb={1}>
                VISIBLE LAYERS
              </Typography>
              {controls}
              <Box mt={2}>
                <AreaPanel n={sel} />
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
      <Drawer
        anchor="bottom"
        open={compact && details}
        onClose={() => setDetails(false)}
        PaperProps={{
          sx: { borderRadius: "20px 20px 0 0", maxHeight: "82vh" },
        }}
      >
        <Box sx={{ p: 2.5, overflowY: "auto" }}>
          <Box textAlign="right">
            <IconButton
              aria-label="Close neighbourhood details"
              onClick={() => setDetails(false)}
            >
              <Close />
            </IconButton>
          </Box>
          <AreaPanel n={sel} />
        </Box>
      </Drawer>
    </>
  );
}

function Assessment() {
  const [id, setId] = useState("nw");
  const n = neighbourhoods.find((x) => x.id === id)!;
  const sections = [
    [
      "Environmental conditions",
      [
        ["Surface temperature", `${n.surfaceTemperature}°C`],
        ["Air temperature", `${n.airTemperature}°C`],
        ["Humidity", `${n.humidity}%`],
        ["Solar exposure", n.solarExposure],
        ["Wind conditions", `${n.wind} m/s`],
        ["Impervious surface", `${n.imperviousSurfacePercentage}%`],
        ["Existing vegetation", `${n.canopyCoverage}% canopy`],
        ["Soil moisture", `${n.soilMoisture}% · dry`],
      ],
    ],
    [
      "Population vulnerability",
      [
        ["Older population", "18.4%"],
        ["Children", "14.8%"],
        ["Low-income households", "22.1%"],
        ["Outdoor workers", "1,240"],
        ["Without cooling access", "31%"],
        ["Sensitive facilities", "14 sites"],
      ],
    ],
    [
      "Resource availability",
      [
        ["Municipal budget", "€1.1M allocated"],
        ["Water availability", n.waterAvailability],
        ["Available land", `${n.availableLand.toLocaleString()} m²`],
        ["Suitable roof area", `${n.availableRoofArea.toLocaleString()} m²`],
        ["Maintenance capacity", "6 FTE · constrained"],
        ["Implementation time", "18–36 months"],
      ],
    ],
  ];
  return (
    <>
      <PageHead
        eyebrow="NEIGHBOURHOOD PROFILE"
        title="Area assessment"
        desc="Combine physical heat exposure, human vulnerability and implementation capacity."
        action={
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Neighbourhood</InputLabel>
            <Select
              label="Neighbourhood"
              value={id}
              onChange={(e) => setId(e.target.value)}
            >
              {neighbourhoods.map((n) => (
                <MenuItem value={n.id} key={n.id}>
                  {n.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />
      <Disclaimer />
      <Box className="assessment-grid" mt={2.5}>
        {sections.map(([title, items]) => (
          <Card key={title as string}>
            <CardContent>
              <Typography variant="h6">{title as string}</Typography>
              <Box className="metric-list">
                {(items as string[][]).map((i) => (
                  <Box key={i[0]}>
                    <Typography color="text.secondary" variant="body2">
                      {i[0]}
                    </Typography>
                    <Typography fontWeight={700}>{i[1]}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
        <Card className="score-card">
          <CardContent>
            <Typography variant="h6">Heat-priority score</Typography>
            <Box className="score-ring">
              <CircularProgress
                variant="determinate"
                value={n.priorityScore}
                size={150}
                thickness={5}
              />
              <Box>
                <Typography variant="h3">{n.priorityScore}</Typography>
                <Typography variant="caption">OUT OF 100</Typography>
              </Box>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Heat exposure × population vulnerability × cooling deficit ÷
              normalised resource cost. Scores are illustrative rankings, not
              scientific predictions.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

function Recommendations() {
  return (
    <>
      <PageHead
        eyebrow="MULTI-AGENT WORKFLOW"
        title="AI recommendations"
        desc="Trace how five simulated specialist agents turn inputs into an intervention package."
      />
      <Disclaimer>
        Simulated AI analysis. Findings are explainable prototype outputs and
        require planning, engineering and community review.
      </Disclaimer>
      <Box className="workflow">
        {[
          "Environmental data",
          "Heat analysis",
          "Vulnerability",
          "Intervention selection",
          "Resource optimisation",
          "Final recommendation",
        ].map((x, i) => (
          <React.Fragment key={x}>
            <Box className="workflow-step">
              <span>{i + 1}</span>
              {x}
            </Box>
            {i < 5 && <ArrowForward color="disabled" />}
          </React.Fragment>
        ))}
      </Box>
      <Box className="agent-grid">
        {agents.map((a, i) => (
          <Card key={a.name}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Avatar
                  sx={{ bgcolor: chartColors[i] + "18", color: chartColors[i] }}
                >
                  {i + 1}
                </Avatar>
                <Chip
                  size="small"
                  icon={<CheckCircle />}
                  label={a.status}
                  color="success"
                  variant="outlined"
                />
              </Stack>
              <Typography variant="h6" mt={2}>
                {a.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                INPUTS ANALYSED
              </Typography>
              <Typography variant="body2">{a.inputs}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2">Main finding</Typography>
              <Typography variant="body2" color="text.secondary">
                {a.finding}
              </Typography>
              <Box mt={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">Confidence</Typography>
                  <b>{a.confidence}%</b>
                </Stack>
                <LinearProgress variant="determinate" value={a.confidence} />
              </Box>
              <Alert severity="info" sx={{ mt: 2 }}>
                {a.action}
              </Alert>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Card className="recommend-panel">
        <CardContent>
          <Chip
            icon={<AutoAwesomeOutlined />}
            label="FINAL SYNTHESIS · PROTOTYPE"
            color="primary"
          />
          <Typography variant="h5" mt={2}>
            Recommended package for Neustadt-West
          </Typography>
          <Box className="recommend-grid">
            <Box>
              {[
                "Plant 35 medium-canopy native trees along west-facing streets",
                "Install two shaded green bus-stop structures",
                "Green 1,200 m² of municipal roof space",
                "Add a pocket park near the elderly-care centre",
                "Use rainwater harvesting for irrigation",
                "Prioritise the school and healthcare corridor",
              ].map((x) => (
                <Stack direction="row" gap={1} mt={1} key={x}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography>{x}</Typography>
                </Stack>
              ))}
            </Box>
            <Box className="outcome-grid">
              {[
                ["Cooling", "−2.1°C"],
                ["People", "8,900"],
                ["Budget", "€1.28M"],
                ["Water", "6.2 ML/yr"],
                ["Maintenance", "Medium"],
                ["Duration", "24 months"],
                ["Equity impact", "92/100"],
                ["Confidence", "84%"],
              ].map((x) => (
                <Box key={x[0]}>
                  <span>{x[0]}</span>
                  <b>{x[1]}</b>
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

function Scenarios() {
  const [budget, setBudget] = useState(4.2);
  const [trees, setTrees] = useState(140);
  const adjusted = scenarios.map((s) => ({
    ...s,
    cost: +(s.cost * (trees / 140) * (0.7 + budget / 14)).toFixed(1),
  }));
  return (
    <>
      <PageHead
        eyebrow="ILLUSTRATIVE PROJECTIONS"
        title="Scenario simulator"
        desc="Change planning assumptions and compare resource, cooling and equity trade-offs."
        action={
          <Button variant="outlined" href="/research">
            Research methodology
          </Button>
        }
      />
      <Disclaimer>
        All values are prototype estimates based on simplified response
        curves—not real forecasts.
      </Disclaimer>
      <Box className="sim-layout" mt={2.5}>
        <Card>
          <CardContent>
            <Typography variant="h6">Planning inputs</Typography>
            <Typography mt={2} variant="body2">
              Number of trees: <b>{trees}</b>
            </Typography>
            <Slider
              value={trees}
              min={20}
              max={300}
              onChange={(_, v) => setTrees(v as number)}
            />
            <Typography variant="body2">
              Available budget: <b>€{budget}M</b>
            </Typography>
            <Slider
              value={budget}
              min={1}
              max={10}
              step={0.1}
              onChange={(_, v) => setBudget(v as number)}
            />
            {[
              ["Tree type", "Medium native"],
              ["Canopy size", "Medium"],
              ["Green-roof area", "4,200 m²"],
              ["Green-wall area", "800 m²"],
              ["Pocket-park area", "1,200 m²"],
              ["Shaded spaces", "8"],
              ["Irrigation", "Rainwater assisted"],
              ["Maintenance", "Medium"],
              ["Planning period", "10 years"],
            ].map((x) => (
              <TextField
                key={x[0]}
                size="small"
                label={x[0]}
                defaultValue={x[1]}
                fullWidth
                sx={{ mt: 1.5 }}
              />
            ))}
          </CardContent>
        </Card>
        <Box>
          <Box className="scenario-grid">
            {adjusted.map((s) => (
              <Card key={s.id} className={s.id === "b" ? "featured" : ""}>
                <CardContent>
                  <Chip
                    label={s.tag}
                    sx={{ bgcolor: s.color + "18", color: s.color }}
                  />
                  <Typography variant="h6" mt={1.5}>
                    {s.name}
                  </Typography>
                  <Typography variant="h4" color={s.color} my={1}>
                    −{s.cooling}°C
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estimated local cooling
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {[
                    ["Total cost", `€${s.cost}M`],
                    ["Water demand", `${s.water} ML/yr`],
                    ["Land required", `${s.land} ha`],
                    ["People protected", s.people.toLocaleString()],
                    ["Equity score", `${s.equity}/100`],
                    ["Full benefit", s.time],
                  ].map((x) => (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      my={1}
                      key={x[0]}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {x[0]}
                      </Typography>
                      <b>{x[1]}</b>
                    </Stack>
                  ))}
                </CardContent>
              </Card>
            ))}
          </Box>
          <ChartCard
            title="Scenario comparison"
            subtitle="Normalised result indices"
          >
            <ResponsiveContainer>
              <BarChart
                data={adjusted.map((s) => ({
                  name: `Scenario ${s.id.toUpperCase()}`,
                  cooling: s.cooling * 25,
                  equity: s.equity,
                  maintenance: s.maintenance,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RTooltip />
                <Legend />
                <Bar dataKey="cooling" fill="#6952D5" />
                <Bar dataKey="equity" fill="#2F9D70" />
                <Bar dataKey="maintenance" fill="#E8923A" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>
      </Box>
    </>
  );
}

function Resources() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const run = () => {
    setRunning(true);
    setDone(false);
    setTimeout(() => {
      setRunning(false);
      setDone(true);
    }, 1300);
  };
  const rows = [
    [
      "Native trees",
      "Neustadt-West",
      "140",
      "€840k",
      "14 ML",
      "−1.4°C",
      "9,200",
      "Medium",
    ],
    [
      "Green roofs",
      "Civic corridor",
      "4,200 m²",
      "€1.05M",
      "2 ML",
      "−0.7°C",
      "5,800",
      "Medium",
    ],
    [
      "Pocket parks",
      "Altstadt",
      "2",
      "€720k",
      "5 ML",
      "−1.8°C",
      "4,300",
      "High",
    ],
    [
      "Shade structures",
      "Transit corridor",
      "12",
      "€360k",
      "0",
      "−6°C felt",
      "7,100",
      "Low",
    ],
    [
      "Rain harvesting",
      "Municipal sites",
      "5",
      "€410k",
      "−8 ML",
      "Enabler",
      "12,000",
      "Medium",
    ],
  ];
  return (
    <>
      <PageHead
        eyebrow="CONSTRAINED OPTIMISATION"
        title="Resource planning"
        desc="Allocate limited money, water, land and maintenance capacity to priority sites."
      />
      <Disclaimer />
      <Box className="resource-layout" mt={2.5}>
        <Card>
          <CardContent>
            <Typography variant="h6">Resource constraints</Typography>
            {[
              ["Total project budget", "4.2", "€ million"],
              ["Annual irrigation water", "28", "ML"],
              ["Available land", "3.2", "hectares"],
              ["Maintenance workers", "12", "FTE"],
              ["Implementation period", "4", "years"],
              ["Minimum coverage", "20000", "people"],
            ].map((x) => (
              <TextField
                key={x[0]}
                size="small"
                type="number"
                label={x[0]}
                defaultValue={x[1]}
                helperText={x[2]}
                fullWidth
                sx={{ mt: 1.5 }}
              />
            ))}
            <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
              <InputLabel>Priority facilities</InputLabel>
              <Select
                defaultValue="Schools and care"
                label="Priority facilities"
              >
                <MenuItem value="Schools and care">
                  Schools and elderly care
                </MenuItem>
                <MenuItem value="Health">Healthcare facilities</MenuItem>
                <MenuItem value="Transit">Public transit</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={run}
              disabled={running}
            >
              {running ? (
                <>
                  <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                  Optimising…
                </>
              ) : (
                "Run resource optimisation"
              )}
            </Button>
            <Button
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => {
                setDone(false);
              }}
            >
              Reset allocation
            </Button>
          </CardContent>
        </Card>
        <Box>
          {running && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Optimising cooling impact under selected budget, water, land and
              maintenance constraints.
            </Alert>
          )}
          {done && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Recommended allocation generated. Estimated to cover 24,800 people
              within all selected constraints.
            </Alert>
          )}
          <Card>
            <CardContent>
              <Typography variant="h6">Recommended allocation</Typography>
              <TableContainer
                aria-label="Resource optimisation results"
                sx={{ overflowX: "auto", width: "100%" }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {[
                        "Rank",
                        "Intervention",
                        "Location",
                        "Quantity",
                        "Cost",
                        "Water",
                        "Cooling",
                        "People",
                        "Effort",
                      ].map((x) => (
                        <TableCell key={x}>{x}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r, i) => (
                      <TableRow key={r[0]}>
                        <TableCell>
                          <Chip size="small" label={i + 1} />
                        </TableCell>
                        {r.map((x) => (
                          <TableCell key={x}>{x}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
          <Box mt={2}>
            <ChartCard
              title="Budget allocation"
              subtitle="Recommended share by programme category"
            >
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      "Trees",
                      "Roofs",
                      "Parks",
                      "Shade",
                      "Sensors",
                      "Irrigation",
                      "Maintenance",
                      "Engagement",
                    ].map((n, i) => ({
                      name: n,
                      value: [26, 22, 17, 10, 4, 8, 9, 4][i],
                    }))}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={90}
                  >
                    {[...chartColors, "#438AC9", "#A7A7B5"].map((c) => (
                      <Cell key={c} fill={c} />
                    ))}
                  </Pie>
                  <RTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Box>
        </Box>
      </Box>
    </>
  );
}

function Monitoring() {
  const data = [
    { d: "Baseline", base: 38, current: 38, expected: 38 },
    { d: "Week 1", base: 38, current: 37.4, expected: 37.2 },
    { d: "Month 1", base: 38, current: 36.9, expected: 36.7 },
    { d: "Month 3", base: 38, current: 36.1, expected: 35.9 },
    { d: "Month 6", base: 38, current: 35.5, expected: 35.6 },
  ];
  return (
    <>
      <PageHead
        eyebrow="SIMULATED OPERATIONS"
        title="Cooling performance monitoring"
        desc="Track intervention health, resource use and variance from planned outcomes."
      />
      <Disclaimer>
        Mock sensor data · Last simulated update 15 July 2026, 14:30 CEST.
      </Disclaimer>
      <Box className="sensor-grid" mt={2.5}>
        {sensors.map((s, i) => (
          <Kpi
            key={s.name}
            label={s.name}
            value={s.value}
            detail={s.status}
            icon={
              i === 1 ? (
                <WaterDropOutlined />
              ) : i === 4 ? (
                <ParkOutlined />
              ) : (
                <MonitorHeartOutlined />
              )
            }
            tone={i === 7 ? "#D84A4A" : i === 1 ? "#438AC9" : "#2F9D70"}
          />
        ))}
      </Box>
      <Box className="monitor-grid" mt={2.5}>
        <ChartCard
          title="Before and after temperature"
          subtitle="Paired-site daily peak · °C"
        >
          <ResponsiveContainer>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="d" />
              <YAxis domain={[33, 40]} />
              <RTooltip />
              <Legend />
              <Line
                dataKey="base"
                name="Baseline"
                stroke="#D84A4A"
                strokeWidth={2}
              />
              <Line
                dataKey="current"
                name="Current"
                stroke="#6952D5"
                strokeWidth={3}
              />
              <Line
                dataKey="expected"
                name="Expected"
                stroke="#2F9D70"
                strokeDasharray="5 4"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card>
          <CardContent>
            <Typography variant="h6">Maintenance alerts</Typography>
            {alerts.map((a) => (
              <Box className="alert-row" key={a.title}>
                <Avatar
                  sx={{
                    bgcolor: a.severity === "high" ? "#FCEAEA" : "#FFF3E4",
                    color: a.severity === "high" ? "#D84A4A" : "#E8923A",
                  }}
                >
                  <WarningAmber />
                </Avatar>
                <Box flex={1}>
                  <Typography fontWeight={700}>{a.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {a.location} · {a.time}
                  </Typography>
                </Box>
                <Chip size="small" label={a.severity} />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
      <Card sx={{ mt: 2.5 }}>
        <CardContent>
          <Typography variant="h6">Performance variance</Typography>
          <Box className="outcome-grid">
            <Box>
              <span>Baseline peak</span>
              <b>38.0°C</b>
            </Box>
            <Box>
              <span>Current peak</span>
              <b>35.5°C</b>
            </Box>
            <Box>
              <span>Expected peak</span>
              <b>35.6°C</b>
            </Box>
            <Box>
              <span>Difference from forecast</span>
              <b style={{ color: "#2F9D70" }}>−0.1°C</b>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

function Stakeholders() {
  return (
    <>
      <PageHead
        eyebrow="GOVERNANCE & DELIVERY"
        title="Stakeholder ecosystem"
        desc="Clarify ownership, information exchange, implementation and community benefit."
        action={
          <Button variant="outlined" href="/research#funding">
            Participation blueprint
          </Button>
        }
      />
      <Box className="stake-grid">
        {stakeholders.map((s) => (
          <Card key={s.group}>
            <CardContent>
              <Avatar
                sx={{ bgcolor: "#EEEAFE", color: "#6952D5", fontWeight: 700 }}
              >
                {s.icon}
              </Avatar>
              <Typography variant="h6" mt={2}>
                {s.group}
              </Typography>
              {s.members.map((m) => (
                <Typography key={m} color="text.secondary" mt={0.8}>
                  • {m}
                </Typography>
              ))}
            </CardContent>
          </Card>
        ))}
      </Box>
      <Card sx={{ mt: 2.5 }}>
        <CardContent>
          <Typography variant="h6">Information and decision flow</Typography>
          <Box className="flow-diagram">
            <Box>
              <b>Data providers</b>
              <span>Environmental & operational inputs</span>
            </Box>
            <ArrowForward />
            <Box className="violet">
              <b>UrbanCool AI</b>
              <span>Simulated analysis & options</span>
            </Box>
            <ArrowForward />
            <Box>
              <b>Owners & direct users</b>
              <span>Review, prioritise & fund</span>
            </Box>
            <ArrowForward />
            <Box className="green">
              <b>Partners & communities</b>
              <span>Co-design, deliver & evaluate</span>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" mt={2}>
            Decisions remain with accountable municipal bodies. Community
            consultation and domain-expert review are required before
            implementation.
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}

function Project() {
  const sections = [
    [
      "Problem",
      "Urban areas experience increasing heat because of dense construction, impervious surfaces, limited vegetation, climate change and unequal access to cooling resources.",
    ],
    [
      "Proposed solution",
      "UrbanCool AI combines environmental data, simulated AI-agent analysis, nature-based solutions, biomimicry and resource optimisation to support equitable urban heat mitigation.",
    ],
    [
      "Research gap",
      "Existing approaches often study heat prediction, urban vegetation, irrigation, social vulnerability or building cooling separately. This concept integrates heat-risk detection, social vulnerability, intervention selection, water and budget constraints, resource allocation, scenario comparison and performance evaluation.",
    ],
  ];
  return (
    <>
      <PageHead
        eyebrow="ABOUT THE PROTOTYPE"
        title="Project information"
        desc="The rationale, research contribution, biological inspirations and responsible-use boundaries."
        action={
          <Button variant="contained" href="/research">
            View research pathway
          </Button>
        }
      />
      <Box className="project-hero">
        <Typography variant="h3">
          Cities can cool more fairly when environmental evidence and human
          needs are planned together.
        </Typography>
        <Typography>
          UrbanCool AI is a university innovation prototype for transparent,
          resource-aware heat mitigation decisions.
        </Typography>
      </Box>
      <Box className="project-grid">
        {sections.map((s) => (
          <Card key={s[0]}>
            <CardContent>
              <Typography variant="h6">{s[0]}</Typography>
              <Typography color="text.secondary" mt={1}>
                {s[1]}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Typography variant="h5" mt={4}>
        Biomimicry principles
      </Typography>
      <Box className="bio-grid">
        {[
          ["Tree-canopy shading", "Layered shade interrupts solar gain."],
          ["Evapotranspiration", "Plants exchange water for cooling."],
          [
            "Forest-layer cooling",
            "Multiple vegetation levels create cooler microclimates.",
          ],
          [
            "Termite-mound ventilation",
            "Pressure-driven airflow inspires passive ventilation.",
          ],
          ["Leaf-inspired shading", "Adaptive surfaces respond to sun angle."],
          [
            "Plant-like rain collection",
            "Branching forms guide water to storage.",
          ],
        ].map((x, i) => (
          <Card key={x[0]}>
            <CardContent>
              <Avatar sx={{ bgcolor: "#EAF7F0", color: "#2F9D70" }}>
                <ParkOutlined />
              </Avatar>
              <Typography fontWeight={700} mt={1.5}>
                {x[0]}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {x[1]}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Card sx={{ mt: 3, borderColor: "#E6B3B3" }}>
        <CardContent>
          <Typography variant="h6">Limitations and responsible use</Typography>
          <Box className="limitations">
            {[
              "The current version is a prototype.",
              "All data and sensor readings are simulated.",
              "Cooling results require validation with real-world measurements.",
              "AI recommendations require expert review.",
              "Plant suitability varies by climate and location.",
              "Urban decisions must include community consultation.",
            ].map((x) => (
              <Stack direction="row" gap={1} key={x}>
                <WarningAmber color="warning" fontSize="small" />
                <Typography>{x}</Typography>
              </Stack>
            ))}
          </Box>
        </CardContent>
      </Card>
      <Typography variant="h5" mt={4}>
        Intervention evidence cards
      </Typography>
      <Box className="intervention-grid">
        {interventions.map((x) => (
          <Card key={x.id}>
            <CardContent>
              <Typography variant="h6">{x.name}</Typography>
              <Chip
                size="small"
                label={x.cooling}
                color="success"
                sx={{ my: 1 }}
              />
              <Typography variant="body2">
                <b>Cost:</b> {x.costLevel} · <b>Water:</b> {x.waterDemand}
              </Typography>
              <Typography variant="body2" mt={0.7}>
                <b>Land:</b> {x.landRequirement} · <b>Care:</b> {x.maintenance}
              </Typography>
              <Typography variant="body2" mt={0.7}>
                <b>Full benefit:</b> {x.timeToBenefit}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {x.suitable}. Limitation: {x.limitations}.
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
}

function ResponsiveAppLayout() {
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const mobile = !isDesktop;
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const drawer = (
    <Box className="drawer">
      <Box className="brand">
        <Box className="logo">
          <LandscapeOutlined />
        </Box>
        <Box>
          <Typography variant="h6">UrbanCool AI</Typography>
          <Typography variant="caption">
            AI-powered urban cooling
            <br />
            decision support
          </Typography>
        </Box>
      </Box>
      <List>
        {nav.map(([label, path, icon]) => (
          <ListItemButton
            component={NavLink}
            to={path}
            key={path}
            end={path === "/"}
            onClick={() => setOpen(false)}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
      <Box className="drawer-foot">
        <Chip size="small" label="PROTOTYPE" color="primary" />
        <Typography variant="caption">
          Simulated analysis
          <br />
          Expert validation required
        </Typography>
      </Box>
    </Box>
  );
  return (
    <Box display="flex">
      <CssBaseline />
      {mobile ? (
        <>
          <Box className="mobilebar">
            <IconButton onClick={() => setOpen(true)}>
              <Menu />
            </IconButton>
            <b>UrbanCool AI</b>
          </Box>
          <Drawer open={open} onClose={() => setOpen(false)}>
            {drawer}
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      )}
      <Box
        component="main"
        className="main"
        sx={{ ml: mobile ? 0 : `${drawerWidth}px` }}
      >
        <Box className="top-actions">
          <Tooltip title="Print or save as PDF">
            <Button
              startIcon={<DownloadOutlined />}
              onClick={() => window.print()}
            >
              Export report
            </Button>
          </Tooltip>
          <Button
            startIcon={<Refresh />}
            color="inherit"
            onClick={() => setResetOpen(true)}
          >
            Reset data
          </Button>
        </Box>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/map" element={<HeatMap />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/stakeholders" element={<Stakeholders />} />
          <Route path="/project" element={<Project />} />
          <Route path="/research" element={<ResearchBlueprint />} />
        </Routes>
        <Typography className="footer" variant="caption">
          UrbanCool AI · University innovation prototype · No live AI, sensor or
          scientific prediction services are connected.
        </Typography>
      </Box>
      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        fullScreen={isMobile}
      >
        <DialogTitle>Reset prototype data?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This restores all controls to their illustrative defaults. No
            external data is affected.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Reset prototype
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
          <HashRouter>
        <ResponsiveAppLayout />
          </HashRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
