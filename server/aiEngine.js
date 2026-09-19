/**
 * AI-Enabled Predictive Maintenance Engine for Smart Streetlight
 * 
 * Analyzes operational telemetry:
 * - Power Consumption (W)
 * - Operating Temperature (°C)
 * - Daily ON/OFF Cycles
 * - Luminous Output / Brightness (%)
 * - Cumulative Operating Hours
 * 
 * Outputs:
 * - Health Score (0-100)
 * - Risk Level (Low, Medium, High)
 * - Failure Probability & Risk Score (0-100)
 * - AI-Predicted SL (Service Lead)
 * - Actionable Maintenance Recommendation
 * - Priority Ranking Score
 */

export function analyzeStreetlightHealth(light, activeComplaints = []) {
  const NOMINAL_POWER = 120; // Watts
  const NOMINAL_TEMP = 38;   // Celsius
  const NOMINAL_CYCLES = 2;   // Max normal ON/OFF cycles per day
  const NOMINAL_BRIGHTNESS = 100; // %

  let healthScore = 100;
  let riskScore = 0; // 0 to 100
  const reasons = [];
  let recommendedAction = "No maintenance required. System operating normally.";

  // 1. Power Consumption Analysis
  const powerDiff = light.powerConsumption - NOMINAL_POWER;
  const powerDeviationPct = (powerDiff / NOMINAL_POWER) * 100;

  if (powerDeviationPct > 20) {
    const penalty = Math.min(35, Math.round(powerDeviationPct * 1.2));
    healthScore -= penalty;
    riskScore += penalty * 1.1;
    reasons.push(`Abnormal power consumption (${light.powerConsumption}W, +${Math.round(powerDeviationPct)}% above nominal 120W)`);
  } else if (powerDeviationPct > 10) {
    healthScore -= 12;
    riskScore += 15;
    reasons.push(`Slightly elevated power draw (${light.powerConsumption}W)`);
  } else if (powerDeviationPct < -25) {
    healthScore -= 20;
    riskScore += 22;
    reasons.push(`Low power draw (${light.powerConsumption}W), luminaire driver degradation`);
  }

  // 2. Temperature Analysis
  if (light.temperature >= 52) {
    const tempPenalty = Math.min(30, (light.temperature - 42) * 2.5);
    healthScore -= tempPenalty;
    riskScore += tempPenalty * 1.1;
    reasons.push(`High operating temperature (${light.temperature}°C exceeds threshold 45°C)`);
  } else if (light.temperature >= 46) {
    healthScore -= 12;
    riskScore += 14;
    reasons.push(`Elevated operating temperature (${light.temperature}°C)`);
  }

  // 3. Frequent ON/OFF Switching Behavior
  if (light.onOffCyclesToday >= 6) {
    const cyclePenalty = Math.min(25, (light.onOffCyclesToday - NOMINAL_CYCLES) * 3.5);
    healthScore -= cyclePenalty;
    riskScore += cyclePenalty * 1.1;
    reasons.push(`Frequent ON/OFF behavior (${light.onOffCyclesToday} cycles today, faulty sensor/relay)`);
  } else if (light.onOffCyclesToday >= 4) {
    healthScore -= 10;
    riskScore += 10;
    reasons.push(`Mild ON/OFF cycle fluctuation (${light.onOffCyclesToday} cycles)`);
  }

  // 4. Luminous Efficiency / Brightness Output
  if (light.brightnessLevel <= 70) {
    healthScore -= 20;
    riskScore += 20;
    reasons.push(`Reduced luminous output (Operating at ${light.brightnessLevel}% brightness)`);
  } else if (light.brightnessLevel <= 85) {
    healthScore -= 8;
    riskScore += 10;
    reasons.push(`Slight brightness degradation (${light.brightnessLevel}%)`);
  }

  // 5. Operating Hours / Aging Factor
  if (light.operatingHours > 18000) {
    healthScore -= 10;
    riskScore += 8;
    reasons.push(`High cumulative runtime (${light.operatingHours.toLocaleString()} hrs nearing threshold)`);
  }

  // 6. User Complaints Cross-Correlation
  const lightComplaints = activeComplaints.filter(
    c => c.streetlightId === light.id && c.status !== "Resolved"
  );

  let hasUserComplaint = false;
  let complaintSummary = "";
  if (lightComplaints.length > 0) {
    hasUserComplaint = true;
    const latestC = lightComplaints[0];
    complaintSummary = `${latestC.problemType} reported by citizen`;
    healthScore -= 10;
    riskScore += 15;
    reasons.push(`Citizen complaint registered: "${latestC.problemType}" (${latestC.description})`);
  }

  // Clamp health and risk scores
  healthScore = Math.max(8, Math.min(100, Math.round(healthScore)));
  riskScore = Math.max(2, Math.min(98, Math.round(riskScore)));

  // Categorical Status & Risk Level
  let currentStatus = "Working Normally";
  let riskLevel = "Low";

  if (healthScore < 60 || riskScore >= 65) {
    currentStatus = "Critical";
    riskLevel = "High";
  } else if (healthScore < 90 || riskScore >= 30) {
    currentStatus = "Needs Attention";
    riskLevel = "Medium";
  } else {
    currentStatus = "Working Normally";
    riskLevel = "Low";
  }

  // Determine AI-Predicted Service Lead (SL) & Recommended Action
  let predictedSL = { id: "SL-5", name: "SL-5: Structural Lead", crew: "Structural Lead (Crew Epsilon)" };

  if (powerDeviationPct > 10 || powerDeviationPct < -20) {
    predictedSL = { id: "SL-1", name: "SL-1: Electrical Lead", crew: "Electrical Lead (Crew Alpha)" };
    recommendedAction = "Inspect LED driver circuit, verify voltage line, and replace surge protector module.";
  } else if (light.temperature >= 46) {
    predictedSL = { id: "SL-2", name: "SL-2: Thermal Lead", crew: "Thermal Lead (Crew Beta)" };
    recommendedAction = "Inspect thermal heatsink, apply thermal paste, and clear ventilation blockages.";
  } else if (light.onOffCyclesToday >= 4) {
    predictedSL = { id: "SL-3", name: "SL-3: Sensor Lead", crew: "Sensor Lead (Crew Gamma)" };
    recommendedAction = "Recalibrate photocell light sensor and replace malfunctioning switching relay.";
  } else if (light.brightnessLevel <= 85) {
    predictedSL = { id: "SL-4", name: "SL-4: Optics Lead", crew: "Optics Lead (Crew Delta)" };
    recommendedAction = "Clean optical diffuser lens, inspect LED cluster, and replace degraded diode array.";
  } else {
    predictedSL = { id: "SL-5", name: "SL-5: Structural Lead", crew: "Structural Lead (Crew Epsilon)" };
    recommendedAction = "Perform routine structural pole check and inspect base access panel grounding.";
  }

  let predictedProblem = "None (Optimal)";
  if (reasons.length > 0) {
    predictedProblem = reasons[0].split("(")[0].trim();
  }

  const priorityScore = riskScore + (hasUserComplaint ? 25 : 0);

  return {
    healthScore,
    riskLevel,
    riskScore,
    currentStatus,
    predictedProblem,
    reasons: reasons.length > 0 ? reasons : ["All operational indicators within optimal tolerance ranges"],
    recommendedAction,
    predictedSL,
    hasUserComplaint,
    complaintSummary,
    priorityScore,
    analyzedAt: new Date().toISOString()
  };
}
