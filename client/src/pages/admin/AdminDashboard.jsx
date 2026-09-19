import React, { useState } from "react";
import { 
  Lightbulb, 
  CheckCircle2, 
  AlertOctagon, 
  Activity,
  ShieldCheck
} from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import { MetricCard } from "../../components/MetricCard";
import { AIHeroCard } from "../../components/AIHeroCard";
import { MaintenancePriorityCard } from "../../components/MaintenancePriorityCard";
import { CityMapView } from "../../components/CityMapView";
import { StreetlightDetailModal } from "../../components/StreetlightDetailModal";

export const AdminDashboard = ({ onNavigate }) => {
  const { summary, spotlight, streetlights } = useSimulation();
  const [modalLight, setModalLight] = useState(null);

  const handleInspect = (light) => {
    setModalLight(light);
  };

  const handleAssignMaintenance = (light) => {
    if (light) setModalLight(light);
    else onNavigate("complaints");
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Central AI Risk Operations & Infrastructure Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time telemetry monitoring, AI failure predictions, explainable risk scores, and citizen defect management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("streetlights")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>View All Streetlights</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Streetlights"
          value={summary?.total || 24}
          subtitle="100% telemetry online"
          icon={Lightbulb}
          color="blue"
          onClick={() => onNavigate("streetlights")}
        />

        <MetricCard
          title="Working Normally"
          value={summary?.healthy || 19}
          subtitle="Green • Optimal State"
          icon={CheckCircle2}
          color="green"
        />

        <MetricCard
          title="AI Failure Predictions"
          value={summary?.activeFailuresCount !== undefined ? summary.activeFailuresCount : 3}
          subtitle="High/Medium AI Risk"
          icon={AlertOctagon}
          color="red"
          onClick={() => onNavigate("ai-predictions")}
        />

        <MetricCard
          title="Resolved Today"
          value={summary?.resolvedToday !== undefined ? summary.resolvedToday : 0}
          subtitle="Maintenance Restored"
          icon={ShieldCheck}
          color="teal"
        />

        <MetricCard
          title="Overall System Risk"
          value={`${summary?.overallRiskScore !== undefined ? summary.overallRiskScore : 32}%`}
          subtitle="Dynamic Risk Index"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* AI Predicted Failure Spotlight Hero Card */}
      <AIHeroCard
        spotlight={spotlight}
        onInspect={handleInspect}
        onAssignMaintenance={handleAssignMaintenance}
      />

      {/* Priority List & Citywide Grid Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <MaintenancePriorityCard
            streetlights={streetlights}
            onSelectLight={handleInspect}
          />
        </div>

        <div className="lg:col-span-7">
          <CityMapView
            streetlights={streetlights}
            onSelectLight={handleInspect}
          />
        </div>
      </div>

      {/* Modal Inspector */}
      {modalLight && (
        <StreetlightDetailModal
          light={modalLight}
          onClose={() => setModalLight(null)}
        />
      )}
    </div>
  );
};
