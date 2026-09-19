import React from "react";
import { RotateCcw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSimulation } from "../../context/SimulationContext";

export const AdminProfile = () => {
  const { user } = useAuth();
  const { summary, simulationState, resetDemoData } = useSimulation();

  return (
    <div className="max-w-4xl space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Admin Profile & System Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Municipal administrator configuration and platform diagnostics.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-200">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            ADM
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              {user?.department || "Central Smart Infrastructure Command"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 dark:text-slate-500 block mb-1">Active AI Simulation Cycle</span>
            <strong className="text-base text-slate-900 dark:text-white">Day {simulationState.cycle}</strong>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 dark:text-slate-500 block mb-1">Total Monitored Smart Luminaires</span>
            <strong className="text-base text-slate-900 dark:text-white">{summary.total} Connected Poles</strong>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Reset Demo Database</h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Restore all streetlights, complaints, and predictions to default college demo state.</p>
          </div>
          <button
            onClick={resetDemoData}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
