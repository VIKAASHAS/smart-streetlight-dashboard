import { db } from "./db.js";
import { analyzeStreetlightHealth } from "./aiEngine.js";

/**
 * Simulation Engine for Smart Streetlight Network
 * Updates data across discrete simulation cycles (e.g. Daily cycles)
 * Simulates natural drift, load changes, environmental fluctuations, and controlled degradation scenarios.
 */

export function advanceSimulationCycle(scenario = null) {
  const currentSim = db.getSimulationState();
  const nextCycle = currentSim.cycle + 1;
  const activeScenario = scenario || currentSim.activeScenario || "normal";

  const lights = db.getStreetlights();
  const complaints = db.getComplaints();

  const updatedLights = lights.map(light => {
    let power = light.powerConsumption;
    let temp = light.temperature;
    let brightness = light.brightnessLevel;
    let cycles = light.onOffCyclesToday;
    let hours = light.operatingHours + 12; // 12 hours of night operation per day

    // Base subtle environmental noise
    power += (Math.random() - 0.5) * 1.5;
    temp += (Math.random() - 0.5) * 1.2;
    brightness = Math.min(100, Math.max(50, brightness + (Math.random() - 0.5) * 0.8));
    cycles = Math.max(1, Math.min(3, Math.round(cycles + (Math.random() - 0.5))));

    // Scenario specific gradual progression
    if (activeScenario === "surge_sl24" && light.id === "SL-024") {
      power = Math.min(168, power + 3.2);
      temp = Math.min(58, temp + 1.4);
      brightness = Math.max(62, brightness - 1.8);
      cycles = Math.min(12, cycles + 1);
    } else if (activeScenario === "thermal_sl12" && light.id === "SL-012") {
      temp = Math.min(62, temp + 2.8);
      power = Math.min(148, power + 1.9);
      brightness = Math.max(70, brightness - 1.2);
    } else if (activeScenario === "flicker_sl07" && light.id === "SL-007") {
      cycles = Math.min(14, cycles + 2);
      power = Math.min(142, power + 2.1);
      temp = Math.min(49, temp + 1.1);
    } else if (activeScenario === "flicker_sl18" && light.id === "SL-018") {
      power = Math.min(152, power + 2.5);
      temp = Math.min(48, temp + 1.0);
    } else if (activeScenario === "repair_all") {
      power = 120.0 + (Math.random() - 0.5) * 2;
      temp = 37.0 + (Math.random() - 0.5) * 2;
      brightness = 99;
      cycles = 2;
    }

    // Append to telemetry history (keep last 14 records)
    const history = light.telemetryHistory || [];
    const dateLabel = `Cycle ${nextCycle}`;
    const newHistory = [
      ...history.slice(-13),
      {
        date: dateLabel,
        power: Math.round(power * 10) / 10,
        temperature: Math.round(temp * 10) / 10,
        brightness: Math.round(brightness),
        onOffCycles: cycles
      }
    ];

    return {
      ...light,
      powerConsumption: Math.round(power * 10) / 10,
      temperature: Math.round(temp * 10) / 10,
      brightnessLevel: Math.round(brightness),
      onOffCyclesToday: cycles,
      operatingHours: hours,
      telemetryHistory: newHistory
    };
  });

  // Save updated lights
  db.data.streetlights = updatedLights;
  db.recalculateAllAI();

  // Find top risk light in this new cycle and record in predictions history if critical
  const analyzed = db.getStreetlights();
  const highestRisk = [...analyzed].sort((a, b) => b.riskScore - a.riskScore)[0];

  if (highestRisk && highestRisk.riskLevel === "High") {
    db.data.predictionsHistory.unshift({
      id: `PRED-${Math.floor(100 + Math.random() * 900)}`,
      cycle: `Day ${nextCycle}`,
      date: new Date().toISOString().split("T")[0],
      streetlightId: highestRisk.id,
      location: highestRisk.location,
      riskLevel: highestRisk.riskLevel,
      predictedProblem: highestRisk.predictedProblem,
      riskScore: highestRisk.riskScore,
      actualOutcome: `Simulated continuous load drift - ${highestRisk.reasons[0] || "Degradation trend"}`,
      accuracyStatus: "Verified"
    });

    // Notify Admin of High Risk in this cycle
    db.addNotification({
      recipientRole: "admin",
      userId: null,
      title: `AI High Risk Predicted: ${highestRisk.id} (${highestRisk.riskScore}% Risk)`,
      message: `${highestRisk.name} in ${highestRisk.zone}: ${highestRisk.reasons[0]}`,
      type: "critical",
      link: `/admin/streetlights?id=${highestRisk.id}`
    });
  }

  // Update simulation state
  db.setSimulationState({
    cycle: nextCycle,
    activeScenario,
    lastAdvancedAt: new Date().toISOString()
  });

  db.save();

  return {
    cycle: nextCycle,
    activeScenario,
    streetlights: db.getStreetlights(),
    summary: {
      total: analyzed.length,
      healthy: analyzed.filter(l => l.currentStatus === "Working Normally").length,
      attention: analyzed.filter(l => l.currentStatus === "Needs Attention").length,
      critical: analyzed.filter(l => l.currentStatus === "Critical").length,
      highRiskCount: analyzed.filter(l => l.riskLevel === "High").length
    }
  };
}
