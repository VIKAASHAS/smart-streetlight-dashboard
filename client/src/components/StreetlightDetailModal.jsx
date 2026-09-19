import React, { useState } from "react";
import { X, Zap, Thermometer, Clock, RefreshCw, Sun, AlertTriangle, CheckCircle2, User, Wrench, ShieldAlert, Eye } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { HealthBadge, RiskBadge, ComplaintStatusBadge } from "./StatusBadges";
import { HealthGauge } from "./HealthGauge";
import { useSimulation } from "../context/SimulationContext";
import { useTheme } from "../context/ThemeContext";

export const StreetlightDetailModal = ({ light, onClose }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("telemetry");
  const [modalImage, setModalImage] = useState(null);

  if (!light) return null;

  const history = light.telemetryHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-2xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Streetlight {light.id}</h2>
                <HealthBadge score={light.healthScore} status={light.currentStatus} />
                <RiskBadge risk={light.riskLevel} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {light.name} • {light.location} ({light.zone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-6 text-sm font-semibold bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === "telemetry"
                ? "border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Telemetry & Sensor Trends
          </button>
          <button
            onClick={() => setActiveTab("ai-analysis")}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === "ai-analysis"
                ? "border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            AI Explainability & Risk
          </button>
          <button
            onClick={() => setActiveTab("complaints")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "complaints"
                ? "border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <span>Citizen Reports</span>
            {light.relatedComplaints?.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-center font-bold">
                {light.relatedComplaints.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === "history"
                ? "border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Maintenance Logs
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "telemetry" && (
            <div>
              {/* Telemetry Quick Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Power Consumption</span>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{light.powerConsumption} W</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Nominal: 120W</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Operating Temp</span>
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-rose-500" />
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{light.temperature} °C</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Safe: &lt; 45°C</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">ON/OFF Cycles</span>
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{light.onOffCyclesToday} / day</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Nominal: 1-2</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Brightness Output</span>
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{light.brightnessLevel} %</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Target: 95-100%</span>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">14-Cycle Operational Telemetry Trend</h4>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <span className="w-3 h-0.5 bg-amber-500"></span> Power (Watts)
                    </span>
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <span className="w-3 h-0.5 bg-rose-500"></span> Temperature (°C)
                    </span>
                  </div>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }} />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #cbd5e1", backgroundColor: isDark ? "#0f172a" : "#ffffff", color: isDark ? "#ffffff" : "#000000" }} />
                      <Line type="monotone" dataKey="power" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} name="Power (W)" />
                      <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Temp (°C)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai-analysis" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">AI Predictive Health Index</span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{light.riskLevel} Risk of Future Failure</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-lg">
                    Predictive algorithm continuously evaluates electrical stability, thermal stress, switching rate, and lumen decay.
                  </p>
                </div>
                <HealthGauge score={light.healthScore} size={84} />
              </div>

              {/* Explainable Reasons */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Why is this Streetlight evaluated at this score?
                </h4>
                <div className="space-y-2">
                  {light.reasons?.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">Recommended Maintenance Action</h4>
                  <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100 mt-0.5">{light.recommendedAction}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "complaints" && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Citizen Complaints for {light.id}</h4>
              {(!light.relatedComplaints || light.relatedComplaints.length === 0) ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">No citizen complaints reported for this streetlight.</p>
              ) : (
                light.relatedComplaints.map(c => (
                  <div key={c.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{c.id}</span>
                        <ComplaintStatusBadge status={c.status} />
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(c.submittedDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Problem: {c.problemType}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">"{c.description}"</p>

                    {/* Photo attached */}
                    {c.imageUrl && (
                      <div className="pt-2 flex items-center gap-3">
                        <img
                          src={c.imageUrl}
                          alt="Citizen photo"
                          className="w-16 h-12 object-cover rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
                          onClick={() => setModalImage(c.imageUrl)}
                        />
                        <button
                          type="button"
                          onClick={() => setModalImage(c.imageUrl)}
                          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Uploaded Photo
                        </button>
                      </div>
                    )}

                    {c.adminResponse && (
                      <div className="text-xs bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        <strong>Admin Note:</strong> {c.adminResponse}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Historical Incidents & Resolutions</h4>
              {(!light.failureHistory || light.failureHistory.length === 0) ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">No previous failure incidents recorded for this streetlight.</p>
              ) : (
                light.failureHistory.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{f.issue}</span>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">Resolved by: {f.resolvedBy}</p>
                    </div>
                    <span className="font-medium text-slate-400 dark:text-slate-500">{f.date}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Installation: {light.installDate} • Luminaire: {light.lampType}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" onClick={() => setModalImage(null)}>
          <div className="relative max-w-3xl max-h-[85vh] bg-slate-900 rounded-3xl p-3 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={modalImage} alt="Full Size Evidence" className="max-h-[80vh] w-auto rounded-2xl object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};
