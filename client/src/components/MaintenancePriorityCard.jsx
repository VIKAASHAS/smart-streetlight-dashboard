import React from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, User, ChevronRight, Wrench, ShieldAlert } from "lucide-react";
import { HealthBadge, RiskBadge } from "./StatusBadges";

export const MaintenancePriorityCard = ({ streetlights = [], onSelectLight }) => {
  const prioritized = [...streetlights]
    .filter(l => l.riskScore >= 20 || l.hasUserComplaint || l.currentStatus !== "Working Normally")
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-full transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Today's Maintenance Priority</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              AI + User Triaged
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-ranked by AI failure probability & active citizen reports
          </p>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {prioritized.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            No urgent maintenance required. All poles within safe threshold.
          </div>
        ) : (
          prioritized.map((light, index) => {
            const rankBg = index === 0 ? "bg-rose-500 text-white" : index === 1 ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300";

            return (
              <div
                key={light.id}
                onClick={() => onSelectLight(light)}
                className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 shadow-sm ${rankBg}`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{light.id}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">({light.zone})</span>
                      {light.hasUserComplaint && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <User className="w-2.5 h-2.5" /> User Complaint
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1 font-medium">
                      {light.reasons?.[0] || light.predictedProblem}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <HealthBadge score={light.healthScore} status={light.currentStatus} size="sm" />
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
        <span>Dynamic weighting: 60% Telemetry Anomaly + 40% Citizen Report</span>
        <span className="font-semibold text-brand-600 dark:text-brand-400">Updated Real-Time</span>
      </div>
    </div>
  );
};
