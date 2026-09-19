import React, { useState } from "react";
import { Sparkles, AlertTriangle, Zap, Thermometer, RefreshCw, Sun, ChevronRight } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useSimulation } from "../../context/SimulationContext";
import { useTheme } from "../../context/ThemeContext";
import { RiskBadge } from "../../components/StatusBadges";
import { StreetlightDetailModal } from "../../components/StreetlightDetailModal";

export const AIPredictions = () => {
  const { streetlights } = useSimulation();
  const { isDark } = useTheme();
  const [modalLight, setModalLight] = useState(null);

  const highRiskCount = streetlights.filter(l => l.riskLevel === "High").length;
  const mediumRiskCount = streetlights.filter(l => l.riskLevel === "Medium").length;
  const lowRiskCount = streetlights.filter(l => l.riskLevel === "Low").length;

  const pieData = [
    { name: "Low Risk (Healthy)", value: lowRiskCount, color: "#10b981" },
    { name: "Medium Risk (Attention)", value: mediumRiskCount, color: "#f59e0b" },
    { name: "High Risk (Critical)", value: highRiskCount, color: "#ef4444" }
  ];

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalPoles = pieData.reduce((sum, item) => sum + item.value, 0);
      const count = data.value;
      const percentage = totalPoles > 0 ? ((count / totalPoles) * 100).toFixed(1) : "0.0";
      
      let categoryName = data.name;
      if (data.name.includes("Low")) categoryName = "Low Risk";
      else if (data.name.includes("Medium")) categoryName = "Medium Risk";
      else if (data.name.includes("High")) categoryName = "High Risk";

      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 rounded-2xl shadow-xl text-xs space-y-1.5 min-w-[140px]">
          <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
            <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: data.color }} />
            <span>{categoryName}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-slate-700 dark:text-slate-300 font-bold pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <span>{count} {count === 1 ? "Pole" : "Poles"}</span>
            <span className="font-black text-brand-600 dark:text-brand-400">{percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const atRiskLights = [...streetlights]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 8);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Explainable Machine Learning Model
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          AI Predictive Maintenance Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Continuous anomaly detection evaluating power surges, thermal dissipation, photocell cycles, and lumen decay.
        </p>
      </div>

      {/* Model Overview & Feature Weighting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Fleet Risk Distribution</h3>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low Risk</span>
              <strong className="text-slate-800 dark:text-slate-200">{lowRiskCount} Poles</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium Risk</span>
              <strong className="text-slate-800 dark:text-slate-200">{mediumRiskCount} Poles</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High Risk</span>
              <strong className="text-slate-800 dark:text-slate-200">{highRiskCount} Poles</strong>
            </div>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Predictive Feature Anomaly Weights</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            How operational parameters contribute to the calculated Failure Probability Score:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Power Consumption Surge
                </span>
                <span className="text-xs font-black text-amber-700 dark:text-amber-300">35% Weight</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Deviations above nominal 120W indicate driver degradation, short circuit stress, or capacitor breakdown.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Thermal Stress Factor
                </span>
                <span className="text-xs font-black text-rose-700 dark:text-rose-300">25% Weight</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Operating temperatures above 48°C degrade LED semiconductor lifespan and heatsink thermal paste.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Excessive ON/OFF Cycles
                </span>
                <span className="text-xs font-black text-blue-700 dark:text-blue-300">20% Weight</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Rapid cycling (&gt;4 times/day) pinpoints erratic dusk-to-dawn photocell relays and line voltage noise.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Luminous Output Decay
                </span>
                <span className="text-xs font-black text-purple-700 dark:text-purple-300">20% Weight</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Lumen degradation below 80% marks irreversible phosphor aging and luminaire optical dirt accumulation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* High-Risk Predictive Radar Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Poles Exhibiting Elevated Failure Indicators</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {atRiskLights.map(light => {
            const isHigh = light.riskLevel === "High";
            return (
              <div
                key={light.id}
                onClick={() => setModalLight(light)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                  isHigh 
                    ? "bg-rose-50/40 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60" 
                    : "bg-slate-50/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">{light.id}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">({light.zone})</span>
                  </div>
                  <RiskBadge risk={light.riskLevel} size="sm" />
                </div>

                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className={`w-3.5 h-3.5 ${isHigh ? "text-rose-500" : "text-amber-500"}`} />
                  <span>{light.reasons?.[0] || light.predictedProblem}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <span>Health: <strong className="text-slate-800 dark:text-slate-200">{light.healthScore}/100</strong></span>
                  <span>Power: <strong>{light.powerConsumption}W</strong></span>
                  <span>Temp: <strong>{light.temperature}°C</strong></span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalLight && (
        <StreetlightDetailModal
          light={modalLight}
          onClose={() => setModalLight(null)}
        />
      )}
    </div>
  );
};
