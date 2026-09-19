import React from "react";
import { Sparkles, AlertTriangle, ShieldCheck, ArrowRight, Zap, Thermometer, RefreshCw, Wrench } from "lucide-react";
import { HealthGauge } from "./HealthGauge";
import { RiskBadge } from "./StatusBadges";

export const AIHeroCard = ({ spotlight, onInspect, onAssignMaintenance }) => {
  if (!spotlight) return null;

  const isHighRisk = spotlight.riskLevel === "High";
  const isMediumRisk = spotlight.riskLevel === "Medium";

  return (
    <div className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 shadow-md ${
      isHighRisk
        ? "bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-white dark:to-slate-900 border-rose-200 dark:border-rose-900/60"
        : isMediumRisk
        ? "bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-white dark:to-slate-900 border-amber-200 dark:border-amber-900/60"
        : "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-slate-900 border-emerald-200 dark:border-emerald-900/60"
    }`}>
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-gradient-to-br from-rose-400/20 to-amber-400/20 blur-2xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
        <div className="flex-1">
          {/* Badge & Title */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 dark:bg-slate-800 text-white shadow-sm border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              AI PREDICTED FAILURE SPOTLIGHT
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Cycle Prediction • {new Date(spotlight.lastUpdated || Date.now()).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Streetlight {spotlight.id}
            </h2>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              {spotlight.zone} • {spotlight.location}
            </span>
            <RiskBadge risk={spotlight.riskLevel} />
          </div>

          {/* Core Findings */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Possible Problem Identified
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <AlertTriangle className={`w-4 h-4 shrink-0 ${isHighRisk ? "text-rose-500" : "text-amber-500"}`} />
                {spotlight.reasons?.[0] || spotlight.predictedProblem}
              </p>
            </div>

            <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Recommended Action
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 shrink-0 text-brand-600 dark:text-brand-400" />
                {spotlight.recommendedAction}
              </p>
            </div>
          </div>

          {/* Telemetry Snapshot */}
          <div className="mt-4 flex items-center gap-4 flex-wrap text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Power: <strong>{spotlight.powerConsumption}W</strong></span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span>Temp: <strong>{spotlight.temperature}°C</strong></span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              <span>Switching: <strong>{spotlight.onOffCyclesToday} cycles/day</strong></span>
            </div>
            {spotlight.hasUserComplaint && (
              <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 px-2.5 py-1 rounded-lg font-semibold animate-pulse">
                Citizen Complaint Linked
              </span>
            )}
          </div>
        </div>

        {/* Gauge & Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 bg-white/60 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shrink-0">
          <div className="text-center">
            <HealthGauge score={spotlight.healthScore} size={90} strokeWidth={8} />
            <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Health Score</span>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={() => onInspect(spotlight)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span>Inspect Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAssignMaintenance(spotlight)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-slate-700 hover:bg-brand-100 dark:hover:bg-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Schedule Maintenance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
