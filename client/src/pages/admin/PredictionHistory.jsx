import React, { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  Search, 
  Filter, 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  Wrench,
  ChevronRight
} from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import { RiskBadge } from "../../components/StatusBadges";

export const PredictionHistory = () => {
  const { predictionsHistory, complaints } = useSimulation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLightId, setSelectedLightId] = useState("all");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("all");
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  // Extract unique streetlight IDs for filter dropdown
  const streetlightOptions = useMemo(() => {
    const set = new Set(predictionsHistory.map(p => p.streetlightId));
    return Array.from(set).sort();
  }, [predictionsHistory]);

  // Filter prediction history
  const filteredPredictions = useMemo(() => {
    return predictionsHistory.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = (
        item.streetlightId.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.predictedProblem.toLowerCase().includes(q) ||
        (item.cycle && item.cycle.toLowerCase().includes(q)) ||
        (item.date && item.date.toLowerCase().includes(q))
      );

      const matchesLight = selectedLightId === "all" || item.streetlightId === selectedLightId;
      const matchesRisk = selectedRiskLevel === "all" || item.riskLevel.toLowerCase() === selectedRiskLevel.toLowerCase();

      return matchesSearch && matchesLight && matchesRisk;
    });
  }, [predictionsHistory, searchTerm, selectedLightId, selectedRiskLevel]);

  // Find citizen complaints correlated with selected modal prediction
  const correlatedComplaints = useMemo(() => {
    if (!selectedPrediction) return [];
    return complaints.filter(c => c.streetlightId === selectedPrediction.streetlightId);
  }, [selectedPrediction, complaints]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          AI Prediction History
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Historical log of AI failure predictions, computed health/risk scores, and recommended actions.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, location, or predicted problem..."
            className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Streetlight Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Streetlight:</span>
            <select
              value={selectedLightId}
              onChange={(e) => setSelectedLightId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Streetlights</option>
              {streetlightOptions.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Risk Level:</span>
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prediction History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Cycle & Date</th>
                <th className="py-3.5 px-4">Streetlight ID</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Health & Risk</th>
                <th className="py-3.5 px-4">AI Predicted Problem</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4 text-right">Action / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
              {filteredPredictions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No prediction history matching the filters.
                  </td>
                </tr>
              ) : (
                filteredPredictions.map(item => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedPrediction(item)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      <div>{item.cycle}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        {item.date} {item.time && `• ${item.time}`}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-brand-600 dark:text-brand-400">
                      {item.streetlightId}
                    </td>

                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                      {item.location}
                    </td>

                    <td className="py-4 px-4 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">{item.healthScore}% H</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-rose-600 dark:text-rose-400 font-black">{item.riskScore}% R</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {item.predictedProblem}
                    </td>

                    <td className="py-4 px-4">
                      <RiskBadge risk={item.riskLevel} size="sm" />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-bold hover:underline">
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Prediction View Modal */}
      {selectedPrediction && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPrediction(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-black border border-brand-200 dark:border-brand-800">
                    {selectedPrediction.id}
                  </span>
                  <RiskBadge risk={selectedPrediction.riskLevel} size="sm" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {selectedPrediction.streetlightId} — {selectedPrediction.location}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Logged on {selectedPrediction.date} ({selectedPrediction.cycle}) {selectedPrediction.time && `at ${selectedPrediction.time}`}
                </p>
              </div>

              <button
                onClick={() => setSelectedPrediction(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Health & Risk Gauge */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-center p-2">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Health Index</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {selectedPrediction.healthScore}%
                </span>
              </div>
              <div className="text-center p-2 border-l border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Computed Risk</span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {selectedPrediction.riskScore}%
                </span>
              </div>
            </div>

            {/* AI Diagnosis & Reasons */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                Why AI Flagged It
              </h4>
              <ul className="space-y-2">
                {selectedPrediction.reasons && selectedPrediction.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Action */}
            <div className="bg-brand-50/60 dark:bg-brand-950/40 p-4 rounded-2xl border border-brand-200/60 dark:border-brand-800/60 space-y-1">
              <span className="text-[11px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Recommended Maintenance Action
              </span>
              <p className="text-xs font-semibold text-brand-900 dark:text-brand-200">
                {selectedPrediction.recommendedAction}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPrediction(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
