import React from "react";
import { SLAActionCenter } from "../../components/SLAActionCenter";

export const MaintenanceManagement = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          AI Failure Triage & Service Lead (SL) Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Manage AI-detected streetlight anomalies, inspect auto-predicted Service Leads (SL), and confirm maintenance resolution.
        </p>
      </div>

      {/* Main Interactive Action Center */}
      <SLAActionCenter />
    </div>
  );
};
