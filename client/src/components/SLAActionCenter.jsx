import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Clock, ArrowRight, Activity, Wrench, Sparkles, Check, RefreshCw } from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

export const SLAActionCenter = () => {
  const { failures, recentActivity, handleSLAction } = useSimulation();
  const [toastMessage, setToastMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const activeFailures = failures.filter(f => f.status !== "Resolved");
  const resolvedFailures = failures.filter(f => f.status === "Resolved");

  const handleAction = async (failureId, isResolved) => {
    setProcessingId(failureId);
    const result = await handleSLAction(failureId, isResolved);
    setProcessingId(null);

    if (result && result.message) {
      setToastMessage(result.message);
      setTimeout(() => {
        setToastMessage("");
      }, 4000);
    }
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case "High":
        return "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800";
      case "Medium":
        return "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      default:
        return "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending Resolution":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-400/30";
      case "Resolved":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-400/30";
      default:
        return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-400/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[11px] bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">Updated Real-Time</span>
        </div>
      )}

      {/* Main Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">AI-Predicted SL Action Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Active Failure & SL Triage Queue
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review AI anomaly detections, recommended Service Lead (SL) assignments, and confirm resolution status.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 font-extrabold text-xs flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>{activeFailures.length} Active Failures</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{resolvedFailures.length} Resolved</span>
          </span>
        </div>
      </div>

      {/* Active Failures Queue */}
      <div className="space-y-4">
        {activeFailures.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">All Failure Items Resolved!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No active or pending failure alerts. The AI predictive engine continuously monitors streetlights for anomalies.
            </p>
          </div>
        ) : (
          activeFailures.map(failure => (
            <div
              key={failure.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden"
            >
              {/* Top Row: ID, Risk, Status, Detection Time */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-slate-900 dark:text-white text-sm tracking-wide">{failure.id}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">({failure.streetlightId} • {failure.streetlightName})</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getRiskBadge(failure.riskLevel)}`}>
                    {failure.riskLevel} Risk ({failure.riskScore}%)
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${getStatusBadge(failure.status)}`}>
                    Status: {failure.status}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Detected: {new Date(failure.detectedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Middle Grid: Anomaly Details & AI-Predicted SL */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Left: Failure Details */}
                <div className="md:col-span-7 space-y-2">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {failure.failureName}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    <strong className="text-slate-800 dark:text-slate-200">Recommended Action:</strong> {failure.recommendedAction}
                  </p>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Location: {failure.location} ({failure.zone})
                  </div>
                </div>

                {/* Center: AI-Predicted SL Box (No manual dropdown) */}
                <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> AI-Predicted SL Assignment
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Auto-Assigned</span>
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    {failure.predictedSL?.name || "SL-1: Electrical Lead"}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Assigned Unit: {failure.predictedSL?.crew || "Electrical Crew Alpha"}
                  </div>
                </div>
              </div>

              {/* Bottom Action Row: Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Confirm maintenance resolution performed by <strong className="text-slate-800 dark:text-slate-200">{failure.predictedSL?.name}</strong>:
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={processingId === failure.id}
                    onClick={() => handleAction(failure.id, true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>✅ Resolved</span>
                  </button>

                  <button
                    type="button"
                    disabled={processingId === failure.id}
                    onClick={() => handleAction(failure.id, false)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 font-extrabold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>❌ Not Resolved</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Grid Row: Recently Resolved & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Recently Resolved Section */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Recently Resolved</span>
            </h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
              {resolvedFailures.length} Items
            </span>
          </div>

          {resolvedFailures.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No failures resolved yet in this session. Click "✅ Resolved" on active failures above to confirm resolution.
            </div>
          ) : (
            <div className="space-y-3">
              {resolvedFailures.map(rf => (
                <div
                  key={rf.id}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <span>{rf.id}</span>
                      <span className="text-slate-400">({rf.streetlightId})</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold">
                        Resolved
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{rf.failureName} • {rf.predictedSL?.name}</p>
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    <div>{rf.resolvedAt ? new Date(rf.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}</div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Telemetry Restored</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>Recent Activity Timeline</span>
            </h3>
            <span className="text-[11px] text-slate-400">Real-Time Audit</span>
          </div>

          <div className="space-y-3">
            {recentActivity.slice(0, 5).map(act => (
              <div
                key={act.id}
                className="p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs"
              >
                <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                  act.type === "resolution"
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                    : act.type === "pending"
                    ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                    : "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
                }`}>
                  <Activity className="w-4 h-4" />
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="font-extrabold text-slate-900 dark:text-white text-xs">{act.title}</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{act.description}</p>
                </div>

                <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
