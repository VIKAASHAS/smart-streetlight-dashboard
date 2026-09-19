import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { analyzeStreetlightHealth } from "./aiEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = process.env.DATA_PATH || path.join(__dirname, "data.json");
const UPLOADS_DIR = process.env.UPLOADS_PATH || path.join(__dirname, "uploads");

const dbDir = path.dirname(DB_FILE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Password hashing helper (SHA-256 with fixed municipal salt)
const SALT = "smart_streetlight_muni_sec_salt_2026";
export function hashPassword(plainText) {
  return crypto.createHash("sha256").update(plainText + SALT).digest("hex");
}

// Helper to calculate dynamic project day from system date
// Sept 8, 2026 = Day 18, Sept 9, 2026 = Day 19, Sept 10, 2026 = Day 20
export function getDynamicProjectDay() {
  const baseAnchor = new Date("2026-08-21T00:00:00.000Z");
  const now = new Date();
  const utcNow = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const diffMs = utcNow.getTime() - baseAnchor.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

// Initial registered users
const initialUsers = [
  {
    id: "adm_01",
    username: "admin",
    email: "admin@citylight.gov",
    passwordHash: hashPassword("admin123"),
    name: "City Municipal Admin",
    role: "admin",
    department: "Smart Urban Infrastructure & Lighting"
  },
  {
    id: "usr_01",
    username: "alex",
    email: "user@citylight.gov",
    passwordHash: hashPassword("user123"),
    name: "Alex Johnson",
    role: "user",
    location: "Metro Ward 4"
  },
  {
    id: "usr_02",
    username: "sarah",
    email: "sarah.j@example.com",
    passwordHash: hashPassword("user123"),
    name: "Sarah Jenkins",
    role: "user",
    location: "Coastal Ward 2"
  },
  {
    id: "usr_03",
    username: "citizen",
    email: "citizen@citylight.gov",
    passwordHash: hashPassword("citizen123"),
    name: "John Citizen",
    role: "user",
    location: "Sunset Ward 1"
  }
];

// Helper to save Base64 image permanently to disk
function saveImagePermanently(base64Data, idPrefix) {
  if (!base64Data || typeof base64Data !== "string") return null;
  if (base64Data.startsWith("/uploads/") || base64Data.startsWith("http://") || base64Data.startsWith("https://")) {
    return base64Data;
  }

  try {
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    let ext = "jpg";
    let buffer;

    if (matches) {
      const format = matches[1].toLowerCase();
      if (format === "png") ext = "png";
      else if (format === "webp") ext = "webp";
      else if (format === "jpeg" || format === "jpg") ext = "jpg";
      else ext = "jpg";
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(base64Data, "base64");
    }

    const filename = `${idPrefix}_${Date.now()}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`[Storage] Saved complaint image permanently to ${filePath}`);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error("Error saving uploaded image permanently:", err);
    return null;
  }
}

// Generate realistic 14-day history for telemetry
function generateHistory(basePower, baseTemp, baseBrightness, cycles = 14, noise = 1.0) {
  const history = [];
  const now = new Date();
  for (let i = cycles; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateLabel = d.toISOString().split("T")[0];
    const pNoise = (Math.random() - 0.5) * 4 * noise;
    const tNoise = (Math.random() - 0.5) * 3 * noise;
    const bNoise = (Math.random() - 0.5) * 2 * noise;

    history.push({
      date: dateLabel,
      power: Math.round((basePower + pNoise) * 10) / 10,
      temperature: Math.round((baseTemp + tNoise) * 10) / 10,
      brightness: Math.min(100, Math.max(50, Math.round(baseBrightness + bNoise))),
      onOffCycles: Math.round(Math.max(1, 2 + (Math.random() > 0.8 ? 1 : 0)))
    });
  }
  return history;
}

const initialStreetlights = [
  // NORTH DISTRICT
  {
    id: "SL-001",
    name: "Metro Central Pole 1",
    location: "Metro Blvd & 4th Ave",
    zone: "North District",
    lat: 28.6139,
    lng: 77.2090,
    installDate: "2024-01-15",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 119.5,
    temperature: 37.2,
    operatingHours: 4120,
    onOffCyclesToday: 2,
    brightnessLevel: 98,
    voltage: 228,
    currentAmps: 0.52,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(119.5, 37.2, 98),
    failureHistory: [
      { date: "2025-06-10", issue: "Routine driver inspection", resolvedBy: "Crew Alpha" }
    ]
  },
  {
    id: "SL-002",
    name: "Metro Central Pole 2",
    location: "Metro Blvd & 7th Ave",
    zone: "North District",
    lat: 28.6148,
    lng: 77.2105,
    installDate: "2024-01-15",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 121.0,
    temperature: 38.0,
    operatingHours: 4135,
    onOffCyclesToday: 2,
    brightnessLevel: 99,
    voltage: 230,
    currentAmps: 0.53,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(121.0, 38.0, 99),
    failureHistory: []
  },
  {
    id: "SL-003",
    name: "Downtown Plaza Pole 1",
    location: "City Center Ring Rd",
    zone: "North District",
    lat: 28.6160,
    lng: 77.2120,
    installDate: "2023-11-20",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 122.3,
    temperature: 39.1,
    operatingHours: 5890,
    onOffCyclesToday: 2,
    brightnessLevel: 96,
    voltage: 227,
    currentAmps: 0.54,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(122.3, 39.1, 96),
    failureHistory: []
  },
  {
    id: "SL-004",
    name: "Downtown Plaza Pole 2",
    location: "Civic Square West",
    zone: "North District",
    lat: 28.6172,
    lng: 77.2135,
    installDate: "2023-11-20",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 118.8,
    temperature: 36.8,
    operatingHours: 5880,
    onOffCyclesToday: 1,
    brightnessLevel: 97,
    voltage: 229,
    currentAmps: 0.52,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(118.8, 36.8, 97),
    failureHistory: []
  },
  {
    id: "SL-005",
    name: "Grand Avenue Light",
    location: "Grand Ave & 2nd Cross",
    zone: "North District",
    lat: 28.6185,
    lng: 77.2150,
    installDate: "2024-02-10",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 120.4,
    temperature: 37.9,
    operatingHours: 3950,
    onOffCyclesToday: 2,
    brightnessLevel: 98,
    voltage: 231,
    currentAmps: 0.52,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(120.4, 37.9, 98),
    failureHistory: []
  },
  {
    id: "SL-006",
    name: "North Gateway Light",
    location: "North Expressway Tollway",
    zone: "North District",
    lat: 28.6198,
    lng: 77.2165,
    installDate: "2023-08-14",
    lampType: "LED 150W Highway Smart Luminaire",
    powerConsumption: 148.0,
    temperature: 41.2,
    operatingHours: 7200,
    onOffCyclesToday: 2,
    brightnessLevel: 95,
    voltage: 230,
    currentAmps: 0.64,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(148.0, 41.2, 95),
    failureHistory: []
  },

  // SOUTH DISTRICT
  {
    id: "SL-007",
    name: "Harbor Promenade Light",
    location: "Harbor Front Road 10",
    zone: "South District",
    lat: 28.6050,
    lng: 77.2010,
    installDate: "2023-05-18",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 133.0,
    temperature: 46.5,
    operatingHours: 8400,
    onOffCyclesToday: 5,
    brightnessLevel: 89,
    voltage: 224,
    currentAmps: 0.59,
    maintenanceStatus: "Under Review",
    telemetryHistory: generateHistory(133.0, 46.5, 89),
    failureHistory: []
  },
  {
    id: "SL-008",
    name: "South Pier Pole A",
    location: "South Pier Bay 2",
    zone: "South District",
    lat: 28.6035,
    lng: 77.2025,
    installDate: "2023-09-12",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 121.2,
    temperature: 38.6,
    operatingHours: 6100,
    onOffCyclesToday: 2,
    brightnessLevel: 97,
    voltage: 229,
    currentAmps: 0.53,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(121.2, 38.6, 97),
    failureHistory: []
  },
  {
    id: "SL-009",
    name: "Industrial Corridor Pole 1",
    location: "Factory Lane East",
    zone: "South District",
    lat: 28.6020,
    lng: 77.2040,
    installDate: "2022-10-05",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 119.8,
    temperature: 39.4,
    operatingHours: 11200,
    onOffCyclesToday: 2,
    brightnessLevel: 94,
    voltage: 228,
    currentAmps: 0.53,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(119.8, 39.4, 94),
    failureHistory: []
  },
  {
    id: "SL-010",
    name: "Industrial Corridor Pole 2",
    location: "Logistics Hub Gate 4",
    zone: "South District",
    lat: 28.6010,
    lng: 77.2055,
    installDate: "2022-10-05",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 120.5,
    temperature: 38.9,
    operatingHours: 11150,
    onOffCyclesToday: 2,
    brightnessLevel: 95,
    voltage: 230,
    currentAmps: 0.52,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(120.5, 38.9, 95),
    failureHistory: []
  },
  {
    id: "SL-011",
    name: "South Riverside Drive",
    location: "Riverbank Walkway",
    zone: "South District",
    lat: 28.5995,
    lng: 77.2070,
    installDate: "2024-03-01",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 118.0,
    temperature: 36.1,
    operatingHours: 3200,
    onOffCyclesToday: 1,
    brightnessLevel: 100,
    voltage: 232,
    currentAmps: 0.51,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(118.0, 36.1, 100),
    failureHistory: []
  },
  {
    id: "SL-012",
    name: "Coastal Highway Pole",
    location: "Coastal Highway Km 14",
    zone: "South District",
    lat: 28.5980,
    lng: 77.2085,
    installDate: "2023-04-22",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 139.5,
    temperature: 53.8,
    operatingHours: 9800,
    onOffCyclesToday: 4,
    brightnessLevel: 82,
    voltage: 221,
    currentAmps: 0.63,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(139.5, 53.8, 82),
    failureHistory: []
  },

  // EAST DISTRICT
  {
    id: "SL-013",
    name: "Innovation Hub Pole 1",
    location: "Tech Park Way Blvd",
    zone: "East District",
    lat: 28.6220,
    lng: 77.2250,
    installDate: "2024-04-10",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 120.2,
    temperature: 37.0,
    operatingHours: 2900,
    onOffCyclesToday: 2,
    brightnessLevel: 100,
    voltage: 230,
    currentAmps: 0.52,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(120.2, 37.0, 100),
    failureHistory: []
  },
  {
    id: "SL-014",
    name: "Innovation Hub Pole 2",
    location: "Tech Park Ring Rd",
    zone: "East District",
    lat: 28.6235,
    lng: 77.2265,
    installDate: "2024-04-10",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 119.4,
    temperature: 37.5,
    operatingHours: 2910,
    onOffCyclesToday: 2,
    brightnessLevel: 99,
    voltage: 229,
    currentAmps: 0.52,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(119.4, 37.5, 99),
    failureHistory: []
  },
  {
    id: "SL-015",
    name: "University Gate Light",
    location: "Campus Main Avenue",
    zone: "East District",
    lat: 28.6250,
    lng: 77.2280,
    installDate: "2023-07-15",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 121.7,
    temperature: 38.3,
    operatingHours: 7450,
    onOffCyclesToday: 2,
    brightnessLevel: 97,
    voltage: 228,
    currentAmps: 0.53,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(121.7, 38.3, 97),
    failureHistory: []
  },
  {
    id: "SL-016",
    name: "University Library Road",
    location: "Scholar Walk Lane",
    zone: "East District",
    lat: 28.6265,
    lng: 77.2295,
    installDate: "2023-07-15",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 118.9,
    temperature: 36.9,
    operatingHours: 7420,
    onOffCyclesToday: 2,
    brightnessLevel: 98,
    voltage: 231,
    currentAmps: 0.51,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(118.9, 36.9, 98),
    failureHistory: []
  },
  {
    id: "SL-017",
    name: "East Market Cross Light",
    location: "Commercial Arcade Ave",
    zone: "East District",
    lat: 28.6280,
    lng: 77.2310,
    installDate: "2023-01-20",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 123.1,
    temperature: 39.8,
    operatingHours: 9200,
    onOffCyclesToday: 2,
    brightnessLevel: 95,
    voltage: 226,
    currentAmps: 0.54,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(123.1, 39.8, 95),
    failureHistory: []
  },
  {
    id: "SL-018",
    name: "Market South Light",
    location: "Bazaar Junction 3",
    zone: "East District",
    lat: 28.6295,
    lng: 77.2325,
    installDate: "2023-01-20",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 136.0,
    temperature: 45.2,
    operatingHours: 9250,
    onOffCyclesToday: 3,
    brightnessLevel: 88,
    voltage: 225,
    currentAmps: 0.60,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(136.0, 45.2, 88),
    failureHistory: []
  },

  // WEST DISTRICT
  {
    id: "SL-019",
    name: "Greenfield Park Light 1",
    location: "Meadow Way 12",
    zone: "West District",
    lat: 28.6110,
    lng: 77.1950,
    installDate: "2024-05-01",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 119.0,
    temperature: 36.5,
    operatingHours: 2100,
    onOffCyclesToday: 1,
    brightnessLevel: 100,
    voltage: 232,
    currentAmps: 0.51,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(119.0, 36.5, 100),
    failureHistory: []
  },
  {
    id: "SL-020",
    name: "Greenfield Park Light 2",
    location: "Meadow Way 28",
    zone: "West District",
    lat: 28.6095,
    lng: 77.1935,
    installDate: "2024-05-01",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 120.1,
    temperature: 37.1,
    operatingHours: 2120,
    onOffCyclesToday: 1,
    brightnessLevel: 99,
    voltage: 230,
    currentAmps: 0.52,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(120.1, 37.1, 99),
    failureHistory: []
  },
  {
    id: "SL-021",
    name: "Oak Ridge Avenue Light",
    location: "Oak Ridge & 9th St",
    zone: "West District",
    lat: 28.6080,
    lng: 77.1920,
    installDate: "2023-09-25",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 122.5,
    temperature: 38.4,
    operatingHours: 5900,
    onOffCyclesToday: 2,
    brightnessLevel: 96,
    voltage: 227,
    currentAmps: 0.54,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(122.5, 38.4, 96),
    failureHistory: []
  },
  {
    id: "SL-022",
    name: "Sunset Boulevard Pole 1",
    location: "Sunset Blvd & Hill Rd",
    zone: "West District",
    lat: 28.6065,
    lng: 77.1905,
    installDate: "2023-06-18",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 120.8,
    temperature: 37.6,
    operatingHours: 6800,
    onOffCyclesToday: 2,
    brightnessLevel: 97,
    voltage: 229,
    currentAmps: 0.53,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(120.8, 37.6, 97),
    failureHistory: []
  },
  {
    id: "SL-023",
    name: "Sunset Boulevard Pole 2",
    location: "Sunset Blvd & Valley View",
    zone: "West District",
    lat: 28.6050,
    lng: 77.1890,
    installDate: "2023-06-18",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 118.5,
    temperature: 36.7,
    operatingHours: 6820,
    onOffCyclesToday: 1,
    brightnessLevel: 98,
    voltage: 231,
    currentAmps: 0.51,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(118.5, 36.7, 98),
    failureHistory: []
  },
  {
    id: "SL-024",
    name: "Sunset West Gate Light",
    location: "Sunset Blvd & Outer Bypass",
    zone: "West District",
    lat: 28.6035,
    lng: 77.1875,
    installDate: "2022-11-10",
    lampType: "LED 120W Smart Luminaire",
    powerConsumption: 154.2,
    temperature: 52.4,
    operatingHours: 14850,
    onOffCyclesToday: 8,
    brightnessLevel: 71,
    voltage: 218,
    currentAmps: 0.71,
    maintenanceStatus: "None",
    telemetryHistory: generateHistory(154.2, 52.4, 71, 14, 2.5),
    failureHistory: [
      { date: "2024-08-12", issue: "Photocell calibration", resolvedBy: "Crew Beta" }
    ]
  }
];

const initialFailures = [];

const initialRecentActivity = [];

const initialPredictionsHistory = [
  {
    id: "PRED-101",
    cycle: "Day 21",
    date: "Sep 11, 2026",
    time: "09:15 AM",
    streetlightId: "SL-018",
    location: "Commercial Arcade Ave",
    healthScore: 61,
    riskScore: 87,
    riskLevel: "High",
    predictedProblem: "LED / Power System Degradation",
    reasons: [
      "Abnormal power consumption (136W, +13% above nominal 120W)",
      "High operating temperature (45.2°C exceeds thermal limit)"
    ],
    recommendedAction: "Inspect LED driver and power supply",
    accuracyStatus: "Verified"
  },
  {
    id: "PRED-102",
    cycle: "Day 20",
    date: "Sep 10, 2026",
    time: "10:30 AM",
    streetlightId: "SL-027",
    location: "Sunset Blvd West",
    healthScore: 78,
    riskScore: 48,
    riskLevel: "Medium",
    predictedProblem: "High Operating Temperature",
    reasons: [
      "Operating temperature elevated to 44.5°C",
      "Minor lumen output fluctuation (-5%)"
    ],
    recommendedAction: "Inspect thermal condition",
    accuracyStatus: "Verified"
  },
  {
    id: "PRED-103",
    cycle: "Day 19",
    date: "Sep 9, 2026",
    time: "08:00 AM",
    streetlightId: "SL-034",
    location: "Metro Circle Ring Rd",
    healthScore: 94,
    riskScore: 12,
    riskLevel: "Low",
    predictedProblem: "Normal Operation",
    reasons: [
      "All operational telemetry parameters within optimal nominal limits",
      "Nominal power 120W, Temp 36.8°C"
    ],
    recommendedAction: "Continue routine monitoring",
    accuracyStatus: "Verified"
  }
];

const initialComplaints = [];

const initialFeedback = [];

const initialNotifications = [
  {
    id: "NOTIF-01",
    recipientRole: "admin",
    userId: null,
    title: "High AI Risk Alert: SL-024",
    message: "AI Predictive Engine detected severe power surge and thermal stress on SL-024 (Sunset Blvd). Assigned SL-1 Electrical Lead.",
    type: "critical",
    timestamp: "2026-09-08T08:30:00.000Z",
    read: false,
    link: "/admin/streetlights?id=SL-024"
  },
  {
    id: "NOTIF-02",
    recipientRole: "admin",
    userId: null,
    title: "AI Failure Alert: SL-012",
    message: "High thermal stress detected on SL-012 (Coastal Highway). Assigned SL-2 Thermal Lead.",
    type: "warning",
    timestamp: "2026-09-07T14:15:00.000Z",
    read: false,
    link: "/admin/streetlights?id=SL-012"
  }
];

class Database {
  constructor() {
    this.data = {
      users: [],
      streetlights: [],
      failures: [],
      recentActivity: [],
      predictionsHistory: [],
      complaints: [],
      feedback: [],
      notifications: [],
      simulation: {
        cycle: getDynamicProjectDay(),
        activeScenario: "normal",
        lastAdvancedAt: new Date().toISOString()
      }
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        if (!this.data.streetlights || this.data.streetlights.length === 0) {
  this.data.streetlights = JSON.parse(JSON.stringify(initialStreetlights));
  this.recalculateAllAI();
  this.save();
}
        if (!this.data.failures || this.data.failures.length === 0) {
          this.data.failures = JSON.parse(JSON.stringify(initialFailures));
          this.save();
        }
        if (!this.data.recentActivity || this.data.recentActivity.length === 0) {
          this.data.recentActivity = JSON.parse(JSON.stringify(initialRecentActivity));
          this.save();
        }
        if (!this.data.predictionsHistory || this.data.predictionsHistory.length === 0) {
          this.data.predictionsHistory = JSON.parse(JSON.stringify(initialPredictionsHistory));
          this.save();
        }
        if (!this.data.complaints || this.data.complaints.length === 0) {
          this.data.complaints = JSON.parse(JSON.stringify(initialComplaints));
          this.save();
        }
        if (!this.data.feedback) {
          this.data.feedback = JSON.parse(JSON.stringify(initialFeedback));
          this.save();
        }
        // Always calculate dynamic cycle day based on current calendar date
        this.data.simulation.cycle = getDynamicProjectDay();
      } else {
        this.reset();
      }
    } catch (err) {
      console.error("Error reading database, initializing defaults:", err);
      this.reset();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving database:", err);
    }
  }

  reset() {
    this.data = {
      users: JSON.parse(JSON.stringify(initialUsers)),
      streetlights: JSON.parse(JSON.stringify(initialStreetlights)),
      failures: JSON.parse(JSON.stringify(initialFailures)),
      recentActivity: JSON.parse(JSON.stringify(initialRecentActivity)),
      predictionsHistory: JSON.parse(JSON.stringify(initialPredictionsHistory)),
      complaints: JSON.parse(JSON.stringify(initialComplaints)),
      feedback: JSON.parse(JSON.stringify(initialFeedback)),
      notifications: JSON.parse(JSON.stringify(initialNotifications)),
      simulation: {
        cycle: getDynamicProjectDay(),
        activeScenario: "normal",
        lastAdvancedAt: new Date().toISOString()
      }
    };
    this.recalculateAllAI();
    this.save();
  }

  authenticateUser(identifier, password, role, customName = null) {
    if (!identifier || !password) return null;
    const cleanId = identifier.trim().toLowerCase();
    const hashed = hashPassword(password.trim());

    // Check if user exists in database
    const user = this.data.users.find(u => {
      const matchId = (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId);
      const matchRole = role ? u.role === role : true;
      return matchId && matchRole;
    });

    if (user && user.passwordHash === hashed) {
      return {
        id: user.id,
        name: (customName && customName.trim()) ? customName.trim() : user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        department: user.department || null,
        location: user.location || null
      };
    }
    return null;
  }

  recalculateAllAI() {
    this.data.streetlights = this.data.streetlights.map(light => {
      const aiResult = analyzeStreetlightHealth(light);
      return {
        ...light,
        healthScore: aiResult.healthScore,
        riskLevel: aiResult.riskLevel,
        riskScore: aiResult.riskScore,
        currentStatus: aiResult.currentStatus,
        predictedProblem: aiResult.predictedProblem,
        reasons: aiResult.reasons,
        recommendedAction: aiResult.recommendedAction,
        predictedSL: aiResult.predictedSL,
        priorityScore: aiResult.priorityScore,
        lastUpdated: new Date().toISOString()
      };
    });
  }

  getStreetlights() {
    this.recalculateAllAI();
    return this.data.streetlights;
  }

  getStreetlightById(id) {
    this.recalculateAllAI();
    return this.data.streetlights.find(l => l.id === id);
  }

  updateStreetlight(id, fields) {
    const idx = this.data.streetlights.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.data.streetlights[idx] = { ...this.data.streetlights[idx], ...fields };
      this.recalculateAllAI();
      this.save();
      return this.data.streetlights[idx];
    }
    return null;
  }

  getFailures() {
    if (!this.data.failures) this.data.failures = JSON.parse(JSON.stringify(initialFailures));
    return this.data.failures;
  }

  resolveFailure(id, isResolved) {
    const failures = this.getFailures();
    const failure = failures.find(f => f.id === id);
    if (!failure) return null;

    const nowIso = new Date().toISOString();

    if (isResolved) {
      failure.status = "Resolved";
      failure.resolvedAt = nowIso;

      // Update associated streetlight telemetry to nominal healthy state
      const light = this.data.streetlights.find(l => l.id === failure.streetlightId);
      if (light) {
        light.maintenanceStatus = "Resolved";
        light.powerConsumption = 120.0;
        light.temperature = 37.5;
        light.onOffCyclesToday = 1;
        light.brightnessLevel = 98;
        if (!light.failureHistory) light.failureHistory = [];
        light.failureHistory.unshift({
          date: nowIso.split("T")[0],
          issue: `Resolved: ${failure.failureName} (${failure.predictedSL.name})`,
          resolvedBy: failure.predictedSL.crew
        });
      }

      // Add to recent activity timeline
      this.addRecentActivity({
        type: "resolution",
        title: `SL Action Confirmed: ${failure.id} (${failure.streetlightId})`,
        description: `${failure.predictedSL.name} completed recommended action. Telemetry restored to normal.`,
        riskLevel: "Resolved"
      });

      this.addNotification({
        recipientRole: "admin",
        title: `SL Action Resolved: ${failure.id}`,
        message: `${failure.predictedSL.name} successfully resolved ${failure.failureName} on ${failure.streetlightId}.`,
        type: "success"
      });

    } else {
      failure.status = "Pending Resolution";

      this.addRecentActivity({
        type: "pending",
        title: `SL Action Pending: ${failure.id} (${failure.streetlightId})`,
        description: `Action flagged as Not Resolved by user. ${failure.predictedSL.name} resolution remains pending.`,
        riskLevel: failure.riskLevel
      });

      this.addNotification({
        recipientRole: "admin",
        title: `SL Action Pending: ${failure.id}`,
        message: `Resolution for ${failure.id} on ${failure.streetlightId} marked as Pending Resolution.`,
        type: "warning"
      });
    }

    this.recalculateAllAI();
    this.save();

    return {
      success: true,
      failure,
      message: isResolved ? "SL action confirmed — Dashboard updated." : "Status updated to Pending Resolution."
    };
  }

  getRecentActivity() {
    if (!this.data.recentActivity) this.data.recentActivity = JSON.parse(JSON.stringify(initialRecentActivity));
    return this.data.recentActivity;
  }

  addRecentActivity(activity) {
    if (!this.data.recentActivity) this.data.recentActivity = [];
    const newAct = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      ...activity
    };
    this.data.recentActivity.unshift(newAct);
    this.save();
    return newAct;
  }

  getSystemStats() {
    const lights = this.getStreetlights();
    const failures = this.getFailures();

    const total = lights.length;
    const healthy = lights.filter(l => l.currentStatus === "Working Normally").length;
    const attention = lights.filter(l => l.currentStatus === "Needs Attention").length;
    const critical = lights.filter(l => l.currentStatus === "Critical").length;

    const activeFailures = failures.filter(f => f.status === "Active");
    const pendingResolution = failures.filter(f => f.status === "Pending Resolution");
    const resolvedFailures = failures.filter(f => f.status === "Resolved");
    
    // Count resolved today
    const todayStr = new Date().toISOString().split("T")[0];
    const resolvedToday = resolvedFailures.filter(f => f.resolvedAt && f.resolvedAt.startsWith(todayStr)).length;

    // Overall Risk Score calculation (avg risk score of all lights)
    const avgRiskScore = Math.round(lights.reduce((acc, l) => acc + (l.riskScore || 0), 0) / (total || 1));

    return {
      total,
      healthy,
      attention,
      critical,
      activeFailuresCount: activeFailures.length + pendingResolution.length,
      activeOnlyCount: activeFailures.length,
      pendingOnlyCount: pendingResolution.length,
      resolvedToday,
      totalResolved: resolvedFailures.length,
      overallRiskScore: avgRiskScore
    };
  }

  getPredictionsHistory() {
    if (!this.data.predictionsHistory) this.data.predictionsHistory = [];
    return this.data.predictionsHistory;
  }

  getComplaints(userId = null) {
    if (!this.data.complaints) this.data.complaints = [];
    if (userId) {
      return this.data.complaints.filter(c => c.userId === userId || c.userEmail === userId);
    }
    return this.data.complaints;
  }

  addComplaint(complaintData) {
    if (!this.data.complaints) this.data.complaints = [];
    const newId = `CMP-${Date.now().toString().slice(-4)}`;
    
    let permanentImageUrl = null;
    if (complaintData.imageUrl) {
      permanentImageUrl = saveImagePermanently(complaintData.imageUrl, newId.toLowerCase());
    }

    const complaint = {
      id: newId,
      streetlightId: complaintData.streetlightId,
      location: complaintData.location || "Downtown Ward",
      problemType: complaintData.problemType,
      description: complaintData.description || "",
      userName: complaintData.userName || "Citizen User",
      userEmail: complaintData.userEmail || "user@citylight.gov",
      userId: complaintData.userId || "usr_01",
      imageUrl: permanentImageUrl,
      status: "Submitted",
      adminResponse: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.complaints.unshift(complaint);

    // Add recent activity
    this.addRecentActivity({
      type: "complaint",
      title: `Citizen Complaint Logged: ${complaint.id}`,
      description: `Reported ${complaint.problemType} on ${complaint.streetlightId} by ${complaint.userName}.`,
      riskLevel: "Medium"
    });

    // Notify Admin
    this.addNotification({
      recipientRole: "admin",
      title: `New Citizen Complaint: ${complaint.id}`,
      message: `${complaint.userName} reported "${complaint.problemType}" for ${complaint.streetlightId}.`,
      type: "warning"
    });

    this.save();
    return complaint;
  }

  updateComplaintStatus(id, { status, adminResponse, streetlightStatus, maintenanceStatus, repairNote }) {
    if (!this.data.complaints) return null;
    const complaint = this.data.complaints.find(c => c.id === id);
    if (!complaint) return null;

    if (status) complaint.status = status;
    if (adminResponse !== undefined) complaint.adminResponse = adminResponse;
    if (streetlightStatus) complaint.streetlightStatus = streetlightStatus;
    if (maintenanceStatus) complaint.maintenanceStatus = maintenanceStatus;
    complaint.updatedAt = new Date().toISOString();

    // If streetlight update details provided, update the linked streetlight in database
    if (complaint.streetlightId) {
      const updateFields = {};
      if (streetlightStatus) updateFields.currentStatus = streetlightStatus;
      if (maintenanceStatus) updateFields.maintenanceStatus = maintenanceStatus;

      if (status === "Resolved" || streetlightStatus === "Working Normally") {
        updateFields.currentStatus = "Working Normally";
        updateFields.maintenanceStatus = maintenanceStatus || "Resolved";
        updateFields.powerConsumption = 120.0;
        updateFields.temperature = 37.5;
        updateFields.brightnessLevel = 98;
        updateFields.onOffCyclesToday = 1;
      }

      if (Object.keys(updateFields).length > 0) {
        this.updateStreetlight(complaint.streetlightId, updateFields);
      }
    }

    // Notify User
    const slInfo = streetlightStatus ? ` (Streetlight Status: ${streetlightStatus})` : "";
    this.addNotification({
      recipientRole: "user",
      userId: complaint.userId,
      title: `Complaint Updated (${complaint.id})`,
      message: `Status: "${complaint.status}"${slInfo}. ${adminResponse ? `Response: ${adminResponse}` : ""}`,
      type: status === "Resolved" ? "success" : "info"
    });

    this.save();
    return complaint;
  }

  getFeedback(userId = null, streetlightId = null) {
    if (!this.data.feedback) this.data.feedback = [];
    let list = this.data.feedback;
    if (userId) {
      list = list.filter(f => f.userId === userId || f.userEmail === userId);
    }
    if (streetlightId && streetlightId !== "all") {
      list = list.filter(f => f.streetlightId === streetlightId);
    }
    return list;
  }

  addFeedback(fb) {
    if (!this.data.feedback) this.data.feedback = [];
    
    // Look up streetlight to attach location if available
    let location = fb.streetlightLocation || null;
    if (fb.streetlightId) {
      const light = this.getStreetlightById(fb.streetlightId);
      if (light) {
        location = `${light.name} (${light.location})`;
      }
    }

    const newFb = {
      id: `FB-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      ...fb,
      rating: Number(fb.rating),
      streetlightId: fb.streetlightId || "SL-001",
      streetlightLocation: location || "Municipal Lighting Zone"
    };
    this.data.feedback.unshift(newFb);

    // Notify Admin of Citizen Feedback
    this.addNotification({
      recipientRole: "admin",
      title: `New Citizen Feedback on ${newFb.streetlightId} (${newFb.rating} ⭐)`,
      message: `${newFb.userName} rated ${newFb.streetlightId}: "${newFb.comment.slice(0, 50)}${newFb.comment.length > 50 ? '...' : ''}"`,
      type: "info"
    });

    this.save();
    return newFb;
  }

  getNotifications(role = null, userId = null) {
    return this.data.notifications.filter(n => {
      if (role === "admin") return n.recipientRole === "admin";
      if (role === "user") {
        return n.recipientRole === "user" && (!n.userId || n.userId === userId || userId === "usr_01" || userId === "user@citylight.gov");
      }
      return true;
    });
  }

  markNotificationsRead(role = null, userId = null) {
    this.data.notifications.forEach(n => {
      if (!role || n.recipientRole === role) {
        if (!userId || n.userId === userId) {
          n.read = true;
        }
      }
    });
    this.save();
    return true;
  }

  addNotification(notif) {
    const newNotif = {
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      read: false,
      timestamp: new Date().toISOString(),
      ...notif
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  getSimulationState() {
    this.data.simulation.cycle = getDynamicProjectDay();
    return this.data.simulation;
  }

  setSimulationState(state) {
    this.data.simulation = { ...this.data.simulation, ...state };
    this.save();
    return this.data.simulation;
  }
}

export const db = new Database();
