import React, { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import { HealthBadge, RiskBadge } from "../../components/StatusBadges";
import { StreetlightDetailModal } from "../../components/StreetlightDetailModal";

export const StreetlightsList = () => {
  const { streetlights } = useSimulation();
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");
  const [modalLight, setModalLight] = useState(null);

  const filtered = streetlights.filter(light => {
    const matchesSearch = 
      light.id.toLowerCase().includes(search.toLowerCase()) ||
      light.name.toLowerCase().includes(search.toLowerCase()) ||
      light.location.toLowerCase().includes(search.toLowerCase()) ||
      light.zone.toLowerCase().includes(search.toLowerCase());

    const matchesZone = selectedZone === "all" || light.zone.toLowerCase() === selectedZone.toLowerCase();
    const matchesStatus = selectedStatus === "all" || light.currentStatus.toLowerCase() === selectedStatus.toLowerCase();
    const matchesRisk = selectedRisk === "all" || light.riskLevel.toLowerCase() === selectedRisk.toLowerCase();

    return matchesSearch && matchesZone && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Streetlight Registry</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Complete list of 24 connected luminaires with health scores and predictive risk indicators.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between transition-colors duration-200">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Pole ID, location, district..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Districts</option>
            <option value="North District">North District</option>
            <option value="South District">South District</option>
            <option value="East District">East District</option>
            <option value="West District">West District</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Conditions</option>
            <option value="Working Normally">Working Normally</option>
            <option value="Needs Attention">Needs Attention</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All AI Risks</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Tabular List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap">Streetlight ID</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Location & District</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Current Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Health Score</th>
                <th className="py-3.5 px-4 whitespace-nowrap">AI Failure Risk</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Telemetry</th>
                <th className="py-3.5 px-4">Predicted Problem</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Maintenance</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No streetlights found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(light => (
                  <tr
                    key={light.id}
                    onClick={() => setModalLight(light)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                        <span>{light.id}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{light.location}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{light.zone}</div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <HealthBadge score={light.healthScore} status={light.currentStatus} size="sm" />
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">{light.healthScore} / 100</div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <RiskBadge risk={light.riskLevel} size="sm" />
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-amber-600 dark:text-amber-400 font-bold">{light.powerConsumption}W</span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">{light.temperature}°C</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300 font-medium" title={light.predictedProblem}>
                      {light.predictedProblem}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        light.maintenanceStatus === "Resolved"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : light.maintenanceStatus === "Maintenance Assigned"
                          ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                          : light.maintenanceStatus === "Under Review"
                          ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}>
                        {light.maintenanceStatus || "None"}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalLight(light);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-slate-900 dark:group-hover:bg-brand-600 group-hover:text-white transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
